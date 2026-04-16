"use client";

import { useState } from "react";
import { Check, Truck, Package, RotateCcw } from "lucide-react";

interface ProductTabsProps {
  description: string | null;
  shortDescription: string | null;
  sku: string;
  weight: number | null;
  dimensions: string | null;
  categoryName: string;
  allowCustomPrint: boolean;
  printPrice: number | null;
  lowStockThreshold: number;
  deliveryTime: string | null;
}

export default function ProductTabs({
  description,
  shortDescription,
  sku,
  weight,
  dimensions,
  categoryName,
  allowCustomPrint,
  printPrice,
  lowStockThreshold,
  deliveryTime,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "shipping">("description");

  let parsedDimensions: { length?: number; width?: number; height?: number } | null = null;
  if (dimensions) {
    try {
      parsedDimensions = JSON.parse(dimensions);
    } catch {
      // plain string, handled below
    }
  }

  return (
    <section className="mt-16">
      <div className="flex gap-2 mb-6">
        {(["description", "specs", "shipping"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all capitalize ${
              activeTab === tab
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {tab === "specs" ? "Specifications" : tab}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
        {activeTab === "description" && (
          <div className="space-y-4">
            {description ? (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No description available.</p>
            )}

            {shortDescription && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Product Highlights</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {shortDescription.split(",").map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center mt-0.5 shrink-0">
                        <Check size={12} className="text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "specs" && (
          <div className="space-y-3">
            {[
              { label: "SKU", value: sku },
              { label: "Weight", value: weight ? `${weight}kg` : null },
              {
                label: "Dimensions",
                value: parsedDimensions
                  ? `${parsedDimensions.length} × ${parsedDimensions.width} × ${parsedDimensions.height}cm`
                  : dimensions ?? null,
              },
              { label: "Category", value: categoryName },
              { label: "Custom Print", value: allowCustomPrint ? "Available" : "Not Available" },
              { label: "Print Surcharge", value: printPrice ? `₦${printPrice.toLocaleString()}` : null },
              { label: "Low Stock Threshold", value: `${lowStockThreshold} units` },
            ]
              .filter((s) => s.value)
              .map((spec) => (
                <div key={spec.label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{spec.label}</span>
                  <span className="text-sm font-medium text-foreground">{spec.value}</span>
                </div>
              ))}
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <div className="flex items-start gap-3">
              <Truck size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Delivery Time</p>
                <p>{deliveryTime ?? "Standard delivery: 3-7 business days"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Packaging</p>
                <p>All items are carefully packed to ensure safe delivery. Custom printed items include protective wrapping.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RotateCcw size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Returns</p>
                <p>We accept returns within 7 days for standard items. Custom printed items are non-refundable.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
