"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Truck,
  CreditCard,
  MapPin,
  Clock,
  ArrowRight,
  Copy,
  Check,
  ShoppingBag,
  Loader2,
} from "lucide-react";

interface OrderItem {
  id: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  customerEmail: string;
  customerName: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingMethod: string | null;
  paymentMethod: string | null;
  items: OrderItem[];
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderNumber) return;

    fetch(`/api/orders/${orderNumber}`)
      .then((res) => {
        if (!res.ok) throw new Error("Order not found");
        return res.json();
      })
      .then((json) => setOrder(json.data || json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  const copyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="pt-32 md:pt-28 pb-16 px-4 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="pt-32 md:pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-lg mx-auto text-center">
          <Package size={48} className="text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">We couldn&apos;t find that order. Check the order number and try again.</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const isBankTransfer = order.paymentMethod === "BANK_TRANSFER";
  const isPaid = order.paymentStatus === "PAID";

  return (
    <div className="pt-32 md:pt-28 pb-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {isBankTransfer ? "Order Placed!" : isPaid ? "Payment Successful!" : "Order Confirmed!"}
          </h1>
          <p className="text-muted-foreground">
            {isBankTransfer
              ? "Your order has been placed. Complete the bank transfer to confirm."
              : `Thank you, ${order.customerName}! Your order is being processed.`}
          </p>
        </div>

        {/* Order Number Card */}
        <div className="bg-card border border-border rounded-xl p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Order Number</p>
            <p className="text-xl font-bold font-mono text-foreground mt-1">{order.orderNumber}</p>
          </div>
          <button
            onClick={copyOrderNumber}
            className="h-10 w-10 flex items-center justify-center rounded-lg bg-muted hover:bg-muted-foreground/10 transition"
            title="Copy order number"
          >
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-muted-foreground" />}
          </button>
        </div>

        {/* Bank Transfer Instructions */}
        {isBankTransfer && !isPaid && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-3">Complete Your Payment</h3>
            <div className="bg-white/60 dark:bg-black/20 rounded-lg p-4 space-y-2 text-sm mb-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank</span>
                <span className="font-medium text-foreground">Access Bank</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Name</span>
                <span className="font-medium text-foreground">PAC-8 Packaging Ltd</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Number</span>
                <span className="font-medium text-foreground font-mono">0123456789</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-foreground">₦{order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-foreground">{order.orderNumber}</span>
              </div>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Use your order number as the transfer reference. Your order will be confirmed within 24 hours of payment verification.
            </p>
          </div>
        )}

        {/* Status Timeline */}
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Order Status</h2>
          <div className="space-y-4">
            {[
              { icon: CheckCircle2, label: "Order Placed", description: new Date(order.createdAt).toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" }), active: true },
              { icon: CreditCard, label: "Payment", description: isPaid ? "Payment confirmed" : isBankTransfer ? "Awaiting bank transfer" : "Processing", active: isPaid },
              { icon: Package, label: "Processing", description: "Your order is being prepared", active: order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED" },
              { icon: Truck, label: "Shipped", description: order.shippingMethod === "express" ? "Express delivery (1-3 days)" : "Standard delivery (5-7 days)", active: order.status === "SHIPPED" || order.status === "DELIVERED" },
              { icon: MapPin, label: "Delivered", description: "Package delivered", active: order.status === "DELIVERED" },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${step.active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                    <step.icon size={16} />
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`w-0.5 flex-1 my-1 ${step.active ? "bg-primary/30" : "bg-border"}`} />
                  )}
                </div>
                <div className="pb-4">
                  <p className={`text-sm font-medium ${step.active ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <ShoppingBag size={18} /> Items ({order.items.length})
          </h2>
          <div className="divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                  {item.productImage ? (
                    <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={20} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₦{item.unitPrice.toLocaleString()}</p>
                </div>
                <p className="text-sm font-semibold text-foreground shrink-0">₦{item.totalPrice.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₦{order.subtotal.toLocaleString()}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>−₦{order.discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>VAT (7.5%)</span>
              <span>₦{order.taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>₦{order.shippingAmount.toLocaleString()}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
              <span>Total</span>
              <span className="text-primary">₦{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Estimated Delivery */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6 flex items-start gap-3">
          <Clock size={18} className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Estimated Delivery</p>
            <p className="text-sm text-muted-foreground">
              {order.shippingMethod === "express" ? "1-3 business days" : "5-7 business days"} from confirmation
            </p>
          </div>
        </div>

        {/* Confirmation Email Note */}
        <p className="text-sm text-muted-foreground text-center mb-6">
          A confirmation email has been sent to <strong className="text-foreground">{order.customerEmail}</strong>
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/orders"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <Package size={16} /> View All Orders
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition"
          >
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
