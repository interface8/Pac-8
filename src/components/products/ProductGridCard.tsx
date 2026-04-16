"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import type { ApiProduct } from "@/hooks/use-products";

export default function ProductGridCard({ product }: { product: ApiProduct }) {
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
      <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Quick wishlist */}
          <button
            onClick={(e) => e.preventDefault()}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
            title="Add to wishlist"
          >
            <Heart size={16} />
          </button>
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isFeatured && (
              <span className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                Featured
              </span>
            )}
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
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
              <span className="bg-green-600/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
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
          {/* Stock + Add to Cart */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            {product.quantity > 0 ? (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                In Stock
              </span>
            ) : (
              <span className="text-xs text-red-500 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                Out of Stock
              </span>
            )}
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              title="Add to cart"
            >
              <ShoppingCart size={14} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
