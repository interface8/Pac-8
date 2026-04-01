"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import { Printer, Star, Wallet, Package, Search, Truck } from "lucide-react";

type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";

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

  const [formError, setFormError] = useState("");

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      isEditing ? updateProduct(product!.id, data) : createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      onClose();
    },
    onError: (err: Error) => setFormError(err.message),
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

  // Profit margin calculation
  const profitMargin = price && costPrice
    ? (((parseFloat(price) - parseFloat(costPrice)) / parseFloat(price)) * 100).toFixed(1)
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
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
