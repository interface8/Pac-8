"use client";

import { useState } from "react";
import { use } from "react";
import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";
import Header from "@/components/shared/Header";
import { useProduct, useFeaturedProducts } from "@/hooks/use-products";
import { ProductGridCard } from "@/components/products/ProductGrid";
import { useDispatch } from "react-redux";
import { addItem } from "@/store/cartSlice";
import { toast } from "react-toastify";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { product, loading, error } = useProduct(slug);
  const { products: relatedProducts } = useFeaturedProducts(4);
  const dispatch = useDispatch();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-32 md:pt-28 pb-12">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Image skeleton */}
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-2xl animate-pulse" />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-20 h-20 bg-muted rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </div>
            {/* Content skeleton */}
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
              <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
              <div className="h-20 bg-muted rounded animate-pulse" />
              <div className="h-12 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-32 md:pt-28 pb-12">
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart size={40} className="text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Product Not Found
            </h1>
            <p className="text-muted-foreground mt-2">
              The product you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 mt-6 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Browse Products
            </Link>
          </div>
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

  const selectedImage = images[selectedImageIndex] ?? images[0];

  const handleAddToCart = () => {
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        image: selectedImage.url,
        price: product.price,
        quantity,
      })
    );
    toast.success(`${quantity} item${quantity > 1 ? "s" : ""} added to cart`);
  };

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(
          ((product.comparePrice - product.price) / product.comparePrice) * 100
        )
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-32 md:pt-28 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition">
            Home
          </Link>
          <ChevronRight size={14} />
          <Link href="/products" className="hover:text-primary transition">
            Products
          </Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Product section */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Left: Images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-square bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <Image
                src={selectedImage.url}
                alt={selectedImage.altText ?? product.name}
                fill
                className="object-contain p-6"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  -{discountPercent}%
                </span>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl border-2 overflow-hidden shrink-0 transition ${
                      idx === selectedImageIndex
                        ? "border-primary shadow-md"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText ?? `${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

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
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                ₦{product.price.toLocaleString()}
              </span>
              {product.comparePrice &&
                product.comparePrice > product.price && (
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

            {/* Stock status */}
            <div className="flex items-center gap-2">
              {product.quantity > 0 ? (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-700">
                    In Stock
                  </span>
                  {product.quantity <= product.lowStockThreshold && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      Only {product.quantity} left
                    </span>
                  )}
                </>
              ) : (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="text-sm font-medium text-red-500">
                    Out of Stock
                  </span>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Description
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3">
              {product.weight && (
                <div className="bg-muted rounded-xl px-4 py-3">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                    Weight
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {product.weight}kg
                  </p>
                </div>
              )}
              {product.dimensions && (
                <div className="bg-muted rounded-xl px-4 py-3">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                    Dimensions
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {product.dimensions}
                  </p>
                </div>
              )}
              {product.deliveryTime && (
                <div className="bg-muted rounded-xl px-4 py-3">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                    Delivery
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {product.deliveryTime}
                  </p>
                </div>
              )}
              {product.allowCustomPrint && (
                <div className="bg-primary/10 rounded-xl px-4 py-3">
                  <p className="text-[11px] text-primary/70 uppercase tracking-wider">
                    Custom Print
                  </p>
                  <p className="text-sm font-semibold text-primary mt-0.5">
                    Available
                    {product.printPrice
                      ? ` (+₦${product.printPrice.toLocaleString()})`
                      : ""}
                  </p>
                </div>
              )}
            </div>

            {/* Price tiers */}
            {product.priceTiers.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Bulk Pricing
                </h3>
                <div className="bg-muted rounded-xl p-4 space-y-2">
                  {product.priceTiers
                    .filter((t) => t.isActive)
                    .map((tier) => (
                      <div
                        key={tier.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {tier.minQuantity}+ units
                        </span>
                        <span className="font-medium text-green-700">
                          {tier.discountType === "PERCENTAGE"
                            ? `${tier.discountValue}% off`
                            : `₦${tier.discountValue.toLocaleString()} off`}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Quantity selector */}
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
                  onClick={() =>
                    setQuantity((q) => Math.min(product.quantity, q + 1))
                  }
                  className="w-11 h-11 flex items-center justify-center hover:bg-muted transition text-muted-foreground"
                  disabled={quantity >= product.quantity}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
                className="flex-1 h-12 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>

              {/* Wishlist */}
              <button className="h-12 w-12 border border-border rounded-xl flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors text-muted-foreground shrink-0">
                <Heart size={20} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-muted">
                <Truck size={20} className="text-primary mb-1.5" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  Fast Delivery
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-muted">
                <Shield size={20} className="text-primary mb-1.5" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  Warranty
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-muted">
                <RotateCcw size={20} className="text-primary mb-1.5" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  Easy Returns
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product features if shortDescription */}
        {product.shortDescription && (
          <section className="mt-16 bg-card rounded-2xl border border-border p-8 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Product Highlights
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {product.shortDescription.split(",").map((feature, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center mt-0.5 shrink-0">
                    <Check size={12} className="text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {feature.trim()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  You May Also Like
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Explore more packaging products
                </p>
              </div>
              <Link
                href="/products"
                className="text-sm font-medium text-primary hover:text-primary/80 transition"
              >
                View All
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
    </div>
  );
}


