"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Image from "next/image";
import { usePermission } from "@/components/providers/auth-provider";
import { ProductFormModal } from "./product-form-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
  Image as LucideImage,
  Printer,
  Star,
  Wallet,
  Package,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isMain: boolean;
  sortOrder: number;
}

interface ProductDto {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  quantity: number;
  trackQuantity: boolean;
  lowStockThreshold: number;
  deliveryTime: string | null;
  weight: number | null;
  dimensions: string | null;
  allowCustomPrint: boolean;
  printPrice: number | null;
  status: ProductStatus;
  isActive: boolean;
  isFeatured: boolean;
  isLowBudget: boolean;
  categoryId: string;
  categoryName: string;
  seoTitle: string | null;
  seoDescription: string | null;
  metaKeywords: string | null;
  images: ProductImage[];
  createdAt: string;
}

const STATUS_COLORS: Record<ProductStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-800 border-gray-200",
  ACTIVE: "bg-green-100 text-green-800 border-green-200",
  INACTIVE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ARCHIVED: "bg-red-100 text-red-800 border-red-200",
};

async function fetchProducts(search: string, status: string, categoryId: string): Promise<{ data: ProductDto[] }> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  if (categoryId) params.set("categoryId", categoryId);
  const res = await fetch(`/api/admin/products?${params}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

async function fetchCategories(): Promise<{ data: { id: string; name: string; slug: string }[] }> {
  const res = await fetch("/api/admin/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

async function deleteProductApi(id: string) {
  const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete product");
}

export function ProductsClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductDto | null>(null);

  const canCreate = usePermission("products.create");
  const canUpdate = usePermission("products.update");
  const canDelete = usePermission("products.delete");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-products", search, statusFilter, categoryFilter],
    queryFn: () => fetchProducts(search, statusFilter, categoryFilter),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories-list"],
    queryFn: fetchCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted");
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function handleEdit(product: ProductDto) {
    setEditingProduct(product);
    setModalOpen(true);
  }

  function handleCreate() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  const mainImage = (product: ProductDto) =>
    product.images.find((i) => i.isMain)?.url ?? product.images[0]?.url;

  const products = data?.data ?? [];
  const activeCount = products.filter((p) => p.status === "ACTIVE").length;
  const lowStockCount = products.filter(
    (p) => p.trackQuantity && p.quantity <= p.lowStockThreshold
  ).length;
  const featuredCount = products.filter((p) => p.isFeatured).length;

  return (
    <>
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2"><Package className="size-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold">{products.length}</p>
              <p className="text-xs text-muted-foreground">Total Products</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2"><Package className="size-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2"><AlertTriangle className="size-5 text-amber-600" /></div>
            <div>
              <p className="text-2xl font-bold">{lowStockCount}</p>
              <p className="text-xs text-muted-foreground">Low Stock</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2"><Star className="size-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold">{featuredCount}</p>
              <p className="text-xs text-muted-foreground">Featured</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === "ALL" ? "" : v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              {(["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"] as ProductStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v === "ALL" ? "" : v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {categoriesData?.data.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Button onClick={handleCreate}>
              <Plus className="size-4" /> New Product
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>Failed to load products.</AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Options</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-16" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !products.length ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} className="group">
                    <TableCell>
                      {mainImage(product) ? (
                        <Image
                          src={mainImage(product)!}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="size-10 rounded object-cover"
                        />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded bg-muted">
                          <LucideImage className="size-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {product.isFeatured && (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] px-1.5 py-0 gap-0.5">
                              <Star className="size-2.5" /> Featured
                            </Badge>
                          )}
                          {product.isLowBudget && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 gap-0.5">
                              <Wallet className="size-2.5" /> Budget
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{product.sku}</TableCell>
                    <TableCell className="text-sm">{product.categoryName}</TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="font-medium">₦{Number(product.price).toLocaleString()}</p>
                        {product.comparePrice && (
                          <p className="text-xs text-muted-foreground line-through">
                            ₦{Number(product.comparePrice).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {product.trackQuantity ? (
                        <Badge variant={product.quantity <= product.lowStockThreshold ? "destructive" : "outline"}>
                          {product.quantity}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">∞</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {product.allowCustomPrint && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0 gap-0.5">
                            <Printer className="size-2.5" />
                            {product.printPrice ? `₦${Number(product.printPrice).toLocaleString()}` : "Print"}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_COLORS[product.status]}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {canUpdate && (
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                            <Pencil className="size-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(product)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); setEditingProduct(null); } }}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Create Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? `Editing: ${editingProduct.name}` : "Add a new product to your catalog"}
            </DialogDescription>
          </DialogHeader>
          <ProductFormModal
            product={editingProduct}
            categories={categoriesData?.data ?? []}
            onClose={() => { setModalOpen(false); setEditingProduct(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot be undone.
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
