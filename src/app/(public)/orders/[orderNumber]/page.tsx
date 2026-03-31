"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  XCircle,
  Loader2,
  CreditCard,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  productSku: string;
  quantity: number;
  customPrint: boolean;
  printText: string | null;
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
  customerPhone: string | null;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingMethod: string | null;
  paymentMethod: string | null;
  paymentReference: string | null;
  trackingNumber: string | null;
  customerNotes: string | null;
  items: OrderItem[];
  createdAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
}

const STATUS_STEPS = [
  { key: "PENDING", icon: Clock, label: "Placed" },
  { key: "CONFIRMED", icon: CheckCircle2, label: "Confirmed" },
  { key: "PROCESSING", icon: Package, label: "Processing" },
  { key: "SHIPPED", icon: Truck, label: "Shipped" },
  { key: "DELIVERED", icon: MapPin, label: "Delivered" },
];

const STATUS_ORDER = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

const PAYMENT_LABELS: Record<string, string> = {
  AWAITING_PAYMENT: "Awaiting Payment",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  PARTIALLY_REFUNDED: "Partially Refunded",
};

export default function OrderDetailPage() {
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
          <p className="text-muted-foreground mb-6">We couldn&apos;t find that order.</p>
          <Link href="/orders" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
  const statusIndex = STATUS_ORDER.indexOf(order.status);

  return (
    <div className="pt-32 md:pt-28 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition mb-2">
              <ArrowLeft size={14} /> Back to Orders
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono text-foreground">{order.orderNumber}</h1>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(order.orderNumber);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-1.5 rounded-md hover:bg-muted transition"
                title="Copy"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-muted-foreground" />}
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-NG", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Status Timeline */}
        {!isCancelled ? (
          <div className="bg-card border border-border rounded-xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">Order Progress</h2>
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = i <= statusIndex;
                const isCurrent = i === statusIndex;

                return (
                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        <StepIcon size={18} />
                      </div>
                      <span className={`text-[11px] font-medium mt-2 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-2 mt-[-18px] ${isActive && i < statusIndex ? "bg-primary/40" : "bg-border"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={`rounded-xl p-5 mb-6 flex items-center gap-3 ${
            order.status === "CANCELLED"
              ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              : "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
          }`}>
            {order.status === "CANCELLED" ? (
              <XCircle size={20} className="text-red-600 shrink-0" />
            ) : (
              <AlertTriangle size={20} className="text-orange-600 shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">
                Order {order.status === "CANCELLED" ? "Cancelled" : "Refunded"}
              </p>
              <p className="text-xs text-muted-foreground">
                {order.status === "CANCELLED"
                  ? "This order has been cancelled."
                  : "A refund has been issued for this order."}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">Items ({order.items.length})</h2>
              <div className="divide-y divide-border">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden shrink-0">
                      {item.productImage ? (
                        <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={20} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.productName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">SKU: {item.productSku}</p>
                      {item.customPrint && item.printText && (
                        <p className="text-xs text-primary mt-1">Custom: &quot;{item.printText}&quot;</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.quantity} × ₦{item.unitPrice.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-foreground shrink-0">
                      ₦{item.totalPrice.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking */}
            {order.trackingNumber && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Truck size={16} /> Tracking
                </h2>
                <p className="text-sm font-mono text-foreground">{order.trackingNumber}</p>
                {order.shippedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Shipped on {new Date(order.shippedAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Summary + Payment */}
          <div className="space-y-6">
            {/* Payment Info */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <CreditCard size={16} /> Payment
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="text-foreground font-medium">
                    {order.paymentMethod === "BANK_TRANSFER" ? "Bank Transfer" : "Card"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium ${
                    order.paymentStatus === "PAID" ? "text-green-600"
                    : order.paymentStatus === "FAILED" ? "text-red-600"
                    : "text-yellow-600"
                  }`}>
                    {PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus}
                  </span>
                </div>
                {order.paymentReference && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="text-foreground font-mono text-xs">{order.paymentReference.slice(0, 16)}...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Summary</h2>
              <div className="space-y-2 text-sm">
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
                  <span>VAT</span>
                  <span>₦{order.taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>₦{order.shippingAmount.toLocaleString()}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
                  <span>Total</span>
                  <span className="text-primary text-lg">₦{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Customer</h2>
              <div className="space-y-1.5 text-sm">
                <p className="text-foreground font-medium">{order.customerName}</p>
                <p className="text-muted-foreground">{order.customerEmail}</p>
                {order.customerPhone && <p className="text-muted-foreground">{order.customerPhone}</p>}
              </div>
            </div>

            {/* Shipping Method */}
            {order.shippingMethod && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Truck size={16} /> Delivery
                </h2>
                <p className="text-sm text-foreground capitalize">{order.shippingMethod.replace("_", " ")} Delivery</p>
                {order.deliveredAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Delivered {new Date(order.deliveredAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
