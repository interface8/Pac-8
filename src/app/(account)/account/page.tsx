"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountShell } from "@/components/account/AccountShell";
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: { productName: string; quantity: number; productImage: string | null }[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-amber-600",
  CONFIRMED: "text-blue-600",
  PROCESSING: "text-blue-600",
  SHIPPED: "text-purple-600",
  DELIVERED: "text-green-600",
  CANCELLED: "text-red-600",
  REFUNDED: "text-gray-600",
};

export default function AccountPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, profileRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/auth/me"),
        ]);
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setOrders(data.data ?? []);
        }
        if (profileRes.ok) {
          const data = await profileRes.json();
          setUser(data.user ?? null);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const recentOrders = orders.slice(0, 3);
  const pendingCount = orders.filter((o) =>
    ["PENDING", "CONFIRMED", "PROCESSING"].includes(o.status)
  ).length;
  const shippedCount = orders.filter((o) => o.status === "SHIPPED").length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <AccountShell title={loading ? "My Account" : `Welcome back, ${user?.name ?? "there"}`} description="Overview of your account activity.">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <StatCard
          icon={<Clock className="size-5 text-amber-600" />}
          label="In Progress"
          value={loading ? null : pendingCount}
          bg="bg-amber-50"
        />
        <StatCard
          icon={<Package className="size-5 text-purple-600" />}
          label="Shipped"
          value={loading ? null : shippedCount}
          bg="bg-purple-50"
        />
        <StatCard
          icon={<CheckCircle2 className="size-5 text-green-600" />}
          label="Delivered"
          value={loading ? null : deliveredCount}
          bg="bg-green-50"
        />
      </div>

      {/* Recent Orders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account/orders">
              View All <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : !recentOrders.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="mx-auto size-10 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No orders yet.</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.orderNumber}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-medium">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`text-xs font-semibold ${STATUS_COLORS[order.status] ?? "text-muted-foreground"}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {order.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">
                        ₦{Number(order.totalAmount).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AccountShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  bg: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`rounded-lg p-2 ${bg}`}>{icon}</div>
        <div>
          {value === null ? (
            <Skeleton className="h-7 w-8 mb-1" />
          ) : (
            <p className="text-2xl font-bold">{value}</p>
          )}
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
