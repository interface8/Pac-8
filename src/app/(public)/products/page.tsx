"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import Header from "@/components/shared/Header";
import FilterSidebar from "@/components/products/FilterSidebar";
import ProductGrid from "@/components/products/ProductGrid";
import { useProducts } from "@/hooks/use-products";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const urlCategoryId = searchParams.get("categoryId");
  const urlSearch = searchParams.get("search");

  const [sidebarSearch, setSidebarSearch] = useState(urlSearch ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    urlCategoryId ? [urlCategoryId] : []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync URL params when they change (e.g. from header category links)
  useEffect(() => {
    if (urlCategoryId) {
      setSelectedCategories([urlCategoryId]);
    }
  }, [urlCategoryId]);

  useEffect(() => {
    if (urlSearch) {
      setSidebarSearch(urlSearch);
    }
  }, [urlSearch]);

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

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const activeFilterCount =
    selectedCategories.length +
    (priceRange[0] > 0 || priceRange[1] < 500000 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (sidebarSearch ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 pt-32 md:pt-28 pb-10 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            All Products
          </h1>
          <p className="text-purple-200 mt-2 text-sm md:text-base">
            Browse our complete collection of solar energy solutions
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4 flex gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-purple-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="text-sm text-gray-500 flex items-center">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
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

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Active filters bar */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-gray-500">Active filters:</span>
                {sidebarSearch && (
                  <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    &ldquo;{sidebarSearch}&rdquo;
                    <button
                      onClick={() => setSidebarSearch("")}
                      className="hover:text-purple-900"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedCategories.length > 0 && (
                  <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    Category filter
                    <button
                      onClick={() => setSelectedCategories([])}
                      className="hover:text-purple-900"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 500000) && (
                  <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    ₦{priceRange[0].toLocaleString()} – ₦
                    {priceRange[1].toLocaleString()}
                    <button
                      onClick={() => setPriceRange([0, 500000])}
                      className="hover:text-purple-900"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    In Stock
                    <button
                      onClick={() => setInStockOnly(false)}
                      className="hover:text-purple-900"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSidebarSearch("");
                    setSelectedCategories([]);
                    setPriceRange([0, 500000]);
                    setInStockOnly(false);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-900">
                  {products.length}
                </span>{" "}
                product{products.length !== 1 ? "s" : ""}
              </p>
            </div>

            <ProductGrid products={products} loading={loading} columns={3} />
          </div>
        </div>
      </main>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
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
        </div>
      )}
    </div>
  );
}
