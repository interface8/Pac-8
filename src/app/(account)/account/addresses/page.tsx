"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AccountShell } from "@/components/account/AccountShell";
import { Plus, Pencil, Trash2, MapPin, Star } from "lucide-react";
import { toast } from "sonner";

interface Address {
  id: string;
  type: "SHIPPING" | "BILLING";
  firstName: string;
  lastName: string;
  company: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
}

interface AddressForm {
  type: "SHIPPING" | "BILLING";
  firstName: string;
  lastName: string;
  company: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const emptyForm: AddressForm = {
  type: "SHIPPING",
  firstName: "",
  lastName: "",
  company: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "Nigeria",
  phone: "",
  isDefault: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(address: Address) {
    setEditingId(address.id);
    setForm({
      type: address.type,
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company ?? "",
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? "",
      city: address.city,
      state: address.state,
      country: address.country,
      phone: address.phone ?? "",
      isDefault: address.isDefault,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    if (!form.addressLine1.trim()) {
      toast.error("Address line 1 is required");
      return;
    }
    if (!form.city.trim() || !form.state.trim()) {
      toast.error("City and state are required");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/addresses/${editingId}` : "/api/addresses";
      const method = editingId ? "PATCH" : "POST";

      const payload = {
        type: form.type,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        company: form.company.trim() || undefined,
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        phone: form.phone.trim() || undefined,
        isDefault: form.isDefault,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingId ? "Address updated" : "Address added");
        setModalOpen(false);
        load();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message ?? "Failed to save address");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/addresses/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Address deleted");
        setDeleteTarget(null);
        load();
      } else {
        toast.error("Failed to delete address");
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleSetDefault(address: Address) {
    if (address.isDefault) return;
    setSettingDefault(address.id);
    try {
      const res = await fetch(`/api/addresses/${address.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        toast.success("Default address updated");
        load();
      } else {
        toast.error("Failed to set default address");
      }
    } finally {
      setSettingDefault(null);
    }
  }

  return (
    <AccountShell
      title="Addresses"
      description="Manage your shipping and billing addresses."
    >
      <div className="flex justify-end mb-6">
        <Button onClick={openCreate}>
          <Plus className="size-4 mr-1" /> Add Address
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : !addresses.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="mx-auto size-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No saved addresses yet.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={openCreate}
            >
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              className={`relative transition-all ${
                addr.isDefault ? "border-primary/40 bg-primary/5" : ""
              }`}
            >
              <CardContent className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs capitalize">
                      {addr.type.toLowerCase()}
                    </Badge>
                    {addr.isDefault && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                        Default
                      </Badge>
                    )}
                  </div>

                  {/* ✅ Always visible edit/delete buttons */}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(addr)}
                      aria-label="Edit address"
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(addr)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      aria-label="Delete address"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Address details */}
                <p className="text-sm font-medium">
                  {addr.firstName} {addr.lastName}
                </p>
                {addr.company && (
                  <p className="text-sm text-muted-foreground">{addr.company}</p>
                )}
                <p className="text-sm text-muted-foreground">{addr.addressLine1}</p>
                {addr.addressLine2 && (
                  <p className="text-sm text-muted-foreground">{addr.addressLine2}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {addr.city}, {addr.state}
                </p>
                <p className="text-sm text-muted-foreground">{addr.country}</p>
                {addr.phone && (
                  <p className="text-sm text-muted-foreground">{addr.phone}</p>
                )}

                {/* Set as default */}
                {!addr.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 h-7 text-xs text-muted-foreground hover:text-primary px-2"
                    onClick={() => handleSetDefault(addr)}
                    disabled={settingDefault === addr.id}
                  >
                    <Star className="size-3 mr-1" />
                    {settingDefault === addr.id ? "Setting..." : "Set as default"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Create / Edit Dialog ────────────────────────── */}
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) setModalOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Address" : "Add Address"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update your address details."
                : "Add a new shipping or billing address."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Address type */}
            <div className="space-y-2">
              <Label>Address Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm({ ...form, type: v as "SHIPPING" | "BILLING" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHIPPING">Shipping</SelectItem>
                  <SelectItem value="BILLING">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">Company (optional)</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) =>
                  setForm({ ...form, company: e.target.value })
                }
                placeholder="Acme Ltd."
              />
            </div>

            {/* Address lines */}
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1 *</Label>
              <Input
                id="addressLine1"
                value={form.addressLine1}
                onChange={(e) =>
                  setForm({ ...form, addressLine1: e.target.value })
                }
                placeholder="12 Solar Street"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2 (optional)</Label>
              <Input
                id="addressLine2"
                value={form.addressLine2}
                onChange={(e) =>
                  setForm({ ...form, addressLine2: e.target.value })
                }
                placeholder="Apartment, suite, etc."
              />
            </div>

            {/* City / State */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Lagos"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="Lagos"
                  required
                />
              </div>
            </div>

            {/* Country / Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                  placeholder="Nigeria"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>

            {/* Set as default */}
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="isDefault"
                checked={form.isDefault}
                onCheckedChange={(checked) =>
                  setForm({ ...form, isDefault: checked === true })
                }
              />
              <Label htmlFor="isDefault" className="cursor-pointer font-normal">
                Set as default address for this type
              </Label>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Address"
                  : "Add Address"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ─────────────────────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.addressLine1}
              </span>
              ? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AccountShell>
  );
}