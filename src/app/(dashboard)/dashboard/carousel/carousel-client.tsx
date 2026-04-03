"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Presentation,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";

type SlideType = "homepage" | "product" | "category";

interface CarouselSlide {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  type: SlideType;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface SlideFormData {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  type: SlideType;
  sortOrder: number;
}

const TYPE_LABELS: Record<SlideType, string> = {
  homepage: "Homepage",
  product: "Product",
  category: "Category",
};

const TYPE_COLORS: Record<SlideType, string> = {
  homepage: "bg-blue-100 text-blue-800 border-blue-200",
  product: "bg-purple-100 text-purple-800 border-purple-200",
  category: "bg-amber-100 text-amber-800 border-amber-200",
};

// ── API helpers ──────────────────────────────────────────────

async function fetchSlides(): Promise<{ data: CarouselSlide[] }> {
  const res = await fetch("/api/admin/carousel");
  if (!res.ok) throw new Error("Failed to fetch slides");
  return res.json();
}

async function createSlideApi(data: SlideFormData) {
  const res = await fetch("/api/admin/carousel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error ?? "Failed to create slide");
  }
  return res.json();
}

async function updateSlideApi({ id, ...data }: SlideFormData & { id: string }) {
  const res = await fetch(`/api/admin/carousel/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error ?? "Failed to update slide");
  }
  return res.json();
}

async function deleteSlideApi(id: string) {
  const res = await fetch(`/api/admin/carousel/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete slide");
}

async function toggleSlideApi({ id, isActive }: { id: string; isActive: boolean }) {
  const res = await fetch(`/api/admin/carousel/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) throw new Error("Failed to toggle slide");
  return res.json();
}

// ── Helpers ──────────────────────────────────────────────────

function toInputDate(iso: string) {
  return iso ? new Date(iso).toISOString().slice(0, 16) : "";
}

const defaultForm: SlideFormData = {
  title: "",
  description: "",
  imageUrl: "",
  link: "",
  startDate: "",
  endDate: "",
  isActive: true,
  type: "homepage",
  sortOrder: 0,
};

// ── Component ────────────────────────────────────────────────

export function CarouselClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CarouselSlide | null>(null);
  const [form, setForm] = useState<SlideFormData>(defaultForm);
  const [formError, setFormError] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-carousel"],
    queryFn: fetchSlides,
  });

  const createMutation = useMutation({
    mutationFn: createSlideApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-carousel"] });
      toast.success("Slide created successfully");
      closeModal();
    },
    onError: (err: Error) => {
      setFormError(err.message);
      toast.error(err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSlideApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-carousel"] });
      toast.success("Slide updated successfully");
      closeModal();
    },
    onError: (err: Error) => {
      setFormError(err.message);
      toast.error(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSlideApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-carousel"] });
      toast.success("Slide deleted");
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: toggleSlideApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-carousel"] });
      toast.success("Slide visibility updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function openCreate() {
    setEditingSlide(null);
    setForm(defaultForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(slide: CarouselSlide) {
    setEditingSlide(slide);
    setForm({
      title: slide.title,
      description: slide.description,
      imageUrl: slide.imageUrl,
      link: slide.link ?? "",
      startDate: toInputDate(slide.startDate),
      endDate: toInputDate(slide.endDate),
      isActive: slide.isActive,
      type: slide.type,
      sortOrder: slide.sortOrder,
    });
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingSlide(null);
    setForm(defaultForm);
    setFormError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!form.title.trim()) return setFormError("Title is required");
    if (!form.imageUrl.trim()) return setFormError("Image URL is required");
    if (!form.startDate || !form.endDate) return setFormError("Start and end dates are required");

    if (editingSlide) {
      updateMutation.mutate({ ...form, id: editingSlide.id });
    } else {
      createMutation.mutate(form);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  // filter slides
  const slides = (data?.data ?? []).filter((s) => {
    const matchesSearch =
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || s.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const activeCount = (data?.data ?? []).filter((s) => s.isActive).length;
  const totalCount = data?.data?.length ?? 0;

  return (
    <>
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Presentation className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCount}</p>
              <p className="text-xs text-muted-foreground">Total Slides</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <Eye className="size-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-gray-50 p-2">
              <EyeOff className="size-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCount - activeCount}</p>
              <p className="text-xs text-muted-foreground">Inactive</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search slides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v === "ALL" ? "" : v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Slide Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {(["homepage", "product", "category"] as SlideType[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> New Slide
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>Failed to load carousel slides.</AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <GripVertical className="size-4 text-muted-foreground" />
                </TableHead>
                <TableHead className="w-16"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !slides.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No carousel slides found.
                  </TableCell>
                </TableRow>
              ) : (
                slides.map((slide) => (
                  <TableRow key={slide.id} className="group">
                    <TableCell className="text-muted-foreground text-sm font-mono">
                      {slide.sortOrder}
                    </TableCell>
                    <TableCell>
                      {slide.imageUrl ? (
                        <Image
                          src={slide.imageUrl}
                          alt={slide.title}
                          width={56}
                          height={32}
                          className="w-14 h-8 rounded object-cover"
                        />
                      ) : (
                        <div className="flex w-14 h-8 items-center justify-center rounded bg-muted">
                          <ImageIcon className="size-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{slide.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {slide.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={TYPE_COLORS[slide.type]}>
                        {TYPE_LABELS[slide.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        <p>{new Date(slide.startDate).toLocaleDateString()}</p>
                        <p>→ {new Date(slide.endDate).toLocaleDateString()}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={slide.isActive}
                        onCheckedChange={(checked) =>
                          toggleMutation.mutate({ id: slide.id, isActive: checked })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(slide)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(slide)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSlide ? "Edit Slide" : "New Slide"}</DialogTitle>
            <DialogDescription>
              {editingSlide
                ? `Editing: ${editingSlide.title}`
                : "Create a new carousel slide for the storefront."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Spring Sale Banner"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the promotional slide..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/banner.jpg"
              />
              {form.imageUrl && (
                <div className="relative h-32 rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src={form.imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link (optional)</Label>
              <Input
                id="link"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="/products/spring-collection"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Slide Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as SlideType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["homepage", "product", "category"] as SlideType[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? editingSlide
                    ? "Saving..."
                    : "Creating..."
                  : editingSlide
                    ? "Save Changes"
                    : "Create Slide"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Slide</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
