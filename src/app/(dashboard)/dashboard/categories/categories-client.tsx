"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { usePermission } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Pencil,
  Trash2,
  FolderTree,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
}

interface CategoryTreeDto extends CategoryDto {
  children: CategoryTreeDto[];
  productCount?: number;
}

async function fetchCategoryTree(): Promise<{ data: CategoryTreeDto[] }> {
  const res = await fetch("/api/admin/categories?format=tree");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

async function fetchFlatCategories(): Promise<{ data: CategoryDto[] }> {
  const res = await fetch("/api/admin/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

async function createCategoryApi(data: Record<string, unknown>) {
  const res = await fetch("/api/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create category");
  }
  return res.json();
}

async function updateCategoryApi(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to update category");
  }
  return res.json();
}

async function deleteCategoryApi(id: string) {
  const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to delete category");
  }
}

export function CategoriesClient() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryDto | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const canCreate = usePermission("categories.create");
  const canUpdate = usePermission("categories.update");
  const canDelete = usePermission("categories.delete");

  const { data: treeData, isLoading, error } = useQuery({
    queryKey: ["admin-categories-tree"],
    queryFn: fetchCategoryTree,
  });

  const { data: flatData } = useQuery({
    queryKey: ["admin-categories-flat"],
    queryFn: fetchFlatCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories-tree"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories-flat"] });
      toast.success("Category deleted");
      setDeleteTarget(null);
      setDeleteError("");
    },
    onError: (err: Error) => {
      setDeleteError(err.message);
      toast.error(err.message);
    },
  });

  function handleCreate() {
    setEditingCategory(null);
    setModalOpen(true);
  }

  function handleEdit(category: CategoryDto) {
    setEditingCategory(category);
    setModalOpen(true);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FolderTree className="size-4" />
          <span className="text-sm">{flatData?.data.length ?? 0} categories total</span>
        </div>
        {canCreate && (
          <Button onClick={handleCreate}>
            <Plus className="size-4" /> New Category
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>Failed to load categories.</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : !treeData?.data.length ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
            No categories yet. Create your first category to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {treeData.data.map((category) => (
            <CategoryNode
              key={category.id}
              category={category}
              depth={0}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); setEditingCategory(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update category details" : "Add a new category"}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            category={editingCategory}
            allCategories={flatData?.data ?? []}
            onClose={() => { setModalOpen(false); setEditingCategory(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteError(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <Alert variant="destructive">
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
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

function CategoryNode({
  category,
  depth,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: {
  category: CategoryTreeDto;
  depth: number;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (c: CategoryDto) => void;
  onDelete: (c: CategoryDto) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children.length > 0;

  return (
    <div style={{ marginLeft: depth * 24 }}>
      <Card className="transition-shadow hover:shadow-sm">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {hasChildren ? (
              <button
                onClick={() => setExpanded(!expanded)}
                className="rounded p-0.5 hover:bg-muted"
              >
                <ChevronRight
                  className={`size-4 text-muted-foreground transition-transform ${
                    expanded ? "rotate-90" : ""
                  }`}
                />
              </button>
            ) : (
              <span className="w-5" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{category.name}</span>
                <Badge variant={category.isActive ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                  {category.isActive ? "Active" : "Inactive"}
                </Badge>
                {category.productCount !== undefined && category.productCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {category.productCount} products
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">/{category.slug}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {canUpdate && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
                <Pencil className="size-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(category)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      {hasChildren && expanded && (
        <div className="mt-2 space-y-2">
          {category.children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              depth={depth + 1}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryForm({
  category,
  allCategories,
  onClose,
}: {
  category: CategoryDto | null;
  allCategories: CategoryDto[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEditing = !!category;

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [image, setImage] = useState(category?.image ?? "");
  const [parentId, setParentId] = useState(category?.parentId ?? "");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(category?.sortOrder?.toString() ?? "0");
  const [seoTitle, setSeoTitle] = useState(category?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(category?.seoDescription ?? "");
  const [formError, setFormError] = useState("");

  // Filter out the category itself and its descendants for parent selection
  const parentOptions = allCategories.filter((c) => c.id !== category?.id);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      isEditing ? updateCategoryApi(category!.id, data) : createCategoryApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories-tree"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories-flat"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories-list"] });
      toast.success(isEditing ? "Category updated" : "Category created");
      onClose();
    },
    onError: (err: Error) => {
      setFormError(err.message);
      toast.error(err.message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!name.trim()) { setFormError("Name is required"); return; }

    const data: Record<string, unknown> = {
      name: name.trim(),
      isActive,
      sortOrder: parseInt(sortOrder) || 0,
    };

    if (slug.trim()) data.slug = slug.trim();
    if (description.trim()) data.description = description.trim();
    if (image.trim()) data.image = image.trim();
    if (parentId) data.parentId = parentId;
    if (seoTitle.trim()) data.seoTitle = seoTitle.trim();
    if (seoDescription.trim()) data.seoDescription = seoDescription.trim();

    mutation.mutate(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="catName">Name *</Label>
        <Input id="catName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="catSlug">Slug</Label>
          <Input id="catSlug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="catParent">Parent Category</Label>
          <Select value={parentId || "NONE"} onValueChange={(v) => setParentId(v === "NONE" ? "" : v)}>
            <SelectTrigger id="catParent"><SelectValue placeholder="None (root)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">None (root)</SelectItem>
              {parentOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="catDesc">Description</Label>
        <Textarea id="catDesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Category description" rows={2} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="catImage">Image URL</Label>
        <Input id="catImage" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="catSort">Sort Order</Label>
          <Input id="catSort" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 pt-7">
          <Switch id="catActive" checked={isActive} onCheckedChange={setIsActive} />
          <Label htmlFor="catActive">Active</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="catSeoTitle">SEO Title</Label>
        <Input id="catSeoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO title" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="catSeoDesc">SEO Description</Label>
        <Textarea id="catSeoDesc" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="SEO description" rows={2} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : isEditing ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
