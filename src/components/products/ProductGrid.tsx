"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { useDispatch } from "react-redux";
import { addItem } from "@/store/cartSlice";
import { toast } from "react-toastify";
import type { ApiProduct } from "@/hooks/use-products";

interface ProductGridCardProps {
  product: ApiProduct;
}

function ProductGridCard({ product }: ProductGridCardProps) {
  const dispatch = useDispatch();

  const mainImage =
    product.images?.find((img) => img.isMain)?.url ??
    product.images?.[0]?.url ??
    "/images/product-placeholder.png";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        image: mainImage,
        price: product.price,
        quantity: 1,
      })
    );
    toast.success("Added to cart");
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {/* Quick action buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleAddToCart}
              className="w-9 h-9 rounded-full bg-card shadow-md flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              title="Add to cart"
            >
              <ShoppingCart size={16} />
            </button>
            <button
              onClick={(e) => e.preventDefault()}
              className="w-9 h-9 rounded-full bg-card shadow-md flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
              title="Add to wishlist"
            >
              <Heart size={16} />
            </button>
          </div>
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isFeatured && (
              <span className="bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-1 rounded-full">
                Featured
              </span>
            )}
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="bg-red-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                -
                {Math.round(
                  ((product.comparePrice - product.price) /
                    product.comparePrice) *
                    100
                )}
                %
              </span>
            )}
            {product.isLowBudget && (
              <span className="bg-green-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                Budget
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <span className="text-[11px] font-medium text-primary uppercase tracking-wider">
            {product.categoryName}
          </span>
          {/* Title */}
          <h3 className="text-sm font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-foreground">
              ₦{product.price.toLocaleString()}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                ₦{product.comparePrice.toLocaleString()}
              </span>
            )}
          </div>
          {/* Stock indicator */}
          <div className="mt-2">
            {product.quantity > 0 ? (
              <span className="text-xs text-green-600 font-medium">
                In Stock
              </span>
            ) : (
              <span className="text-xs text-red-500 font-medium">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function ProductListCard({ product }: ProductGridCardProps) {
  const dispatch = useDispatch();

  const mainImage =
    product.images?.find((img) => img.isMain)?.url ??
    product.images?.[0]?.url ??
    "/images/product-placeholder.png";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        image: mainImage,
        price: product.price,
        quantity: 1,
      })
    );
    toast.success("Added to cart");
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex">
        {/* Image */}
        <div className="relative w-40 sm:w-52 shrink-0 overflow-hidden bg-muted">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="208px"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isFeatured && (
              <span className="bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-1 rounded-full">
                Featured
              </span>
            )}
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="bg-red-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-medium text-primary uppercase tracking-wider">
                {product.categoryName}
              </span>
              {product.isLowBudget && (
                <span className="bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Budget
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            {product.shortDescription && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 hidden sm:block">
                {product.shortDescription}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">
                  ₦{product.price.toLocaleString()}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₦{product.comparePrice.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="mt-0.5">
                {product.quantity > 0 ? (
                  <span className="text-xs text-green-600 font-medium">In Stock</span>
                ) : (
                  <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                )}
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium flex items-center gap-2 transition-colors shrink-0"
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface ProductGridProps {
  products: ApiProduct[];
  loading?: boolean;
  columns?: 3 | 4;
  viewMode?: "grid" | "list";
}

export default function ProductGrid({
  products,
  loading,
  columns = 4,
  viewMode = "grid",
}: ProductGridProps) {
  if (loading) {
    if (viewMode === "list") {
      return (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse flex h-40">
              <div className="w-40 sm:w-52 bg-muted shrink-0" />
              <div className="flex-1 p-5 space-y-3">
                <div className="h-3 bg-muted rounded w-1/4" />
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-5 bg-muted rounded w-1/3 mt-auto" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        className={`grid gap-5 ${
          columns === 4
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
            <div className="aspect-square bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-5 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <ShoppingCart size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          No products found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <ProductListCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid gap-5 ${
        columns === 4
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      }`}
    >
      {products.map((product) => (
        <ProductGridCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export { ProductGridCard };
