"use client";

import Link from "next/link";
import {
  ArrowRight,
  Tag,
  X,
  Loader2,
  CheckCircle2,
  Package,
} from "lucide-react";

interface Promo {
  code: string;
  discount: number;
  discountType: string;
  discountValue: number;
}

interface OrderSummaryProps {
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  itemCount: number;
  cartEmpty: boolean;
  promo: Promo | null;
  promoCode: string;
  promoLoading: boolean;
  promoError: string;
  onPromoCodeChange: (value: string) => void;
  onPromoErrorChange: (value: string) => void;
  onApplyPromo: () => void;
  onRemovePromo: () => void;
}

export default function OrderSummary({
  subtotal,
  discount,
  vat,
  total,
  itemCount,
  cartEmpty,
  promo,
  promoCode,
  promoLoading,
  promoError,
  onPromoCodeChange,
  onPromoErrorChange,
  onApplyPromo,
  onRemovePromo,
}: OrderSummaryProps) {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-5 sm:p-6 lg:sticky lg:top-28 space-y-5">
      <h3 className="text-lg sm:text-xl font-bold text-foreground">
        Order Summary
      </h3>

      {/* Promo Code */}
      <div>
        {promo ? (
          <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 size={16} className="text-green-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400 truncate">
                  {promo.code}
                </p>
                <p className="text-xs text-green-600 dark:text-green-500">
                  {promo.discountType === "PERCENTAGE"
                    ? `${promo.discountValue}% off`
                    : `₦${promo.discountValue.toLocaleString()} off`}
                </p>
              </div>
            </div>
            <button
              onClick={onRemovePromo}
              className="text-green-600 hover:text-green-800 transition p-1"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    onPromoCodeChange(e.target.value.toUpperCase());
                    onPromoErrorChange("");
                  }}
                  placeholder="Promo code"
                  className="w-full h-10 pl-9 pr-3 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => e.key === "Enter" && onApplyPromo()}
                />
              </div>
              <button
                onClick={onApplyPromo}
                disabled={promoLoading || !promoCode.trim()}
                className="h-10 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50 shrink-0"
              >
                {promoLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Apply"
                )}
              </button>
            </div>
            {promoError && (
              <p className="text-xs text-red-500 mt-1.5">{promoError}</p>
            )}
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal ({itemCount} items)</span>
          <span className="text-foreground font-semibold">
            ₦{subtotal.toLocaleString()}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span className="font-semibold">
              −₦{discount.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between text-muted-foreground">
          <span>VAT (7.5%)</span>
          <span className="text-foreground font-semibold">
            ₦
            {vat.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span className="flex items-center gap-1">
            <Package size={14} /> Shipping
          </span>
          <span className="text-foreground font-medium text-xs">
            Calculated at checkout
          </span>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex justify-between font-bold text-foreground">
            <span className="text-lg">Total</span>
            <span className="text-2xl text-primary">
              ₦
              {total.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Checkout button */}
      <Link
        href="/checkout"
        className={`flex justify-center items-center gap-3 w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-xl font-semibold text-base transition shadow-sm hover:shadow active:scale-[0.98] ${
          cartEmpty ? "pointer-events-none opacity-50" : ""
        }`}
      >
        Proceed to Checkout
        <ArrowRight size={16} />
      </Link>

      {/* Payment trust indicators */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Payment Options
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="text-green-600">✔</span> Credit/Debit Card
            (Stripe)
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✔</span> Bank Transfer
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✔</span> Pay Small Small
            (Installments)
          </li>
        </ul>
      </div>
    </div>
  );
}
