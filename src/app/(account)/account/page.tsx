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
  Palette,
  Image as ImageIcon,
} from "lucide-react";

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: { productName: string; quantity: number; productImage: string | null }[];
}

interface DesignSummary {
  id: string;
  name: string;
  status: "DRAFT" | "COMPLETED" | "ARCHIVED";
  thumbnailUrl: string | null;
  productName: string;
  productSlug: string;
  updatedAt: string;
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
  const [designs, setDesigns] = useState<DesignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, profileRes, designsRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/auth/me"),
          fetch("/api/designs"),
        ]);
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setOrders(data.data ?? []);
        }
        if (profileRes.ok) {
          const data = await profileRes.json();
          setUser(data.user ?? null);
        }
        if (designsRes.ok) {
          const data = await designsRes.json();
          setDesigns(data.data ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const recentOrders = orders.slice(0, 3);
  const recentDesigns = designs.filter((d) => d.status !== "ARCHIVED").slice(0, 3);
  const draftCount = designs.filter((d) => d.status === "DRAFT").length;
  const pendingCount = orders.filter((o) =>
    ["PENDING", "CONFIRMED", "PROCESSING"].includes(o.status)
  ).length;
  const shippedCount = orders.filter((o) => o.status === "SHIPPED").length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <AccountShell title={loading ? "My Account" : `Welcome back, ${user?.name ?? "there"}`} description="Overview of your account activity.">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
        <StatCard
          icon={<Palette className="size-5 text-blue-600" />}
          label="Saved Drafts"
          value={loading ? null : draftCount}
          bg="bg-blue-50"
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

      {/* Recent Designs */}
      <div className="space-y-4 mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Designs</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account/designs">
              View All <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : !recentDesigns.length ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Palette className="mx-auto size-9 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm">No saved designs yet.</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {recentDesigns.map((d) => (
              <Link
                key={d.id}
                href={`/products/${d.productSlug}/customize?designId=${d.id}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow overflow-hidden">
                  <div className="aspect-video bg-muted/30 flex items-center justify-center relative">
                    {d.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.thumbnailUrl}
                        alt={d.name}
                        className="object-contain w-full h-full p-2"
                      />
                    ) : (
                      <ImageIcon className="size-8 text-muted-foreground/30" />
                    )}
                    <span className="absolute top-1.5 right-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      {d.status}
                    </span>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">{d.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{d.productName}</p>
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
