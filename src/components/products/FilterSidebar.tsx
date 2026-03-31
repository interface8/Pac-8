"use client";

import { useState } from "react";
import { SlidersHorizontal, Search, Star, Sparkles, Palette } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useCategories, type ApiCategory } from "@/hooks/use-categories";

interface FilterSidebarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice?: number;
  inStockOnly: boolean;
  onInStockChange: (value: boolean) => void;
  isFeatured: boolean;
  onIsFeaturedChange: (value: boolean) => void;
  isLowBudget: boolean;
  onIsLowBudgetChange: (value: boolean) => void;
}

function flattenCategories(categories: ApiCategory[]): ApiCategory[] {
  const result: ApiCategory[] = [];
  for (const cat of categories) {
    result.push(cat);
    if (cat.children?.length) {
      result.push(...flattenCategories(cat.children));
    }
  }
  return result;
}

export default function FilterSidebar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  priceRange,
  onPriceRangeChange,
  maxPrice = 500000,
  inStockOnly,
  onInStockChange,
  isFeatured,
  onIsFeaturedChange,
  isLowBudget,
  onIsLowBudgetChange,
}: FilterSidebarProps) {
  const { categories, loading: categoriesLoading } = useCategories();
  const allCategories = flattenCategories(categories);
  const [localPrice, setLocalPrice] = useState<[number, number]>(priceRange);

  const formatPrice = (value: number) => `₦${value.toLocaleString()}`;

  return (
    <aside className="w-full space-y-1">
      {/* Filters heading */}
      <div className="flex items-center gap-2 px-1 mb-4">
        <SlidersHorizontal size={18} className="text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Filters</h2>
      </div>

      {/* Search Products */}
      <div className="mb-4">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Search Products
        </label>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
        </div>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["categories", "price", "availability", "tags"]}
        className="space-y-0"
      >
        {/* Categories — single select (radio behavior) */}
        <AccordionItem value="categories" className="border-b border-border">
          <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-3">
            Categories
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1 pb-2">
              {categoriesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : allCategories.length > 0 ? (
                allCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => onCategorySelect(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                        isSelected
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition ${
                            isSelected ? "border-primary" : "border-muted-foreground/40"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </div>
                        {cat.name}
                      </div>
                      {cat.productCount !== undefined && (
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {cat.productCount}
                        </span>
                      )}
                    </button>
                  );
                })
              ) : null}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Tags: Featured, Budget, Custom Print */}
        <AccordionItem value="tags" className="border-b border-border">
          <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-3">
            Product Tags
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2.5 pb-2">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <Checkbox
                  checked={isFeatured}
                  onCheckedChange={(checked) => onIsFeaturedChange(checked === true)}
                  className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
                <Star size={14} className="text-amber-500" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition">
                  Featured
                </span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <Checkbox
                  checked={isLowBudget}
                  onCheckedChange={(checked) => onIsLowBudgetChange(checked === true)}
                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <Sparkles size={14} className="text-green-600" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition">
                  Budget Friendly
                </span>
              </label>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price" className="border-b border-border">
          <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-3">
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-1 pb-2">
              <Slider
                min={0}
                max={maxPrice}
                step={1000}
                value={localPrice}
                onValueChange={(v) => setLocalPrice(v as [number, number])}
                onValueCommit={(v) => onPriceRangeChange(v as [number, number])}
                className="mb-4 [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:border-primary [&_[data-slot=slider-thumb]]:size-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="bg-muted px-2 py-1 rounded">
                  {formatPrice(localPrice[0])}
                </span>
                <span className="bg-muted px-2 py-1 rounded">
                  {formatPrice(localPrice[1])}
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Availability */}
        <AccordionItem value="availability" className="border-b border-border">
          <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-3">
            Availability
          </AccordionTrigger>
          <AccordionContent>
            <label className="flex items-center gap-2.5 cursor-pointer pb-2">
              <Checkbox
                checked={inStockOnly}
                onCheckedChange={(checked) => onInStockChange(checked === true)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm text-muted-foreground">In Stock Only</span>
            </label>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
