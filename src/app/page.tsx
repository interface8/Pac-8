"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import HeroCarousel from "@/components/homepage/HeroCarousel";
import FilterSidebar from "@/components/products/FilterSidebar";
import ProductGrid from "@/components/products/ProductGrid";
import Footer from "@/components/homepage/footer/Footer";
import { useProducts, useFeaturedProducts } from "@/hooks/use-products";

export default function Home() {
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const filters = useMemo(
    () => ({
      search: sidebarSearch || undefined,
      categoryId: selectedCategories[0] || undefined,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 500000 ? priceRange[1] : undefined,
      inStock: inStockOnly || undefined,
    }),
    [sidebarSearch, selectedCategories, priceRange, inStockOnly]
  );

  const { products, loading } = useProducts(filters);
  const { products: featuredProducts, loading: featuredLoading } =
    useFeaturedProducts(8);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  // Show featured if no filters applied, otherwise show filtered
  const hasFilters =
    sidebarSearch ||
    selectedCategories.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 500000 ||
    inStockOnly;

  const displayProducts = hasFilters ? products : featuredProducts;
  const isLoading = hasFilters ? loading : featuredLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      {/* Main content — offset for header (promo bar ~28px + navbar 64px + mobile search ~46px) */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-32 md:pt-28 pb-12">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <div className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-32 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <FilterSidebar
                searchQuery={sidebarSearch}
                onSearchChange={setSidebarSearch}
                selectedCategories={selectedCategories}
                onCategoryToggle={handleCategoryToggle}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                maxPrice={500000}
                inStockOnly={inStockOnly}
                onInStockChange={setInStockOnly}
              />
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 min-w-0">
            {/* Hero Carousel */}
            <HeroCarousel />

            {/* Best Sellers / Products section */}
            <section className="mt-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {hasFilters ? "Search Results" : "Best Sellers"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {hasFilters
                      ? `${displayProducts.length} product${displayProducts.length !== 1 ? "s" : ""} found`
                      : "Discover our most popular solar products"}
                  </p>
                </div>
                <Link
                  href="/products"
                  className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 transition"
                >
                  View All
                  <ArrowRight size={16} />
                </Link>
              </div>

              <ProductGrid
                products={displayProducts}
                loading={isLoading}
                columns={4}
              />

              <div className="sm:hidden mt-6 text-center">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  View All Products
                  <ArrowRight size={16} />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
