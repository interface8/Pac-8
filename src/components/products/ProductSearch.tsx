"use client";
import { Search, Funnel, ChevronDown } from "lucide-react";
import { useState } from "react";

const categories = [
  "All Categories",
  "Solar Panels",
  "Inverters",
  "Batteries",
  "Accessories",
];

export default function ProductSearch() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(categories[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center gap-3">
      {/* Search */}
      <div className="relative flex-3">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full h-11 pl-11 pr-4 rounded-xl  bg-green-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
      </div>

      {/* Filter */}
      <div className="relative min-w-50">
        <button
          onClick={() => setOpen(!open)}
          className="w-full h-11 px-4 rounded-xl bg-green-50 text-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Funnel size={16} className="text-gray-400" />
            {selected}
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute mt-2 w-full bg-white  border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            {categories.map((item) => (
              <div
                key={item}
                onClick={() => {
                  setSelected(item);
                  setOpen(false);
                }}
                className="px-4 py-2 text-sm text-black cursor-pointer hover:bg-green-200 transition"
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
