"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, LayoutGrid, List, ArrowUpDown } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import FilterSidebar from "@/components/products/FilterSidebar";
import ProductGrid from "@/components/products/ProductGrid";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";

type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

const sortLabels: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low → High",
  "price-desc": "Price: High → Low",
  "name-asc": "Name: A → Z",
  "name-desc": "Name: Z → A",
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const urlCategoryId = searchParams.get("categoryId");
  const urlSearch = searchParams.get("search");

  const [sidebarSearch, setSidebarSearch] = useState(urlSearch ?? "");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    urlCategoryId ?? null
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isLowBudget, setIsLowBudget] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { categories } = useCategories();

  // Sync URL params when they change (e.g. from header category links)
  useEffect(() => {
    if (urlCategoryId) {
      setSelectedCategory(urlCategoryId);
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
      categoryId: selectedCategory || undefined,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 500000 ? priceRange[1] : undefined,
      inStock: inStockOnly || undefined,
      isFeatured: isFeatured || undefined,
      isLowBudget: isLowBudget || undefined,
    }),
    [sidebarSearch, selectedCategory, priceRange, inStockOnly, isFeatured, isLowBudget]
  );

  const { products, loading } = useProducts(filters);

  // Client-side sorting
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break; // newest = default API order
    }
    return sorted;
  }, [products, sortBy]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory((prev) => (prev === categoryId ? null : categoryId));
  }, []);

  // Find selected category name for chips
  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory) return null;
    const findCat = (cats: typeof categories): string | null => {
      for (const c of cats) {
        if (c.id === selectedCategory) return c.name;
        if (c.children?.length) {
          const found = findCat(c.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findCat(categories);
  }, [selectedCategory, categories]);

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 500000 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (isFeatured ? 1 : 0) +
    (isLowBudget ? 1 : 0) +
    (sidebarSearch ? 1 : 0);

  const clearAllFilters = () => {
    setSidebarSearch("");
    setSelectedCategory(null);
    setPriceRange([0, 500000]);
    setInStockOnly(false);
    setIsFeatured(false);
    setIsLowBudget(false);
  };

  const sidebarProps = {
    searchQuery: sidebarSearch,
    onSearchChange: setSidebarSearch,
    selectedCategory,
    onCategorySelect: handleCategorySelect,
    priceRange,
    onPriceRangeChange: setPriceRange,
    maxPrice: 500000,
    inStockOnly,
    onInStockChange: setInStockOnly,
    isFeatured,
    onIsFeaturedChange: setIsFeatured,
    isLowBudget,
    onIsLowBudgetChange: setIsLowBudget,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 pt-32 md:pt-28 pb-10 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground">
            {selectedCategoryName ?? "All Products"}
          </h1>
          <p className="text-primary-foreground/70 mt-2 text-sm md:text-base">
            {selectedCategoryName
              ? `Showing products in ${selectedCategoryName}`
              : "Browse our complete collection of custom packaging"}
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Mobile filter toggle + sort */}
        <div className="lg:hidden mb-4 flex items-center gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="text-sm text-muted-foreground flex items-center ml-auto">
            {sortedProducts.length} product{sortedProducts.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-32 bg-card rounded-2xl border border-border p-5 shadow-sm max-h-[calc(100vh-9rem)] overflow-y-auto">
              <FilterSidebar {...sidebarProps} />
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Active filters bar */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="text-sm text-muted-foreground">Filters:</span>
                {sidebarSearch && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
                    &ldquo;{sidebarSearch}&rdquo;
                    <button onClick={() => setSidebarSearch("")} className="hover:text-primary/80">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedCategoryName && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
                    {selectedCategoryName}
                    <button onClick={() => setSelectedCategory(null)} className="hover:text-primary/80">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {isFeatured && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    Featured
                    <button onClick={() => setIsFeatured(false)} className="hover:text-amber-500">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {isLowBudget && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    Budget Friendly
                    <button onClick={() => setIsLowBudget(false)} className="hover:text-green-500">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 500000) && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
                    ₦{priceRange[0].toLocaleString()} – ₦{priceRange[1].toLocaleString()}
                    <button onClick={() => setPriceRange([0, 500000])} className="hover:text-primary/80">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
                    In Stock
                    <button onClick={() => setInStockOnly(false)} className="hover:text-primary/80">
                      <X size={12} />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-muted-foreground hover:text-foreground underline ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Toolbar: count + sort + view toggle */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <p className="text-sm text-muted-foreground hidden lg:block">
                Showing{" "}
                <span className="font-medium text-foreground">{sortedProducts.length}</span>{" "}
                product{sortedProducts.length !== 1 ? "s" : ""}
              </p>

              <div className="flex items-center gap-3 ml-auto">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none bg-card border border-border rounded-lg pl-8 pr-8 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {Object.entries(sortLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <ArrowUpDown
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                </div>

                {/* View toggle */}
                <div className="hidden sm:flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 transition ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
                    title="Grid view"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 transition ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
                    title="List view"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            <ProductGrid products={sortedProducts} loading={loading} columns={3} viewMode={viewMode} />
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-card shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 hover:bg-muted rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar {...sidebarProps} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
