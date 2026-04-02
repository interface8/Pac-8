"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountShell } from "@/components/account/AccountShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingBag,
  Search,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImage: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  PENDING: { color: "text-amber-700", bg: "bg-amber-100 border-amber-200", icon: Clock },
  CONFIRMED: { color: "text-blue-700", bg: "bg-blue-100 border-blue-200", icon: Package },
  PROCESSING: { color: "text-blue-700", bg: "bg-blue-100 border-blue-200", icon: Package },
  SHIPPED: { color: "text-purple-700", bg: "bg-purple-100 border-purple-200", icon: Truck },
  DELIVERED: { color: "text-green-700", bg: "bg-green-100 border-green-200", icon: CheckCircle2 },
  CANCELLED: { color: "text-red-700", bg: "bg-red-100 border-red-200", icon: XCircle },
  REFUNDED: { color: "text-gray-700", bg: "bg-gray-100 border-gray-200", icon: XCircle },
};

const ALL_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.data ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search || o.orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AccountShell title="My Orders" description="Track and manage your orders.">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v === "ALL" ? "" : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : !filtered.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingBag className="mx-auto size-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              {orders.length ? "No orders match your filters." : "You haven't placed any orders yet."}
            </p>
            {!orders.length && (
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
            const StatusIcon = config.icon;

            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.orderNumber}`}
                className="block group"
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Left: Order info */}
                      <div className="flex-1 p-4 sm:p-5">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm font-semibold">
                            {order.orderNumber}
                          </span>
                          <Badge
                            variant="outline"
                            className={`${config.bg} ${config.color} gap-1`}
                          >
                            <StatusIcon className="size-3" />
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {new Date(order.createdAt).toLocaleDateString("en-NG", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-muted rounded-md px-2 py-1 text-muted-foreground"
                            >
                              {item.productName} ×{item.quantity}
                            </span>
                          ))}
                          {order.items.length > 3 && (
                            <span className="text-xs bg-muted rounded-md px-2 py-1 text-muted-foreground">
                              +{order.items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Total & action */}
                      <div className="flex items-center justify-between sm:flex-col sm:justify-center sm:items-end gap-2 px-4 pb-4 sm:p-5 sm:border-l border-border sm:min-w-[140px]">
                        <p className="text-lg font-bold">
                          ₦{Number(order.totalAmount).toLocaleString()}
                        </p>
                        <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          View Details <ArrowRight className="size-3" />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </AccountShell>
  );
}
