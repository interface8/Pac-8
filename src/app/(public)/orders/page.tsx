"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Loader2,
  ShoppingBag,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

interface OrderItem {
  id: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { icon: typeof Package; color: string; bg: string; label: string }> = {
  PENDING: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30", label: "Pending" },
  CONFIRMED: { icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", label: "Confirmed" },
  PROCESSING: { icon: Package, color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30", label: "Processing" },
  SHIPPED: { icon: Truck, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30", label: "Shipped" },
  DELIVERED: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", label: "Delivered" },
  CANCELLED: { icon: XCircle, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", label: "Cancelled" },
  REFUNDED: { icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30", label: "Refunded" },
};

export default function OrderHistoryPage() {
  const user = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetch("/api/orders")
      .then((res) => res.json())
      .then((json) => setOrders(json.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router]);

  if (loading) {
    return (
      <div className="pt-32 md:pt-28 pb-16 px-4 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-32 md:pt-28 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <ShoppingBag size={48} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">When you place an order, it will appear here.</p>
            <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
              const StatusIcon = statusCfg.icon;

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.orderNumber}`}
                  className="group block bg-card rounded-xl border border-border p-5 hover:border-primary/50 hover:shadow-sm transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Product image preview */}
                    <div className="flex -space-x-3">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div
                          key={item.id}
                          className="relative w-14 h-14 bg-muted rounded-lg overflow-hidden border-2 border-card"
                          style={{ zIndex: 3 - i }}
                        >
                          {item.productImage ? (
                            <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={16} className="text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-14 h-14 bg-muted rounded-lg border-2 border-card flex items-center justify-center text-xs font-bold text-muted-foreground">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>

                    {/* Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-sm font-bold font-mono text-foreground">{order.orderNumber}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                          <StatusIcon size={12} />
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-NG", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                        {" · "}
                        {order.items.reduce((acc, item) => acc + item.quantity, 0)} item(s)
                      </p>
                    </div>

                    {/* Total + chevron */}
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold text-foreground">₦{order.totalAmount.toLocaleString()}</p>
                      <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
