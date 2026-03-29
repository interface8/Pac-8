"use client";

import { useState } from "react";
import { SlidersHorizontal, Search } from "lucide-react";
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
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice?: number;
  inStockOnly: boolean;
  onInStockChange: (value: boolean) => void;
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
  selectedCategories,
  onCategoryToggle,
  priceRange,
  onPriceRangeChange,
  maxPrice = 500000,
  inStockOnly,
  onInStockChange,
}: FilterSidebarProps) {
  const { categories, loading: categoriesLoading } = useCategories();
  const allCategories = flattenCategories(categories);
  const [localPrice, setLocalPrice] = useState<[number, number]>(priceRange);

  const formatPrice = (value: number) =>
    `₦${value.toLocaleString()}`;

  return (
    <aside className="w-full space-y-1">
      {/* Filters heading */}
      <div className="flex items-center gap-2 px-1 mb-4">
        <SlidersHorizontal size={18} className="text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
      </div>

      {/* Search Products */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
          Search Products
        </label>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["categories", "price", "availability"]}
        className="space-y-0"
      >
        {/* Categories */}
        <AccordionItem value="categories" className="border-b border-gray-100">
          <AccordionTrigger className="text-sm font-semibold text-gray-800 hover:no-underline py-3">
            Categories
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2.5 pb-2">
              {categoriesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-5 bg-gray-100 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : allCategories.length > 0 ? (
                allCategories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Checkbox
                        checked={selectedCategories.includes(cat.id)}
                        onCheckedChange={() => onCategoryToggle(cat.id)}
                        className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition">
                        {cat.name}
                      </span>
                    </div>
                    {cat.productCount !== undefined && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {cat.productCount}
                      </span>
                    )}
                  </label>
                ))
              ) : (
                // Fallback categories when API is empty
                ["Solar Panels", "Inverters", "Batteries", "Accessories"].map(
                  (name, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-2.5 cursor-pointer"
                    >
                      <Checkbox className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
                      <span className="text-sm text-gray-700">{name}</span>
                    </label>
                  )
                )
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price" className="border-b border-gray-100">
          <AccordionTrigger className="text-sm font-semibold text-gray-800 hover:no-underline py-3">
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
                onValueCommit={(v) =>
                  onPriceRangeChange(v as [number, number])
                }
                className="mb-4 [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-range]]:bg-purple-600 [&_[data-slot=slider-thumb]]:border-purple-600 [&_[data-slot=slider-thumb]]:size-4"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {formatPrice(localPrice[0])}
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {formatPrice(localPrice[1])}
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Availability */}
        <AccordionItem
          value="availability"
          className="border-b border-gray-100"
        >
          <AccordionTrigger className="text-sm font-semibold text-gray-800 hover:no-underline py-3">
            Availability
          </AccordionTrigger>
          <AccordionContent>
            <label className="flex items-center gap-2.5 cursor-pointer pb-2">
              <Checkbox
                checked={inStockOnly}
                onCheckedChange={(checked) =>
                  onInStockChange(checked === true)
                }
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <span className="text-sm text-gray-700">In Stock Only</span>
            </label>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
