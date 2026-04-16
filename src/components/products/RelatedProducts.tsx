"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductGridCard } from "@/components/products/ProductGrid";
import type { ApiProduct } from "@/hooks/use-products";

interface RelatedProductsProps {
  products: ApiProduct[];
  currentSlug: string;
  categoryName: string;
}

export default function RelatedProducts({ products, currentSlug, categoryName }: RelatedProductsProps) {
  const filtered = products.filter((p) => p.slug !== currentSlug);
  if (filtered.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-foreground">More in {categoryName}</h2>
          <p className="text-sm text-muted-foreground mt-1">Explore similar packaging products</p>
        </div>
        <Link
          href="/products"
          className="text-sm font-medium text-primary hover:text-primary/80 transition flex items-center gap-1"
        >
          View All
          <ChevronRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filtered.slice(0, 4).map((p) => (
          <ProductGridCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
