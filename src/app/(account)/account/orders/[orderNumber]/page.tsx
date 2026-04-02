"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AccountShell } from "@/components/account/AccountShell";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  productName: string;
  productSku: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customPrint: boolean;
  printText: string | null;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingMethod: string | null;
  trackingNumber: string | null;
  paymentMethod: string | null;
  customerNotes: string | null;
  createdAt: string;
  updatedAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
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

const TIMELINE_STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function OrderDetailPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.data ?? null);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderNumber]);

  async function handleCancel() {
    if (!order) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, { method: "POST" });
      if (res.ok) {
        toast.success("Order cancelled successfully");
        setOrder((prev) => (prev ? { ...prev, status: "CANCELLED" } : prev));
      } else {
        toast.error("Failed to cancel order");
      }
    } finally {
      setCancelling(false);
      setCancelOpen(false);
    }
  }

  if (loading) {
    return (
      <AccountShell title="Order Details">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-60 w-full rounded-xl" />
        </div>
      </AccountShell>
    );
  }

  if (!order) {
    return (
      <AccountShell title="Order Not Found">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              We couldn&apos;t find that order.
            </p>
            <Button variant="outline" asChild>
              <Link href="/account/orders">Back to Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </AccountShell>
    );
  }

  const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = config.icon;
  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);

  const currentStepIndex = TIMELINE_STEPS.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";

  return (
    <AccountShell title={`Order ${order.orderNumber}`} description={`Placed on ${new Date(order.createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}`}>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link href="/account/orders">
          <ArrowLeft className="size-4 mr-1" /> Back to Orders
        </Link>
      </Button>

      {/* Status + Timeline */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-6">
            <Badge variant="outline" className={`${config.bg} ${config.color} gap-1 text-sm px-3 py-1`}>
              <StatusIcon className="size-3.5" />
              {order.status}
            </Badge>
            {canCancel && (
              <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setCancelOpen(true)}>
                Cancel Order
              </Button>
            )}
          </div>

          {/* Timeline */}
          {!isCancelled && (
            <div className="flex items-center gap-1">
              {TIMELINE_STEPS.map((step, i) => {
                const done = i <= currentStepIndex;
                return (
                  <div key={step} className="flex-1 flex items-center gap-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`size-3 rounded-full border-2 ${
                          done
                            ? "bg-primary border-primary"
                            : "bg-background border-muted-foreground/30"
                        }`}
                      />
                      <span className={`text-[10px] mt-1 ${done ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {step}
                      </span>
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 -mt-4 ${
                          i < currentStepIndex ? "bg-primary" : "bg-muted-foreground/20"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Items ({order.items.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  {item.productImage ? (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      width={56}
                      height={56}
                      className="size-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex size-14 items-center justify-center rounded-lg bg-muted">
                      <ImageIcon className="size-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      SKU: {item.productSku} · Qty: {item.quantity}
                    </p>
                    {item.customPrint && item.printText && (
                      <p className="text-xs text-primary mt-0.5">
                        Custom: {item.printText}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold text-sm">
                    ₦{Number(item.totalPrice).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Subtotal" value={`₦${Number(order.subtotal).toLocaleString()}`} />
              <Row label="Shipping" value={order.shippingAmount ? `₦${Number(order.shippingAmount).toLocaleString()}` : "Free"} />
              {order.taxAmount > 0 && <Row label="Tax" value={`₦${Number(order.taxAmount).toLocaleString()}`} />}
              {order.discountAmount > 0 && <Row label="Discount" value={`-₦${Number(order.discountAmount).toLocaleString()}`} className="text-green-600" />}
              <div className="border-t pt-2 mt-2">
                <Row label="Total" value={`₦${Number(order.totalAmount).toLocaleString()}`} bold />
              </div>
            </CardContent>
          </Card>

          {(order.shippingMethod || order.trackingNumber) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Shipping</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                {order.shippingMethod && <p><span className="text-muted-foreground">Method:</span> {order.shippingMethod}</p>}
                {order.trackingNumber && <p><span className="text-muted-foreground">Tracking:</span> {order.trackingNumber}</p>}
                {order.shippedAt && <p><span className="text-muted-foreground">Shipped:</span> {new Date(order.shippedAt).toLocaleDateString()}</p>}
                {order.deliveredAt && <p><span className="text-muted-foreground">Delivered:</span> {new Date(order.deliveredAt).toLocaleDateString()}</p>}
              </CardContent>
            </Card>
          )}

          {order.customerNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {order.customerNotes}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel order {order.orderNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AccountShell>
  );
}

function Row({
  label,
  value,
  bold,
  className,
}: {
  label: string;
  value: string;
  bold?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold" : ""} ${className ?? ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
