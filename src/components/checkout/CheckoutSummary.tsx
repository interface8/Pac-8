"use client";

import Image from "next/image";
import { Palette } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  customPrint?: boolean;
  printPrice?: number;
}

interface CheckoutSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  discount: number;
  vat: number;
  shipping: number;
  total: number;
}

export default function CheckoutSummary({
  cartItems,
  subtotal,
  discount,
  vat,
  shipping,
  total,
}: CheckoutSummaryProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 lg:sticky lg:top-28 space-y-4">
      <h3 className="text-lg font-bold text-foreground">Order Summary</h3>

      {/* Items preview */}
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative w-12 h-12 bg-muted rounded-lg overflow-hidden shrink-0">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
              {item.customPrint && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary/90 rounded-tl flex items-center justify-center" title="Custom Design">
                  <Palette size={8} className="text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">×{item.quantity}</p>
              {item.customPrint && (
                <p className="text-xs text-primary">Custom Print</p>
              )}
            </div>
            <p className="text-xs font-semibold text-foreground">₦{(item.price * item.quantity).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3 space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="text-foreground font-medium">₦{subtotal.toLocaleString()}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>−₦{discount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>VAT (7.5%)</span>
          <span className="text-foreground font-medium">₦{vat.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span className="text-foreground font-medium">₦{shipping.toLocaleString()}</span>
        </div>
        <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground">
          <span>Total</span>
          <span className="text-xl text-primary">₦{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
      </div>
    </div>
  );
}
