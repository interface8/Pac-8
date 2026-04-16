"use client";

import { Layers } from "lucide-react";

interface PriceTier {
  id: string;
  minQuantity: number;
  discountType: string;
  discountValue: number;
  isActive: boolean;
}

interface PricingTiersProps {
  tiers: PriceTier[];
  basePrice: number;
  currentQuantity: number;
}

export default function PricingTiers({ tiers, basePrice, currentQuantity }: PricingTiersProps) {
  const activeTiers = tiers.filter((t) => t.isActive).sort((a, b) => a.minQuantity - b.minQuantity);
  if (activeTiers.length === 0) return null;

  const applicableTier = [...activeTiers].reverse().find((t) => currentQuantity >= t.minQuantity);

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
        <Layers size={14} className="text-primary" /> Bulk Pricing
      </h3>
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[320px]">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Quantity</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Discount</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">Unit Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activeTiers.map((tier) => {
              const tierUnit =
                tier.discountType === "PERCENTAGE"
                  ? basePrice * (1 - tier.discountValue / 100)
                  : basePrice - tier.discountValue;
              const isActive = applicableTier?.id === tier.id;
              return (
                <tr key={tier.id} className={isActive ? "bg-green-50/50" : ""}>
                  <td className="px-4 py-2.5 text-foreground">{tier.minQuantity}+ units</td>
                  <td className="px-4 py-2.5">
                    <span className="text-green-700 font-medium">
                      {tier.discountType === "PERCENTAGE"
                        ? `${tier.discountValue}% off`
                        : `₦${tier.discountValue.toLocaleString()} off`}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-foreground">
                    ₦{tierUnit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
