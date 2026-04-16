"use client";

import Image from "next/image";
import { MapPin, CreditCard, Package, Shield, ChevronLeft, Loader2 } from "lucide-react";
import type { ShippingAddress, ShippingMethod, PaymentMethod } from "@/lib/constants/checkout";
import { SHIPPING_RATES } from "@/lib/constants/checkout";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ReviewStepProps {
  address: ShippingAddress;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  cartItems: CartItem[];
  total: number;
  orderLoading: boolean;
  onEditShipping: () => void;
  onEditPayment: () => void;
  onBack: () => void;
  onPlaceOrder: () => void;
}

export default function ReviewStep({
  address,
  shippingMethod,
  paymentMethod,
  cartItems,
  total,
  orderLoading,
  onEditShipping,
  onEditPayment,
  onBack,
  onPlaceOrder,
}: ReviewStepProps) {
  return (
    <div className="space-y-6">
      {/* Shipping Summary */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MapPin size={18} /> Shipping
          </h2>
          <button onClick={onEditShipping} className="text-sm text-primary hover:text-primary/80 transition">
            Edit
          </button>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            {address.firstName} {address.lastName}
          </p>
          <p>
            {address.addressLine1}
            {address.addressLine2 ? `, ${address.addressLine2}` : ""}
          </p>
          <p>
            {address.city}, {address.state} — {address.country}
          </p>
          {address.phone && <p>{address.phone}</p>}
        </div>
        <div className="text-sm text-muted-foreground pt-2 border-t border-border">
          <span className="font-medium text-foreground">{SHIPPING_RATES[shippingMethod].label}</span>
          <span className="ml-2">({SHIPPING_RATES[shippingMethod].days})</span>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CreditCard size={18} /> Payment
          </h2>
          <button onClick={onEditPayment} className="text-sm text-primary hover:text-primary/80 transition">
            Edit
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {paymentMethod === "stripe" ? "Card Payment (Stripe)" : "Bank Transfer"}
        </p>
      </div>

      {/* Order Items */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Package size={18} /> Items ({cartItems.length})
        </h2>
        <div className="divide-y divide-border">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
              <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-foreground">
                ₦{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Place Order */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="h-12 px-6 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition flex items-center gap-2"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={onPlaceOrder}
          disabled={orderLoading}
          className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {orderLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Placing Order...
            </>
          ) : (
            <>
              <Shield size={18} /> Place Order — ₦{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
