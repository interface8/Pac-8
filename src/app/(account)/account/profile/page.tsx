"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AccountShell } from "@/components/account/AccountShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  User,
  Camera,
  Trash2,
  Pencil,
  Check,
  X,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

interface Profile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit name state
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Edit phone state
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

  // Avatar state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deleteAvatarOpen, setDeleteAvatarOpen] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadProfile() {
    try {
      const res = await fetch("/api/account/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.data);
      } else {
        toast.error("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  // ── Name editing ──────────────────────────────────────
  function startEditName() {
    setNameValue(profile?.name ?? "");
    setEditingName(true);
  }

  function cancelEditName() {
    setEditingName(false);
    setNameValue("");
  }

  async function saveName() {
    if (!nameValue.trim() || nameValue.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameValue.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.data);
        setEditingName(false);
        toast.success("Name updated");
      } else {
        const err = await res.json();
        toast.error(err.message ?? "Failed to update name");
      }
    } finally {
      setSavingName(false);
    }
  }

  // ── Phone editing ─────────────────────────────────────
  function startEditPhone() {
    setPhoneValue(profile?.phone ?? "");
    setEditingPhone(true);
  }

  function cancelEditPhone() {
    setEditingPhone(false);
    setPhoneValue("");
  }

  async function savePhone() {
    const cleaned = phoneValue.trim().replace(/[\s()-]/g, "");
    if (!/^\+?[0-9]{7,15}$/.test(cleaned)) {
      toast.error("Enter a valid phone number (7-15 digits)");
      return;
    }
    setSavingPhone(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneValue.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.data);
        setEditingPhone(false);
        toast.success("Phone number updated");
      } else {
        const err = await res.json();
        toast.error(err.message ?? "Failed to update phone number");
      }
    } finally {
      setSavingPhone(false);
    }
  }

  // ── Avatar upload ─────────────────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP, or GIF images allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append("avatar", file);
      const res = await fetch("/api/account/avatar", {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        const data = await res.json();
        setProfile((p) => (p ? { ...p, image: data.data.imageUrl } : p));
        toast.success("Profile picture updated");
      } else {
        const err = await res.json();
        toast.error(err.message ?? "Failed to upload image");
      }
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteAvatar() {
    setDeletingAvatar(true);
    try {
      const res = await fetch("/api/account/avatar", { method: "DELETE" });
      if (res.ok) {
        setProfile((p) => (p ? { ...p, image: null } : p));
        setDeleteAvatarOpen(false);
        toast.success("Profile picture removed");
      } else {
        const err = await res.json();
        toast.error(err.message ?? "Failed to remove picture");
      }
    } finally {
      setDeletingAvatar(false);
    }
  }

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-NG", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <AccountShell title="My Profile" description="Manage your personal information and profile picture.">
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : !profile ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Failed to load profile. Please refresh the page.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* ── Avatar card ───────────────────────────── */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                Profile Picture
              </h2>
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="size-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                    {profile.image ? (
                      <Image
                        src={profile.image}
                        alt={profile.name ?? "Profile"}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <User className="size-10 text-muted-foreground/50" />
                    )}
                  </div>
                  {/* Camera overlay */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-1 -right-1 size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                    aria-label="Upload profile picture"
                  >
                    <Camera className="size-4" />
                  </button>
                </div>

                {/* Info + actions */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg truncate">{profile.name || "No name set"}</p>
                  <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
                  {memberSince && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="size-3" /> Member since {memberSince}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                    </Button>
                    {profile.image && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteAvatarOpen(true)}
                        disabled={uploadingAvatar}
                      >
                        <Trash2 className="size-3.5 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPEG, PNG, WebP or GIF · Max 5 MB
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </CardContent>
          </Card>

          {/* ── Personal info card ────────────────────── */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Personal Information
              </h2>

              <Separator />

              {/* Name */}
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <Label className="text-xs text-muted-foreground mb-1 block">Full Name</Label>
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        className="h-9"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveName();
                          if (e.key === "Escape") cancelEditName();
                        }}
                      />
                      <Button
                        size="icon"
                        variant="default"
                        className="size-9 shrink-0"
                        onClick={saveName}
                        disabled={savingName}
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-9 shrink-0"
                        onClick={cancelEditName}
                        disabled={savingName}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium">{profile.name || <span className="text-muted-foreground italic">Not set</span>}</p>
                  )}
                </div>
                {!editingName && (
                  <Button size="sm" variant="ghost" onClick={startEditName} className="mt-4 shrink-0">
                    <Pencil className="size-3.5 mr-1" /> Edit
                  </Button>
                )}
              </div>

              <Separator />

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Mail className="size-3" /> Email Address
                  </Label>
                  <p className="text-sm font-medium">{profile.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Email cannot be changed here. Contact support if needed.</p>
                </div>
              </div>

              <Separator />

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Phone className="size-3" /> Phone Number
                  </Label>
                  {editingPhone ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={phoneValue}
                        onChange={(e) => setPhoneValue(e.target.value)}
                        className="h-9"
                        placeholder="+234 800 000 0000"
                        type="tel"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") savePhone();
                          if (e.key === "Escape") cancelEditPhone();
                        }}
                      />
                      <Button
                        size="icon"
                        variant="default"
                        className="size-9 shrink-0"
                        onClick={savePhone}
                        disabled={savingPhone}
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-9 shrink-0"
                        onClick={cancelEditPhone}
                        disabled={savingPhone}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium">
                      {profile.phone || <span className="text-muted-foreground italic">Not set</span>}
                    </p>
                  )}
                </div>
                {!editingPhone && (
                  <Button size="sm" variant="ghost" onClick={startEditPhone} className="mt-4 shrink-0">
                    <Pencil className="size-3.5 mr-1" />
                    {profile.phone ? "Change" : "Add"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete avatar confirmation */}
      <AlertDialog open={deleteAvatarOpen} onOpenChange={setDeleteAvatarOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Profile Picture</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your profile picture?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAvatar}
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deletingAvatar}
            >
              {deletingAvatar ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AccountShell>
  );
}
