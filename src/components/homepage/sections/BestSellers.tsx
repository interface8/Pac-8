"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import ProductGrid from "@/components/products/ProductGrid";
import { useFeaturedProducts } from "@/hooks/use-products";

export default function BestSellers() {
  const { products, loading } = useFeaturedProducts(8);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="py-16"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Best Sellers
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Our most popular packaging products
          </p>
        </div>
        <Link
          href="/products"
          className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition"
        >
          View All
          <ArrowRight size={16} />
        </Link>
      </div>

      <ProductGrid products={products} loading={loading} columns={4} />

      <div className="sm:hidden mt-8 text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
        >
          View All Products
          <ArrowRight size={16} />
        </Link>
      </div>
    </motion.section>
  );
}
