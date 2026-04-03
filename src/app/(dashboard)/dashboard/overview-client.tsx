"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Package,
  ShoppingCart,
  CircleDollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  Truck,
  Star,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalCategories: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueGrowth: number;
  thisMonthOrders: number;
  ordersGrowth: number;
  pendingOrders: number;
  ordersByStatus: Record<string, number>;
  paymentsByStatus: Record<string, number>;
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    itemCount: number;
    createdAt: string;
  }[];
  lowStockProducts: {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    lowStockThreshold: number;
  }[];
  topProducts: {
    name: string;
    totalSold: number;
    totalRevenue: number;
  }[];
}

async function fetchStats(): Promise<{ data: DashboardStats }> {
  const res = await fetch("/api/admin/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  AWAITING_PAYMENT: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
  PARTIALLY_REFUNDED: "bg-orange-100 text-orange-800",
};

export function DashboardOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchStats,
  });

  const stats = data?.data;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={stats ? `₦${stats.totalRevenue.toLocaleString()}` : undefined}
          subtitle={stats ? `₦${stats.thisMonthRevenue.toLocaleString()} this month` : undefined}
          growth={stats?.revenueGrowth}
          icon={<CircleDollarSign className="size-5" />}
          iconBg="bg-green-100 text-green-600"
          loading={isLoading}
        />
        <KPICard
          title="Total Orders"
          value={stats?.totalOrders?.toString()}
          subtitle={stats ? `${stats.thisMonthOrders} this month` : undefined}
          growth={stats?.ordersGrowth}
          icon={<ShoppingCart className="size-5" />}
          iconBg="bg-blue-100 text-blue-600"
          loading={isLoading}
        />
        <KPICard
          title="Products"
          value={stats?.totalProducts?.toString()}
          subtitle={stats ? `${stats.activeProducts} active` : undefined}
          icon={<Package className="size-5" />}
          iconBg="bg-purple-100 text-purple-600"
          loading={isLoading}
        />
        <KPICard
          title="Customers"
          value={stats?.totalUsers?.toString()}
          subtitle="Registered accounts"
          icon={<Users className="size-5" />}
          iconBg="bg-orange-100 text-orange-600"
          loading={isLoading}
        />
      </div>

      {/* Quick Stats Row */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickStat icon={<Clock className="size-4 text-yellow-600" />} label="Pending Orders" value={stats.pendingOrders} href="/dashboard/orders" />
          <QuickStat icon={<Truck className="size-4 text-purple-600" />} label="Shipped" value={stats.ordersByStatus["SHIPPED"] ?? 0} href="/dashboard/orders" />
          <QuickStat icon={<CheckCircle2 className="size-4 text-green-600" />} label="Delivered" value={stats.ordersByStatus["DELIVERED"] ?? 0} href="/dashboard/orders" />
          <QuickStat icon={<AlertTriangle className="size-4 text-red-600" />} label="Low Stock Items" value={stats.lowStockProducts.length} href="/dashboard/products" />
        </div>
      )}

      {/* Order Status + Payment Status */}
      {stats && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(stats.ordersByStatus).map(([status, count]) => {
                const pct = stats.totalOrders > 0 ? Math.round((count / stats.totalOrders) * 100) : 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] ${ORDER_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800"}`}>{status}</Badge>
                      </span>
                      <span className="font-medium">{count} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
              {Object.keys(stats.ordersByStatus).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(stats.paymentsByStatus).map(([status, count]) => {
                const pct = stats.totalOrders > 0 ? Math.round((count / stats.totalOrders) * 100) : 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline" className={`text-[10px] ${PAYMENT_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800"}`}>{status.replace(/_/g, " ")}</Badge>
                      <span className="font-medium">{count} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
              {Object.keys(stats.paymentsByStatus).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No payments yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders — 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Orders</CardTitle>
              <CardDescription>Latest 5 orders</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/orders" className="gap-1 text-xs">View All <ArrowUpRight className="size-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (<TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>))}
                    </TableRow>
                  ))
                ) : !stats?.recentOrders.length ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-16 text-center text-muted-foreground">No orders yet.</TableCell>
                  </TableRow>
                ) : (
                  stats.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <p className="font-mono text-xs font-medium">{order.orderNumber}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.itemCount} items</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${ORDER_STATUS_COLORS[order.status]}`}>{order.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}>{order.paymentStatus.replace(/_/g, " ")}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">₦{order.totalAmount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>

        {/* Top Products — 1 col */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Star className="size-4 text-amber-500" /> Top Products</CardTitle>
            <CardDescription>Best sellers by revenue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-10 w-full" />))
            ) : !stats?.topProducts.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">No sales data yet</p>
            ) : (
              stats.topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-bold">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.totalSold} sold</p>
                  </div>
                  <span className="text-sm font-medium text-green-600">₦{product.totalRevenue.toLocaleString()}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-amber-500" /> Low Stock Alerts
            </CardTitle>
            <CardDescription>Products at or below their stock threshold</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/products" className="gap-1 text-xs">Manage <ArrowUpRight className="size-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Threshold</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => (<TableCell key={j}><Skeleton className="h-4 w-16" /></TableCell>))}</TableRow>
                ))
              ) : !stats?.lowStockProducts.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-16 text-center text-muted-foreground">All products are well stocked.</TableCell>
                </TableRow>
              ) : (
                stats.lowStockProducts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                    <TableCell className="text-right">
                      <span className={p.quantity === 0 ? "text-red-600 font-bold" : "text-amber-600 font-medium"}>{p.quantity}</span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{p.lowStockThreshold}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={p.quantity === 0 ? "destructive" : "outline"} className={p.quantity === 0 ? "" : "border-amber-200 bg-amber-50 text-amber-700"}>
                        {p.quantity === 0 ? "Out of Stock" : "Low Stock"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KPICard({
  title,
  value,
  subtitle,
  growth,
  icon,
  iconBg,
  loading,
}: {
  title: string;
  value?: string;
  subtitle?: string;
  growth?: number;
  icon: React.ReactNode;
  iconBg: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <p className="text-2xl font-bold tracking-tight">{value}</p>
            )}
            <div className="flex items-center gap-2">
              {growth !== undefined && growth !== 0 && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${growth > 0 ? "text-green-600" : "text-red-600"}`}>
                  {growth > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {growth > 0 ? "+" : ""}{growth}%
                </span>
              )}
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <div className={`rounded-xl p-2.5 ${iconBg}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickStat({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: number; href: string }) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-lg bg-muted p-2">{icon}</div>
          <div>
            <p className="text-lg font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
