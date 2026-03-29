"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Search, Sun, LogIn, UserPlus, ShoppingCart, ArrowRight } from "lucide-react";
import HeroCarousel from "@/components/homepage/HeroCarousel";
import FilterSidebar from "@/components/products/FilterSidebar";
import ProductGrid from "@/components/products/ProductGrid";
import Footer from "@/components/homepage/footer/Footer";
import { useProducts, useFeaturedProducts } from "@/hooks/use-products";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export default function Home() {
  const [headerSearch, setHeaderSearch] = useState("");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSidebarSearch(headerSearch);
  };

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
      {/* Navbar */}
      <nav className="fixed top-0 left-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-purple-600 p-2 rounded-xl shadow-md">
              <Sun className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              Power<span className="text-purple-600"> - 8</span>
            </span>
          </Link>

          {/* Center Search */}
          <form
            onSubmit={handleHeaderSearch}
            className="hidden md:flex items-center flex-1 max-w-lg mx-8"
          >
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full h-11 pl-11 pr-4 rounded-l-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              className="h-11 px-6 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-r-xl transition-colors shrink-0"
            >
              Search
            </button>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <ShoppingCart size={20} className="text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition"
            >
              <LogIn size={16} />
              Login
            </Link>
            <Link
              href="/register"
              className="hidden sm:flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <UserPlus size={16} />
              Sign Up
            </Link>
            {/* Mobile */}
            <Link
              href="/login"
              className="sm:hidden p-2 border border-gray-200 rounded-lg"
            >
              <LogIn size={18} className="text-gray-600" />
            </Link>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleHeaderSearch} className="flex">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full h-10 pl-9 pr-3 rounded-l-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-4 bg-purple-600 text-white text-sm font-medium rounded-r-lg"
            >
              Search
            </button>
          </form>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-24 md:pt-20 pb-12">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <div className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
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
