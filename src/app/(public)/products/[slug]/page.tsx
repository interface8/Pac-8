"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  ChevronRight,
  Minus,
  Plus,
  Heart,
  Truck,
  Shield,
  RotateCcw,
  Star,
  Check,
  Palette,
  Package,
  Layers,
  Ruler,
} from "lucide-react";
import { useProduct, useProducts } from "@/hooks/use-products";
import { useWishlist } from "@/hooks/use-wishlist";
import { ProductGridCard } from "@/components/products/ProductGrid";
import ImageGallery from "@/components/products/ImageGallery";
import ReviewsSection from "@/components/products/ReviewsSection";
import { useDispatch } from "react-redux";
import { addItem } from "@/store/cartSlice";
import { toast } from "react-toastify";

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const { product, loading, error } = useProduct(slug);
  const { products: relatedProducts } = useProducts(
    product ? { categoryId: product.categoryId } : undefined
  );
  const dispatch = useDispatch();
  const { items: wishlistItems, toggle: toggleWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "shipping">("description");

  const isWishlisted = product ? wishlistItems.some((w) => w.productId === product.id) : false;

  const handleToggleWishlist = async () => {
    if (!product || wishlistLoading) return;
    setWishlistLoading(true);
    try {
      const added = await toggleWishlist(product.id);
      toast.success(added ? "Added to wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-32 md:pt-28 pb-12">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-2xl animate-pulse" />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-20 h-20 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
              <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
              <div className="h-20 bg-muted rounded animate-pulse" />
              <div className="h-12 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-32 md:pt-28 pb-12">
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart size={40} className="text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Product Not Found</h1>
            <p className="text-muted-foreground mt-2">
              The product you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 mt-6 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Browse Products
            </Link>
          </div>
      </div>
    );
  }

  const images =
    product.images.length > 0
      ? product.images.sort((a, b) => {
          if (a.isMain && !b.isMain) return -1;
          if (!a.isMain && b.isMain) return 1;
          return a.sortOrder - b.sortOrder;
        })
      : [{ id: "fallback", url: "/images/product-placeholder.png", altText: product.name, isMain: true, sortOrder: 0 }];

  const mainImage = images[0];

  const handleAddToCart = () => {
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        image: mainImage.url,
        price: product.price,
        quantity,
      })
    );
    toast.success(`${quantity} item${quantity > 1 ? "s" : ""} added to cart`);
  };

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;

  // Parse dimensions JSON
  let parsedDimensions: { length?: number; width?: number; height?: number } | null = null;
  if (product.dimensions) {
    try {
      parsedDimensions = JSON.parse(product.dimensions);
    } catch {
      // dimensions is a plain string, display as-is
    }
  }

  // Calculate tier-adjusted price for display
  const activeTiers = product.priceTiers.filter((t) => t.isActive).sort((a, b) => a.minQuantity - b.minQuantity);
  const applicableTier = [...activeTiers].reverse().find((t) => quantity >= t.minQuantity);
  const unitPrice = applicableTier
    ? applicableTier.discountType === "PERCENTAGE"
      ? product.price * (1 - applicableTier.discountValue / 100)
      : product.price - applicableTier.discountValue
    : product.price;
  const totalPrice = unitPrice * quantity;

  return (
    <>
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-32 md:pt-28 pb-16 flex-1 w-full">
        {/* Breadcrumb */}
        <nav className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-8 bg-muted/60 px-4 py-2 rounded-full">
          <Link href="/" className="hover:text-primary transition">Home</Link>
          <ChevronRight size={14} />
          <Link href="/products" className="hover:text-primary transition">Products</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ─── Product Top Section ──────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Left: Image Gallery */}
          <ImageGallery images={images} productName={product.name} discountPercent={discountPercent} />

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Category & badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
                {product.categoryName}
              </span>
              {product.isFeatured && (
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full flex items-center gap-1">
                  <Star size={12} /> Featured
                </span>
              )}
              {product.isLowBudget && (
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                  Budget Friendly
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>

            {/* SKU */}
            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">
                  ₦{unitPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
                {(product.comparePrice && product.comparePrice > product.price) && (
                  <span className="text-lg text-muted-foreground line-through">
                    ₦{product.comparePrice.toLocaleString()}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-sm font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
              {applicableTier && (
                <p className="text-xs text-green-600 font-medium mt-1">
                  Bulk discount applied ({applicableTier.discountType === "PERCENTAGE"
                    ? `${applicableTier.discountValue}% off`
                    : `₦${applicableTier.discountValue} off`})
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Price includes 7.5% VAT</p>
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2">
              {product.quantity > 0 ? (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-700">In Stock</span>
                  {product.quantity <= product.lowStockThreshold && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      Only {product.quantity} left
                    </span>
                  )}
                </>
              ) : (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="text-sm font-medium text-red-500">Out of Stock</span>
                </>
              )}
            </div>

            <div className="border-t border-border" />

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 gap-3">
              {product.weight && (
                <div className="bg-muted rounded-xl px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Package size={13} className="text-muted-foreground" />
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Weight</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{product.weight}kg</p>
                </div>
              )}
              {parsedDimensions ? (
                <div className="bg-muted rounded-xl px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Ruler size={13} className="text-muted-foreground" />
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Dimensions</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {parsedDimensions.length} × {parsedDimensions.width} × {parsedDimensions.height}cm
                  </p>
                </div>
              ) : product.dimensions ? (
                <div className="bg-muted rounded-xl px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Ruler size={13} className="text-muted-foreground" />
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Dimensions</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{product.dimensions}</p>
                </div>
              ) : null}
              {product.deliveryTime && (
                <div className="bg-muted rounded-xl px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Truck size={13} className="text-muted-foreground" />
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Delivery</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{product.deliveryTime}</p>
                </div>
              )}
              {product.allowCustomPrint && (
                <div className="bg-primary/10 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Palette size={13} className="text-primary/70" />
                    <p className="text-[11px] text-primary/70 uppercase tracking-wider">Custom Print</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    Available{product.printPrice ? ` (+₦${product.printPrice.toLocaleString()})` : ""}
                  </p>
                </div>
              )}
            </div>

            {/* Pricing Tiers Table */}
            {activeTiers.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Layers size={14} className="text-primary" /> Bulk Pricing
                </h3>
                <div className="bg-card border border-border rounded-xl overflow-x-auto">
                  <table className="w-full text-sm min-w-[320px]">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Quantity</th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Discount</th>
                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">Unit Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activeTiers.map((tier) => {
                        const tierUnit =
                          tier.discountType === "PERCENTAGE"
                            ? product.price * (1 - tier.discountValue / 100)
                            : product.price - tier.discountValue;
                        const isActive = applicableTier?.id === tier.id;
                        return (
                          <tr key={tier.id} className={isActive ? "bg-green-50/50" : ""}>
                            <td className="px-4 py-2.5 text-foreground">{tier.minQuantity}+ units</td>
                            <td className="px-4 py-2.5">
                              <span className="text-green-700 font-medium">
                                {tier.discountType === "PERCENTAGE"
                                  ? `${tier.discountValue}% off`
                                  : `₦${tier.discountValue.toLocaleString()} off`}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-foreground">
                              ₦{tierUnit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="border-t border-border" />

            {/* Quantity & Add to Cart */}
            <div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-muted transition text-muted-foreground"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-14 h-11 flex items-center justify-center text-sm font-semibold border-x border-border">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-muted transition text-muted-foreground"
                    disabled={quantity >= product.quantity}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.quantity === 0}
                  className="flex-1 h-12 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart size={18} />
                  Add to Cart — ₦{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </button>

                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className={`h-12 w-12 border rounded-xl flex items-center justify-center transition-colors shrink-0 disabled:opacity-50 ${
                    isWishlisted
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "border-border text-muted-foreground hover:bg-red-50 hover:border-red-200 hover:text-red-500"
                  }`}
                >
                  <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Customize CTA */}
              {product.allowCustomPrint && (
                <Link
                  href={`/products/${product.slug}/customize`}
                  className="mt-3 w-full h-12 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Palette size={18} />
                  Customize This Product
                </Link>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-muted">
                <Truck size={20} className="text-primary mb-1.5" />
                <span className="text-[11px] font-medium text-muted-foreground">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-muted">
                <Shield size={20} className="text-primary mb-1.5" />
                <span className="text-[11px] font-medium text-muted-foreground">Warranty</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-muted">
                <RotateCcw size={20} className="text-primary mb-1.5" />
                <span className="text-[11px] font-medium text-muted-foreground">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Product Details Tabs ──────────────────────────── */}
        <section className="mt-16">
          <div className="flex gap-2 mb-6">
            {(["description", "specs", "shipping"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all capitalize ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {tab === "specs" ? "Specifications" : tab}
              </button>
            ))}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
            {activeTab === "description" && (
              <div className="space-y-4">
                {product.description ? (
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No description available.</p>
                )}

                {/* Highlights */}
                {product.shortDescription && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Product Highlights</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {product.shortDescription.split(",").map((feature, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center mt-0.5 shrink-0">
                            <Check size={12} className="text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground">{feature.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "specs" && (
              <div className="space-y-3">
                {[
                  { label: "SKU", value: product.sku },
                  { label: "Weight", value: product.weight ? `${product.weight}kg` : null },
                  {
                    label: "Dimensions",
                    value: parsedDimensions
                      ? `${parsedDimensions.length} × ${parsedDimensions.width} × ${parsedDimensions.height}cm`
                      : product.dimensions ?? null,
                  },
                  { label: "Category", value: product.categoryName },
                  { label: "Custom Print", value: product.allowCustomPrint ? "Available" : "Not Available" },
                  { label: "Print Surcharge", value: product.printPrice ? `₦${product.printPrice.toLocaleString()}` : null },
                  { label: "Low Stock Threshold", value: `${product.lowStockThreshold} units` },
                ]
                  .filter((s) => s.value)
                  .map((spec) => (
                    <div key={spec.label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground">{spec.label}</span>
                      <span className="text-sm font-medium text-foreground">{spec.value}</span>
                    </div>
                  ))}
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <div className="flex items-start gap-3">
                  <Truck size={18} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Delivery Time</p>
                    <p>{product.deliveryTime ?? "Standard delivery: 3-7 business days"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package size={18} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Packaging</p>
                    <p>All items are carefully packed to ensure safe delivery. Custom printed items include protective wrapping.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw size={18} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Returns</p>
                    <p>We accept returns within 7 days for standard items. Custom printed items are non-refundable.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── Reviews Section ──────────────────────────────── */}
        <ReviewsSection productId={product.id} productSlug={product.slug} />

        {/* ─── Related Products ─────────────────────────────── */}
        {relatedProducts.filter((p) => p.slug !== product.slug).length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-foreground">More in {product.categoryName}</h2>
                <p className="text-sm text-muted-foreground mt-1">Explore similar packaging products</p>
              </div>
              <Link href="/products" className="text-sm font-medium text-primary hover:text-primary/80 transition flex items-center gap-1">
                View All
                <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts
                .filter((p) => p.slug !== product.slug)
                .slice(0, 4)
                .map((p) => (
                  <ProductGridCard key={p.id} product={p} />
                ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}


