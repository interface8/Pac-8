"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, ArrowRight } from "lucide-react";
import type { ApiCategory } from "@/hooks/use-categories";

interface CategoryMegaProps {
  categories: ApiCategory[];
  loading: boolean;
}

export default function CategoryMega({ categories, loading }: CategoryMegaProps) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enter = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const leave = () => {
    timer.current = setTimeout(() => {
      setOpen(false);
      setActiveId(null);
    }, 220);
  };

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );
  useEffect(() => {
    if (open && categories.length && !activeId) setActiveId(categories[0].id);
  }, [open, categories, activeId]);

  const active = categories.find((c) => c.id === activeId);

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        className={`flex items-center gap-1 text-[13px] font-semibold tracking-wide uppercase transition-colors ${
          open
            ? "text-primary"
            : "text-foreground/70 hover:text-primary"
        }`}
      >
        Categories
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-4 w-[640px] bg-card rounded-2xl shadow-2xl shadow-black/8 ring-1 ring-black/5 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {loading ? (
            <div className="p-8 grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-muted rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No categories yet
            </div>
          ) : (
            <div className="flex min-h-[280px]">
              {/* Left – parent list */}
              <div className="w-[220px] bg-muted/40 py-3 border-r border-border">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?categoryId=${cat.id}`}
                    onMouseEnter={() => setActiveId(cat.id)}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between px-5 py-2.5 text-[13px] transition-all ${
                      activeId === cat.id
                        ? "bg-card text-primary font-semibold shadow-sm border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/50 border-l-2 border-transparent"
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {cat.children && cat.children.length > 0 && (
                      <ChevronRight
                        size={13}
                        className="text-muted-foreground/50 shrink-0"
                      />
                    )}
                  </Link>
                ))}
                <div className="mx-5 mt-2 pt-2 border-t border-border">
                  <Link
                    href="/products"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:text-primary/80 py-1.5"
                  >
                    View all products
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Right – subcategories */}
              <div className="flex-1 p-6">
                {active ? (
                  <>
                    <Link
                      href={`/products?categoryId=${active.id}`}
                      onClick={() => setOpen(false)}
                      className="text-sm font-bold text-foreground hover:text-primary transition-colors"
                    >
                      {active.name}
                    </Link>
                    {active.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-sm">
                        {active.description}
                      </p>
                    )}
                    {active.children && active.children.length > 0 ? (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-4">
                        {active.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/products?categoryId=${child.id}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between py-2 text-[13px] text-muted-foreground hover:text-primary transition-colors group"
                          >
                            <span>{child.name}</span>
                            {child.productCount !== undefined &&
                              child.productCount > 0 && (
                                <span className="text-[11px] text-muted-foreground/50 group-hover:text-primary/60 tabular-nums">
                                  {child.productCount}
                                </span>
                              )}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-6 text-sm text-muted-foreground/50">
                        No subcategories
                      </p>
                    )}
                    <div className="mt-5 pt-3 border-t border-border">
                      <Link
                        href={`/products?categoryId=${active.id}`}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
                      >
                        Shop all {active.name} <ArrowRight size={12} />
                      </Link>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground/50 mt-10 text-center">
                    Hover a category
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
