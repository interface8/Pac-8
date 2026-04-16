"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import type { ApiProduct } from "@/hooks/use-products";

export default function ProductListCard({ product }: { product: ApiProduct }) {
  const addToCart = useAddToCart();

  const mainImage =
    product.images?.find((img) => img.isMain)?.url ??
    product.images?.[0]?.url ??
    "/images/product-placeholder.png";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id: product.id, name: product.name, image: mainImage, price: product.price });
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 flex">
        {/* Image */}
        <div className="relative w-40 sm:w-52 shrink-0 overflow-hidden bg-muted">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
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
