"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Printer, Star, Wallet, Package, Search, Truck,
  ImageIcon, Trash2, CheckCircle2, Plus, X, Upload, Eye,
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

interface ProductView {
  id: string;
  productId: string;
  viewKey: string;
  name: string;
  baseImageUrl: string;
  description: string | null;
  sortOrder: number;
  isDefault: boolean;
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
  seoTitle: string | null;
  seoDescription: string | null;
  metaKeywords: string | null;
  images: ProductImage[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  product: ProductDto | null;
  categories: Category[];
  onClose: () => void;
}

async function createProduct(data: Record<string, unknown>) {
  const res = await fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create product");
  }
  return res.json();
}

async function updateProduct(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to update product");
  }
  return res.json();
}

async function addProductImage(
  productId: string,
  data: { url: string; altText?: string; isMain?: boolean; sortOrder?: number }
): Promise<ProductImage> {
  const res = await fetch(`/api/admin/products/${productId}/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to add image");
  }
  return res.json();
}

async function deleteProductImage(productId: string, imageId: string): Promise<void> {
  const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete image");
}

async function setMainProductImage(productId: string, imageId: string): Promise<void> {
  const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to update main image");
}

async function fetchProductViews(productId: string): Promise<ProductView[]> {
  const res = await fetch(`/api/admin/products/${productId}/views`);
  if (!res.ok) throw new Error("Failed to fetch views");
  const json = await res.json();
  return json.data ?? [];
}

async function addProductView(
  productId: string,
  data: { viewKey: string; name: string; baseImageUrl: string; description?: string; sortOrder?: number; isDefault?: boolean }
): Promise<ProductView> {
  const res = await fetch(`/api/admin/products/${productId}/views`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to add view");
  }
  const json = await res.json();
  return json.data;
}

async function deleteProductView(productId: string, viewId: string): Promise<void> {
  const res = await fetch(`/api/admin/products/${productId}/views/${viewId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete view");
}

async function updateProductView(
  productId: string,
  viewId: string,
  data: Partial<{ name: string; baseImageUrl: string; description: string | null; sortOrder: number; isDefault: boolean }>
): Promise<ProductView> {
  const res = await fetch(`/api/admin/products/${productId}/views/${viewId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update view");
  const json = await res.json();
  return json.data;
}

function ToggleCard({
  id,
  icon,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
        checked
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-background hover:bg-muted/50"
      }`}
    >
      <div className={`rounded-md p-1.5 ${checked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

export function ProductFormModal({ product, categories, onClose }: Props) {
  const queryClient = useQueryClient();
  const isEditing = !!product;

  // Basic info
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "DRAFT");

  // Pricing
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [comparePrice, setComparePrice] = useState(product?.comparePrice?.toString() ?? "");
  const [costPrice, setCostPrice] = useState(product?.costPrice?.toString() ?? "");

  // Inventory
  const [quantity, setQuantity] = useState(product?.quantity?.toString() ?? "0");
  const [trackQuantity, setTrackQuantity] = useState(product?.trackQuantity ?? true);
  const [lowStockThreshold, setLowStockThreshold] = useState(product?.lowStockThreshold?.toString() ?? "5");

  // Shipping
  const [deliveryTime, setDeliveryTime] = useState(product?.deliveryTime ?? "");
  const [weight, setWeight] = useState(product?.weight?.toString() ?? "");
  const [dimensions, setDimensions] = useState(product?.dimensions ?? "");

  // Custom Print
  const [allowCustomPrint, setAllowCustomPrint] = useState(product?.allowCustomPrint ?? false);
  const [printPrice, setPrintPrice] = useState(product?.printPrice?.toString() ?? "");

  // Toggles
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isLowBudget, setIsLowBudget] = useState(product?.isLowBudget ?? false);

  // SEO
  const [seoTitle, setSeoTitle] = useState(product?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(product?.seoDescription ?? "");
  const [metaKeywords, setMetaKeywords] = useState(product?.metaKeywords ?? "");

  // Images (edit mode — mirrors server state; create mode — pending list)
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [imgUrl, setImgUrl] = useState("");
  const [imgAlt, setImgAlt] = useState("");
  const [imgIsMain, setImgIsMain] = useState(false);
  const [imgSortOrder, setImgSortOrder] = useState("0");
  const [imgLoading, setImgLoading] = useState(false);
  const [imgPreviewError, setImgPreviewError] = useState(false);
  // pending images for create-mode (added before product exists)
  const [pendingImages, setPendingImages] = useState<
    { url: string; altText: string; isMain: boolean; sortOrder: number }[]
  >([]);
  const [activeTab, setActiveTab] = useState("general");
  const createdProductIdRef = useRef<string | null>(null);

  // Views
  const VALID_VIEW_KEYS = ["front", "back", "left", "right", "top", "bottom"] as const;
  const VIEW_KEY_LABELS: Record<string, string> = {
    front: "Front", back: "Back", left: "Left Side", right: "Right Side", top: "Top", bottom: "Bottom",
  };
  const [viewKey, setViewKey] = useState<string>("front");
  const [viewName, setViewName] = useState("Front");
  const [viewBaseImageUrl, setViewBaseImageUrl] = useState("");
  const [viewDescription, setViewDescription] = useState("");
  const [viewSortOrder, setViewSortOrder] = useState("0");
  const [viewIsDefault, setViewIsDefault] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewPreviewError, setViewPreviewError] = useState(false);
  const [pendingViews, setPendingViews] = useState<
    { viewKey: string; name: string; baseImageUrl: string; description: string; sortOrder: number; isDefault: boolean }[]
  >([]);

  const { data: fetchedViews = [], refetch: refetchViews } = useQuery({
    queryKey: ["product-views", product?.id],
    queryFn: () => fetchProductViews(product!.id),
    enabled: isEditing && !!product?.id,
  });

  const [formError, setFormError] = useState("");

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      isEditing ? updateProduct(product!.id, data) : createProduct(data),
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      if (!isEditing) {
        const newId: string = response?.id;
        createdProductIdRef.current = newId;
        if (!newId) {
          toast.error("Could not get new product ID — please add images manually via Edit.");
        } else {
          if (pendingImages.length > 0) {
            const imgErrors: string[] = [];
            for (const img of pendingImages) {
              try {
                await addProductImage(newId, img);
              } catch (err) {
                imgErrors.push(err instanceof Error ? err.message : "Unknown error");
              }
            }
            if (imgErrors.length > 0) {
              toast.error(`Image upload failed: ${imgErrors.join(", ")}`);
            }
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
          }
          if (pendingViews.length > 0) {
            const viewErrors: string[] = [];
            for (const v of pendingViews) {
              try {
                await addProductView(newId, v);
              } catch (err) {
                viewErrors.push(err instanceof Error ? err.message : "Unknown error");
              }
            }
            if (viewErrors.length > 0) {
              toast.error(`View upload failed: ${viewErrors.join(", ")}`);
            }
          }
        }
      }
      toast.success(isEditing ? "Product updated" : "Product created");
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
    if (!sku.trim()) { setFormError("SKU is required"); return; }
    if (!price || Number(price) <= 0) { setFormError("Price must be greater than 0"); return; }
    if (!categoryId) { setFormError("Category is required"); return; }
    if (allowCustomPrint && (!printPrice || Number(printPrice) <= 0)) {
      setFormError("Print price is required when custom print is enabled");
      return;
    }

    const data: Record<string, unknown> = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      price: parseFloat(price),
      categoryId,
      status,
      isFeatured,
      isLowBudget,
      trackQuantity,
      allowCustomPrint,
      quantity: parseInt(quantity) || 0,
      lowStockThreshold: parseInt(lowStockThreshold) || 5,
    };

    if (slug.trim()) data.slug = slug.trim();
    if (description.trim()) data.description = description.trim();
    if (shortDescription.trim()) data.shortDescription = shortDescription.trim();
    if (comparePrice) data.comparePrice = parseFloat(comparePrice);
    if (costPrice) data.costPrice = parseFloat(costPrice);
    if (allowCustomPrint && printPrice) data.printPrice = parseFloat(printPrice);
    if (deliveryTime.trim()) data.deliveryTime = deliveryTime.trim();
    if (weight) data.weight = parseFloat(weight);
    if (dimensions.trim()) data.dimensions = dimensions.trim();
    if (seoTitle.trim()) data.seoTitle = seoTitle.trim();
    if (seoDescription.trim()) data.seoDescription = seoDescription.trim();
    if (metaKeywords.trim()) data.metaKeywords = metaKeywords.trim();

    mutation.mutate(data);
  }

  // ── Image handlers ──────────────────────────────────────────
  async function handleAddImage() {
    if (!imgUrl.trim()) { toast.error("Image URL is required"); return; }
    try { new URL(imgUrl.trim()); } catch { toast.error("Enter a valid URL"); return; }

    setImgLoading(true);
    try {
      if (isEditing && product) {
        const created = await addProductImage(product.id, {
          url: imgUrl.trim(),
          altText: imgAlt.trim() || undefined,
          isMain: imgIsMain,
          sortOrder: parseInt(imgSortOrder) || 0,
        });
        // If set as main, update local list
        setImages((prev) =>
          imgIsMain
            ? [{ ...created }, ...prev.map((i) => ({ ...i, isMain: false }))]
            : [...prev, created]
        );
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        toast.success("Image added");
      } else {
        // create mode — queue it
        const isFirstOrMain = imgIsMain || pendingImages.length === 0;
        setPendingImages((prev) =>
          isFirstOrMain
            ? [{ url: imgUrl.trim(), altText: imgAlt.trim(), isMain: true, sortOrder: parseInt(imgSortOrder) || 0 },
               ...prev.map((i) => ({ ...i, isMain: false }))]
            : [...prev, { url: imgUrl.trim(), altText: imgAlt.trim(), isMain: false, sortOrder: parseInt(imgSortOrder) || 0 }]
        );
        toast.success("Image queued — will be uploaded when you save the product");
      }
      setImgUrl("");
      setImgAlt("");
      setImgIsMain(false);
      setImgSortOrder("0");
      setImgPreviewError(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add image");
    } finally {
      setImgLoading(false);
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!product) return;
    try {
      await deleteProductImage(product.id, imageId);
      setImages((prev) => prev.filter((i) => i.id !== imageId));
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Image removed");
    } catch {
      toast.error("Failed to remove image");
    }
  }

  async function handleSetMain(imageId: string) {
    if (!product) return;
    try {
      await setMainProductImage(product.id, imageId);
      setImages((prev) => prev.map((i) => ({ ...i, isMain: i.id === imageId })));
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Main image updated");
    } catch {
      toast.error("Failed to set main image");
    }
  }

  function removePending(index: number) {
    setPendingImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // Ensure at least one is main
      if (next.length > 0 && !next.some((i) => i.isMain)) {
        next[0] = { ...next[0], isMain: true };
      }
      return next;
    });
  }

  // ── View handlers ──────────────────────────────────────────
  async function handleAddView() {
    if (!viewBaseImageUrl.trim()) { toast.error("Base image URL is required"); return; }
    try { new URL(viewBaseImageUrl.trim()); } catch { toast.error("Enter a valid image URL"); return; }
    setViewLoading(true);
    try {
      if (isEditing) {
        const existing = fetchedViews.find((v) => v.viewKey === viewKey);
        if (existing) {
          await updateProductView(product!.id, existing.id, {
            name: viewName.trim() || VIEW_KEY_LABELS[viewKey],
            baseImageUrl: viewBaseImageUrl.trim(),
            description: viewDescription.trim() || null,
            sortOrder: parseInt(viewSortOrder) || 0,
            isDefault: viewIsDefault,
          });
          toast.success("View updated");
        } else {
          await addProductView(product!.id, {
            viewKey,
            name: viewName.trim() || VIEW_KEY_LABELS[viewKey],
            baseImageUrl: viewBaseImageUrl.trim(),
            description: viewDescription.trim() || undefined,
            sortOrder: parseInt(viewSortOrder) || 0,
            isDefault: viewIsDefault,
          });
          toast.success("View added");
        }
        await refetchViews();
      } else {
        const isFirstOrDefault = viewIsDefault || pendingViews.length === 0;
        const entry = {
          viewKey,
          name: viewName.trim() || VIEW_KEY_LABELS[viewKey],
          baseImageUrl: viewBaseImageUrl.trim(),
          description: viewDescription.trim(),
          sortOrder: parseInt(viewSortOrder) || 0,
          isDefault: isFirstOrDefault,
        };
        setPendingViews((prev) =>
          isFirstOrDefault
            ? [entry, ...prev.map((v) => ({ ...v, isDefault: false }))]
            : [...prev, entry]
        );
        toast.success("View queued");
      }
      setViewBaseImageUrl(""); setViewDescription(""); setViewSortOrder("0"); setViewIsDefault(false); setViewPreviewError(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save view");
    } finally {
      setViewLoading(false);
    }
  }

  async function handleDeleteView(viewId: string) {
    if (!product?.id) return;
    try {
      await deleteProductView(product.id, viewId);
      await refetchViews();
      toast.success("View removed");
    } catch {
      toast.error("Failed to delete view");
    }
  }

  async function handleSetDefaultView(viewId: string) {
    if (!product?.id) return;
    try {
      await updateProductView(product.id, viewId, { isDefault: true });
      await refetchViews();
      toast.success("Default view updated");
    } catch {
      toast.error("Failed to update default view");
    }
  }

  function removePendingView(index: number) {
    setPendingViews((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (prev[index]?.isDefault && next.length > 0) {
        next[0] = { ...next[0], isDefault: true };
      }
      return next;
    });
  }

  // Profit margin calculation
  const profitMargin = price && costPrice
    ? (((parseFloat(price) - parseFloat(costPrice)) / parseFloat(price)) * 100).toFixed(1)
    : null;

  const imageCount = isEditing ? images.length : pendingImages.length;
  const viewCount = isEditing ? fetchedViews.length : pendingViews.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="images" className="relative">
            Images
            {imageCount > 0 && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                {imageCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="views" className="relative">
            Views
            {viewCount > 0 && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                {viewCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── General Tab ─────────────────────── */}
        <TabsContent value="general" className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="PAC-XXX" className="uppercase" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProductStatus)}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDesc">Short Description</Label>
            <Input id="shortDesc" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Brief features (comma separated)" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Full product description" rows={3} />
          </div>

          <Separator />
          <p className="text-sm font-medium text-muted-foreground">Product Options</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleCard
              id="featured"
              icon={<Star className="size-4" />}
              label="Featured Product"
              description="Show on homepage highlights"
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
            />
            <ToggleCard
              id="lowBudget"
              icon={<Wallet className="size-4" />}
              label="Low Budget"
              description="Tag as affordable option"
              checked={isLowBudget}
              onCheckedChange={setIsLowBudget}
            />
            <ToggleCard
              id="trackQty"
              icon={<Package className="size-4" />}
              label="Track Inventory"
              description="Monitor stock quantities"
              checked={trackQuantity}
              onCheckedChange={setTrackQuantity}
            />
            <ToggleCard
              id="customPrint"
              icon={<Printer className="size-4" />}
              label="Custom Print"
              description="Allow custom printing"
              checked={allowCustomPrint}
              onCheckedChange={setAllowCustomPrint}
            />
          </div>

          {allowCustomPrint && (
            <div className="space-y-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
              <Label htmlFor="printPrice">Print Price (₦) *</Label>
              <Input
                id="printPrice"
                type="number"
                step="0.01"
                min="0"
                value={printPrice}
                onChange={(e) => setPrintPrice(e.target.value)}
                placeholder="Additional cost for custom print"
              />
              <p className="text-xs text-muted-foreground">Extra charge per unit for custom printing</p>
            </div>
          )}
        </TabsContent>

        {/* ── Pricing Tab ─────────────────────── */}
        <TabsContent value="pricing" className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Selling Price (₦) *</Label>
              <Input id="price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comparePrice">Compare Price (₦)</Label>
              <Input id="comparePrice" type="number" step="0.01" min="0" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} />
              <p className="text-xs text-muted-foreground">Shown as strikethrough</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price (₦)</Label>
              <Input id="costPrice" type="number" step="0.01" min="0" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
              <p className="text-xs text-muted-foreground">For profit calculation</p>
            </div>
          </div>

          {profitMargin && (
            <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-4 py-2">
              <span className="text-sm text-muted-foreground">Profit Margin:</span>
              <Badge variant={parseFloat(profitMargin) > 0 ? "default" : "destructive"}>
                {profitMargin}%
              </Badge>
              {costPrice && price && (
                <span className="text-sm text-muted-foreground ml-2">
                  (₦{(parseFloat(price) - parseFloat(costPrice)).toLocaleString()} per unit)
                </span>
              )}
            </div>
          )}

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Stock Quantity</Label>
              <Input id="quantity" type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} disabled={!trackQuantity} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowStock">Low Stock Alert Threshold</Label>
              <Input id="lowStock" type="number" min="0" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} disabled={!trackQuantity} />
            </div>
          </div>

          {!trackQuantity && (
            <p className="text-xs text-muted-foreground italic">Enable &ldquo;Track Inventory&rdquo; in General tab to manage stock levels.</p>
          )}
        </TabsContent>

        {/* ── Shipping Tab ─────────────────────── */}
        <TabsContent value="shipping" className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deliveryTime" className="flex items-center gap-1.5">
                <Truck className="size-3.5" /> Delivery Time
              </Label>
              <Input id="deliveryTime" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} placeholder="e.g. 3-5 business days" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" step="0.01" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dimensions">Dimensions (JSON)</Label>
            <Input id="dimensions" value={dimensions} onChange={(e) => setDimensions(e.target.value)} placeholder='{"length":20,"width":15,"height":8}' />
            <p className="text-xs text-muted-foreground">Length × Width × Height in cm</p>
          </div>
        </TabsContent>

        {/* ── SEO Tab ─────────────────────── */}
        <TabsContent value="seo" className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="seoTitle" className="flex items-center gap-1.5">
              <Search className="size-3.5" /> SEO Title
            </Label>
            <Input id="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Search engine title" maxLength={60} />
            <p className="text-xs text-muted-foreground">{seoTitle.length}/60 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoDesc">SEO Description</Label>
            <Textarea id="seoDesc" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Search engine description" rows={2} maxLength={160} />
            <p className="text-xs text-muted-foreground">{seoDescription.length}/160 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaKw">Meta Keywords</Label>
            <Input id="metaKw" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} placeholder="keyword1, keyword2, keyword3" />
          </div>

          {(seoTitle || seoDescription) && (
            <>
              <Separator />
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground mb-1">Search Preview</p>
                <p className="text-sm font-medium text-blue-600 truncate">{seoTitle || name || "Product Title"}</p>
                <p className="text-xs text-green-700 truncate">pac8.dev/products/{slug || "product-slug"}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{seoDescription || shortDescription || "Product description..."}</p>
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Images Tab ─────────────────────── */}
        <TabsContent value="images" className="space-y-5 pt-2">

          {/* Create-mode hint */}
          {!isEditing && (
            <Alert>
              <ImageIcon className="size-4" />
              <AlertDescription>
                Images queued here will be uploaded automatically when you click <strong>Create Product</strong>. The first image added is set as the main image.
              </AlertDescription>
            </Alert>
          )}

          {/* ── Add image form ─── */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Upload className="size-4 text-primary" /> Add Image
            </p>

            <div className="space-y-2">
              <Label htmlFor="imgUrl">Image URL *</Label>
              <Input
                id="imgUrl"
                value={imgUrl}
                onChange={(e) => { setImgUrl(e.target.value); setImgPreviewError(false); }}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Inline preview */}
            {imgUrl && !imgPreviewError && (
              <div className="relative h-28 w-28 rounded-lg border overflow-hidden bg-muted">
                <Image
                  src={imgUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                  sizes="112px"
                  unoptimized
                  onError={() => setImgPreviewError(true)}
                />
              </div>
            )}
            {imgUrl && imgPreviewError && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <X className="size-3" /> Preview unavailable — the URL may still work fine when saved
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="imgAlt">Alt Text</Label>
                <Input id="imgAlt" value={imgAlt} onChange={(e) => setImgAlt(e.target.value)} placeholder="Describe the image" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imgSort">Sort Order</Label>
                <Input id="imgSort" type="number" min="0" value={imgSortOrder} onChange={(e) => setImgSortOrder(e.target.value)} />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
              <Switch id="imgMain" checked={imgIsMain} onCheckedChange={setImgIsMain} />
              <span>Set as main image</span>
              {imgIsMain && <Badge variant="default" className="text-[10px]">Main</Badge>}
            </label>

            <Button
              type="button"
              onClick={handleAddImage}
              disabled={imgLoading || !imgUrl.trim()}
              className="w-full sm:w-auto"
            >
              <Plus className="size-4 mr-1" />
              {imgLoading ? "Adding..." : isEditing ? "Add Image" : "Queue Image"}
            </Button>
          </div>

          {/* ── Existing images (edit mode) ─── */}
          {isEditing && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">
                Product Images ({images.length})
              </p>
              {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-muted-foreground">
                  <ImageIcon className="size-10 mb-2 opacity-30" />
                  <p className="text-sm">No images yet. Add one above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className={`relative group rounded-xl border-2 overflow-hidden bg-muted aspect-square ${img.isMain ? "border-primary shadow-md" : "border-border"}`}
                    >
                      <Image
                        src={img.url}
                        alt={img.altText ?? "Product image"}
                        fill
                        className="object-contain"
                        sizes="160px"
                        unoptimized
                      />
                      {img.isMain && (
                        <div className="absolute top-1.5 left-1.5">
                          <Badge className="text-[10px] px-1.5 gap-1 shadow">
                            <CheckCircle2 className="size-2.5" /> Main
                          </Badge>
                        </div>
                      )}
                      {/* Hover controls */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        <a
                          href={img.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-white/20 px-2 py-1 text-[11px] text-white hover:bg-white/30 transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="size-3" /> View
                        </a>
                        {!img.isMain && (
                          <button
                            type="button"
                            onClick={() => handleSetMain(img.id)}
                            className="inline-flex items-center gap-1 rounded-md bg-primary/80 px-2 py-1 text-[11px] text-white hover:bg-primary transition"
                          >
                            <Star className="size-3" /> Set Main
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="inline-flex items-center gap-1 rounded-md bg-destructive/80 px-2 py-1 text-[11px] text-white hover:bg-destructive transition"
                        >
                          <Trash2 className="size-3" /> Delete
                        </button>
                      </div>
                      {/* Alt text caption */}
                      {img.altText && (
                        <p className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] truncate px-1.5 py-0.5">
                          {img.altText}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Pending images (create mode) ─── */}
          {!isEditing && pendingImages.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">
                Queued Images ({pendingImages.length}) — will upload on save
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pendingImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-xl border-2 overflow-hidden bg-muted aspect-square ${img.isMain ? "border-primary shadow-md" : "border-border"}`}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText || "Queued image"}
                      fill
                      className="object-contain"
                      sizes="160px"
                      unoptimized
                    />
                    {img.isMain && (
                      <div className="absolute top-1.5 left-1.5">
                        <Badge className="text-[10px] px-1.5 gap-1 shadow">
                          <CheckCircle2 className="size-2.5" /> Main
                        </Badge>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removePending(idx)}
                      className="absolute top-1.5 right-1.5 rounded-full bg-destructive p-0.5 text-white hover:bg-destructive/80 transition"
                    >
                      <X className="size-3" />
                    </button>
                    {img.altText && (
                      <p className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] truncate px-1.5 py-0.5">{img.altText}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tip */}
          <p className="text-xs text-muted-foreground">
            💡 Use publicly accessible URLs (e.g. from your CDN, Imgur, or Cloudinary). Supported: JPG, PNG, WebP, SVG.
          </p>
        </TabsContent>

        {/* ── Views Tab ─────────────────────── */}
        <TabsContent value="views" className="space-y-5 pt-2">

          {/* What are views? */}
          <Alert>
            <Eye className="size-4" />
            <AlertDescription>
              <strong>Product Views</strong> define the angles customers can customize (Front, Back, Left Side, Right Side, etc.).
              Each view needs a clean product photo — the customize editor overlays user designs on top of it.
            </AlertDescription>
          </Alert>

          {/* Create-mode hint */}
          {!isEditing && (
            <p className="text-xs text-amber-600 font-medium">
              ⚠️ Views will be uploaded when you click <strong>Create Product</strong>.
            </p>
          )}

          {/* ── Add / overwrite view form ─── */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Upload className="size-4 text-primary" /> Add / Update View
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="viewKey">View Angle *</Label>
                <Select
                  value={viewKey}
                  onValueChange={(val) => {
                    setViewKey(val);
                    setViewName(VIEW_KEY_LABELS[val] ?? val);
                  }}
                >
                  <SelectTrigger id="viewKey">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VALID_VIEW_KEYS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {VIEW_KEY_LABELS[k]}
                        {isEditing && fetchedViews.some((v) => v.viewKey === k) && (
                          <span className="ml-2 text-[10px] text-primary font-semibold">✓ set</span>
                        )}
                        {!isEditing && pendingViews.some((v) => v.viewKey === k) && (
                          <span className="ml-2 text-[10px] text-primary font-semibold">✓ queued</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="viewName">Display Name</Label>
                <Input id="viewName" value={viewName} onChange={(e) => setViewName(e.target.value)} placeholder="e.g. Front" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="viewBaseImageUrl">Product Image URL for this angle *</Label>
              <Input
                id="viewBaseImageUrl"
                value={viewBaseImageUrl}
                onChange={(e) => { setViewBaseImageUrl(e.target.value); setViewPreviewError(false); }}
                placeholder="https://example.com/product-front.jpg"
              />
            </div>

            {/* Inline preview */}
            {viewBaseImageUrl && !viewPreviewError && (
              <div className="relative h-28 w-28 rounded-lg border overflow-hidden bg-muted">
                <Image
                  src={viewBaseImageUrl}
                  alt="View preview"
                  fill
                  className="object-contain"
                  sizes="112px"
                  unoptimized
                  onError={() => setViewPreviewError(true)}
                />
              </div>
            )}
            {viewBaseImageUrl && viewPreviewError && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <X className="size-3" /> Preview unavailable — the URL may still work fine when saved
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="viewDescription">Description (optional)</Label>
                <Input id="viewDescription" value={viewDescription} onChange={(e) => setViewDescription(e.target.value)} placeholder="e.g. Front-facing angle" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="viewSortOrder">Sort Order</Label>
                <Input id="viewSortOrder" type="number" min="0" value={viewSortOrder} onChange={(e) => setViewSortOrder(e.target.value)} />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
              <Switch id="viewIsDefault" checked={viewIsDefault} onCheckedChange={setViewIsDefault} />
              <span>Set as default view</span>
              {viewIsDefault && <Badge variant="default" className="text-[10px]">Default</Badge>}
            </label>

            <Button
              type="button"
              onClick={handleAddView}
              disabled={viewLoading || !viewBaseImageUrl.trim()}
              className="w-full sm:w-auto"
            >
              <Plus className="size-4 mr-1" />
              {viewLoading ? "Saving..." : isEditing
                ? (fetchedViews.some((v) => v.viewKey === viewKey) ? "Update View" : "Add View")
                : (pendingViews.some((v) => v.viewKey === viewKey) ? "Replace Queued View" : "Queue View")}
            </Button>
          </div>

          {/* ── Existing views grid (edit mode) ─── */}
          {isEditing && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">Configured Views ({fetchedViews.length} / 6)</p>
              {fetchedViews.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-muted-foreground">
                  <Eye className="size-10 mb-2 opacity-30" />
                  <p className="text-sm">No views configured yet. Add one above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {fetchedViews.map((v) => (
                    <div
                      key={v.id}
                      className={`relative group rounded-xl border-2 overflow-hidden bg-muted ${
                        v.isDefault ? "border-primary shadow-md" : "border-border"
                      }`}
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={v.baseImageUrl}
                          alt={v.name}
                          fill
                          className="object-contain"
                          sizes="160px"
                          unoptimized
                        />
                      </div>
                      <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                        <Badge variant="secondary" className="text-[10px] px-1.5">{VIEW_KEY_LABELS[v.viewKey] ?? v.viewKey}</Badge>
                        {v.isDefault && <Badge className="text-[10px] px-1.5 gap-1"><CheckCircle2 className="size-2.5" /> Default</Badge>}
                      </div>
                      {/* Hover controls */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        {!v.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultView(v.id)}
                            className="inline-flex items-center gap-1 rounded-md bg-primary/80 px-2 py-1 text-[11px] text-white hover:bg-primary transition"
                          >
                            <Star className="size-3" /> Set Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setViewKey(v.viewKey);
                            setViewName(v.name);
                            setViewBaseImageUrl(v.baseImageUrl);
                            setViewDescription(v.description ?? "");
                            setViewSortOrder(v.sortOrder.toString());
                            setViewIsDefault(v.isDefault);
                            setViewPreviewError(false);
                            setActiveTab("views");
                          }}
                          className="inline-flex items-center gap-1 rounded-md bg-white/20 px-2 py-1 text-[11px] text-white hover:bg-white/30 transition"
                        >
                          <Upload className="size-3" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteView(v.id)}
                          className="inline-flex items-center gap-1 rounded-md bg-destructive/80 px-2 py-1 text-[11px] text-white hover:bg-destructive transition"
                        >
                          <Trash2 className="size-3" /> Delete
                        </button>
                      </div>
                      {v.description && (
                        <p className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] truncate px-1.5 py-0.5">{v.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Pending views (create mode) ─── */}
          {!isEditing && pendingViews.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">Queued Views ({pendingViews.length})</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pendingViews.map((v, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-xl border-2 overflow-hidden bg-muted ${
                      v.isDefault ? "border-primary shadow-md" : "border-border"
                    }`}
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={v.baseImageUrl}
                        alt={v.name}
                        fill
                        className="object-contain"
                        sizes="160px"
                        unoptimized
                      />
                    </div>
                    <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                      <Badge variant="secondary" className="text-[10px] px-1.5">{VIEW_KEY_LABELS[v.viewKey] ?? v.viewKey}</Badge>
                      {v.isDefault && <Badge className="text-[10px] px-1.5 gap-1"><CheckCircle2 className="size-2.5" /> Default</Badge>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removePendingView(idx)}
                      className="absolute top-1.5 right-1.5 rounded-full bg-destructive p-0.5 text-white hover:bg-destructive/80 transition"
                    >
                      <X className="size-3" />
                    </button>
                    {v.description && (
                      <p className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] truncate px-1.5 py-0.5">{v.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            💡 Each view angle needs its own clean product photo. The customize editor uses this as the base — user print designs are layered on top.
          </p>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
