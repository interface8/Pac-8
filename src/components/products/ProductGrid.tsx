"use client";

import { ShoppingCart } from "lucide-react";
import type { ApiProduct } from "@/hooks/use-products";
import ProductGridCard from "@/components/products/ProductGridCard";
import ProductListCard from "@/components/products/ProductListCard";

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

// Re-export for backward compatibility
export { default as ProductGridCard } from "@/components/products/ProductGridCard";
