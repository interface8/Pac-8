"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { usePermission } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search, ChevronLeft, ChevronRight, Eye, CheckCircle2, XCircle,
  Truck, Package, CreditCard, Clock, ShoppingCart, Ban, RotateCcw,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
type PaymentStatus = "AWAITING_PAYMENT" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";

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

interface OrderDto {
  id: string;
  orderNumber: string;
  userId: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customerEmail: string;
  customerPhone: string | null;
  customerName: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingMethod: string | null;
  trackingNumber: string | null;
  paymentMethod: string | null;
  paymentReference: string | null;
  customerNotes: string | null;
  adminNotes: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
}

interface PaginatedOrders {
  data: OrderDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ORDER_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
const PAYMENT_STATUSES: PaymentStatus[] = ["AWAITING_PAYMENT", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"];

const STATUS_CONFIG: Record<string, { color: string; icon: typeof Clock }> = {
  PENDING: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  CONFIRMED: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle2 },
  PROCESSING: { color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: Package },
  SHIPPED: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: Truck },
  DELIVERED: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
  CANCELLED: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  REFUNDED: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: RotateCcw },
};

const PAYMENT_CONFIG: Record<string, { color: string }> = {
  AWAITING_PAYMENT: { color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  PAID: { color: "bg-green-100 text-green-800 border-green-200" },
  FAILED: { color: "bg-red-100 text-red-800 border-red-200" },
  REFUNDED: { color: "bg-gray-100 text-gray-800 border-gray-200" },
  PARTIALLY_REFUNDED: { color: "bg-orange-100 text-orange-800 border-orange-200" },
};

async function fetchOrders(page: number, search: string, status: string, paymentStatus: string): Promise<PaginatedOrders> {
  const params = new URLSearchParams({ page: String(page), limit: "10" });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  if (paymentStatus) params.set("paymentStatus", paymentStatus);
  const res = await fetch(`/api/admin/orders?${params}`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

async function fetchOrder(id: string): Promise<{ data: OrderDto }> {
  const res = await fetch(`/api/admin/orders/${id}`);
  if (!res.ok) throw new Error("Failed to fetch order");
  return res.json();
}

async function updateOrderApi(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/admin/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to update order");
  }
  return res.json();
}

export function OrdersClient() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [updateModalOrder, setUpdateModalOrder] = useState<OrderDto | null>(null);

  const canUpdate = usePermission("orders.update");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-orders", page, search, statusFilter, paymentFilter],
    queryFn: () => fetchOrders(page, search, statusFilter, paymentFilter),
  });

  const { data: orderDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["admin-order", selectedOrder],
    queryFn: () => fetchOrder(selectedOrder!),
    enabled: !!selectedOrder,
  });

  const quickMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) =>
      updateOrderApi(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order"] });
      toast.success("Order updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const orders = data?.data ?? [];

  return (
    <>
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {([
          { label: "Total", count: data?.total ?? 0, icon: ShoppingCart, bg: "bg-blue-50", fg: "text-blue-600" },
          { label: "Pending", count: orders.filter((o) => o.status === "PENDING").length, icon: Clock, bg: "bg-yellow-50", fg: "text-yellow-600" },
          { label: "Processing", count: orders.filter((o) => o.status === "PROCESSING").length, icon: Package, bg: "bg-indigo-50", fg: "text-indigo-600" },
          { label: "Shipped", count: orders.filter((o) => o.status === "SHIPPED").length, icon: Truck, bg: "bg-purple-50", fg: "text-purple-600" },
          { label: "Delivered", count: orders.filter((o) => o.status === "DELIVERED").length, icon: CheckCircle2, bg: "bg-green-50", fg: "text-green-600" },
        ] as const).map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`rounded-lg ${stat.bg} p-2`}><stat.icon className={`size-5 ${stat.fg}`} /></div>
              <div>
                <p className="text-2xl font-bold">{stat.count}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by order #, customer..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "ALL" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Order Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {ORDER_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={(v) => { setPaymentFilter(v === "ALL" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Payment Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Payments</SelectItem>
            {PAYMENT_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {error && (<Alert variant="destructive"><AlertDescription>Failed to load orders.</AlertDescription></Alert>)}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 8 }).map((_, j) => (<TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>))}</TableRow>
                ))
              ) : !orders.length ? (
                <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No orders found.</TableCell></TableRow>
              ) : (
                orders.map((order) => {
                  const Ico = STATUS_CONFIG[order.status]?.icon ?? Clock;
                  return (
                    <TableRow key={order.id} className="group">
                      <TableCell className="font-mono text-xs font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell><span className="text-sm text-muted-foreground">{order.items?.length ?? 0}</span></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${STATUS_CONFIG[order.status]?.color}`}>
                          <Ico className="size-3" />{order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={PAYMENT_CONFIG[order.paymentStatus]?.color}>
                          {order.paymentStatus.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">₦{Number(order.totalAmount).toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order.id)} title="View"><Eye className="size-4" /></Button>
                          {canUpdate && order.status === "PENDING" && (
                            <Button variant="ghost" size="sm" onClick={() => quickMutation.mutate({ id: order.id, updates: { status: "CONFIRMED" } })} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Confirm" disabled={quickMutation.isPending}><CheckCircle2 className="size-4" /></Button>
                          )}
                          {canUpdate && order.paymentStatus === "AWAITING_PAYMENT" && (
                            <Button variant="ghost" size="sm" onClick={() => quickMutation.mutate({ id: order.id, updates: { paymentStatus: "PAID" } })} className="text-green-600 hover:text-green-700 hover:bg-green-50" title="Mark Paid" disabled={quickMutation.isPending}><CreditCard className="size-4" /></Button>
                          )}
                          {canUpdate && (
                            <Button variant="ghost" size="sm" onClick={() => setUpdateModalOrder(order)} title="Full Update"><Truck className="size-4" /></Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {data.page} of {data.totalPages} ({data.total} total)</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}><ChevronLeft className="size-4" /> Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages}>Next <ChevronRight className="size-4" /></Button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>{orderDetail?.data?.orderNumber}</DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-4"><Skeleton className="h-6 w-48" /><Skeleton className="h-20 w-full" /></div>
          ) : orderDetail?.data ? (
            <OrderDetailView
              order={orderDetail.data}
              canUpdate={canUpdate}
              onQuickAction={(updates) => quickMutation.mutate({ id: orderDetail.data.id, updates }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-order", selectedOrder] }) })}
              isUpdating={quickMutation.isPending}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Update Modal */}
      {updateModalOrder && (
        <UpdateOrderModal order={updateModalOrder} onClose={() => setUpdateModalOrder(null)} onSuccess={() => { queryClient.invalidateQueries({ queryKey: ["admin-orders"] }); queryClient.invalidateQueries({ queryKey: ["admin-order"] }); setUpdateModalOrder(null); }} />
      )}
    </>
  );
}

function OrderDetailView({ order, canUpdate, onQuickAction, isUpdating }: { order: OrderDto; canUpdate: boolean; onQuickAction: (u: Record<string, unknown>) => void; isUpdating: boolean }) {
  const timeline = [
    { label: "Placed", active: true },
    { label: "Confirmed", active: ORDER_STATUSES.indexOf(order.status) >= 1 },
    { label: "Processing", active: ORDER_STATUSES.indexOf(order.status) >= 2 },
    { label: "Shipped", active: ORDER_STATUSES.indexOf(order.status) >= 3 },
    { label: "Delivered", active: ORDER_STATUSES.indexOf(order.status) >= 4 },
  ];
  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      {canUpdate && !isCancelled && (
        <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-3">
          <p className="w-full text-xs font-medium text-muted-foreground mb-1">Quick Actions</p>
          {order.status === "PENDING" && (<Button size="sm" variant="outline" onClick={() => onQuickAction({ status: "CONFIRMED" })} disabled={isUpdating} className="gap-1.5"><CheckCircle2 className="size-3.5" /> Confirm Order</Button>)}
          {order.paymentStatus === "AWAITING_PAYMENT" && (<Button size="sm" variant="outline" onClick={() => onQuickAction({ paymentStatus: "PAID" })} disabled={isUpdating} className="gap-1.5 text-green-700 border-green-200 hover:bg-green-50"><CreditCard className="size-3.5" /> Mark as Paid</Button>)}
          {order.status === "CONFIRMED" && (<Button size="sm" variant="outline" onClick={() => onQuickAction({ status: "PROCESSING" })} disabled={isUpdating} className="gap-1.5"><Package className="size-3.5" /> Start Processing</Button>)}
          {order.status === "PROCESSING" && (<Button size="sm" variant="outline" onClick={() => onQuickAction({ status: "SHIPPED" })} disabled={isUpdating} className="gap-1.5"><Truck className="size-3.5" /> Mark Shipped</Button>)}
          {order.status === "SHIPPED" && (<Button size="sm" variant="outline" onClick={() => onQuickAction({ status: "DELIVERED" })} disabled={isUpdating} className="gap-1.5 text-green-700 border-green-200 hover:bg-green-50"><CheckCircle2 className="size-3.5" /> Mark Delivered</Button>)}
          {order.paymentStatus === "PAID" && order.status !== "REFUNDED" && (<Button size="sm" variant="outline" onClick={() => onQuickAction({ paymentStatus: "REFUNDED", status: "REFUNDED" })} disabled={isUpdating} className="gap-1.5 text-orange-700 border-orange-200 hover:bg-orange-50"><RotateCcw className="size-3.5" /> Refund</Button>)}
          {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (<Button size="sm" variant="outline" onClick={() => onQuickAction({ status: "CANCELLED" })} disabled={isUpdating} className="gap-1.5 text-red-700 border-red-200 hover:bg-red-50"><Ban className="size-3.5" /> Cancel</Button>)}
        </div>
      )}

      {/* Timeline */}
      {!isCancelled ? (
        <div className="flex items-center justify-between px-2">
          {timeline.map((step, i) => (
            <div key={step.label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div className={`flex size-8 items-center justify-center rounded-full text-xs font-medium ${step.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
                <p className={`mt-1 text-[10px] text-center ${step.active ? "font-medium" : "text-muted-foreground"}`}>{step.label}</p>
              </div>
              {i < timeline.length - 1 && (<div className={`h-0.5 flex-1 mx-1 ${step.active ? "bg-primary" : "bg-muted"}`} />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          {order.status === "CANCELLED" ? (<><Ban className="size-5 text-red-600" /><span className="font-medium text-red-800">Order Cancelled</span></>) : (<><RotateCcw className="size-5 text-red-600" /><span className="font-medium text-red-800">Order Refunded</span></>)}
        </div>
      )}

      {/* Customer & Payment */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3 rounded-lg border p-4">
          <h4 className="flex items-center gap-2 text-sm font-medium"><MapPin className="size-4" /> Customer</h4>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{order.customerName}</p>
            <p className="text-muted-foreground">{order.customerEmail}</p>
            {order.customerPhone && <p className="text-muted-foreground">{order.customerPhone}</p>}
          </div>
        </div>
        <div className="space-y-3 rounded-lg border p-4">
          <h4 className="flex items-center gap-2 text-sm font-medium"><CreditCard className="size-4" /> Payment & Shipping</h4>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Badge variant="outline" className={STATUS_CONFIG[order.status]?.color}>{order.status}</Badge>
              <Badge variant="outline" className={PAYMENT_CONFIG[order.paymentStatus]?.color}>{order.paymentStatus.replace(/_/g, " ")}</Badge>
            </div>
            {order.paymentMethod && <p className="text-sm text-muted-foreground">Method: {order.paymentMethod}</p>}
            {order.paymentReference && <p className="text-sm text-muted-foreground">Ref: <span className="font-mono">{order.paymentReference}</span></p>}
            {order.trackingNumber && <p className="text-sm">Tracking: <span className="font-mono font-medium">{order.trackingNumber}</span></p>}
            {order.shippingMethod && <p className="text-sm text-muted-foreground">Via {order.shippingMethod}</p>}
          </div>
        </div>
      </div>

      {/* Items */}
      <div>
        <h4 className="mb-2 text-sm font-medium">Order Items</h4>
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="text-right">Total</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell><p className="font-medium">{item.productName}</p>{item.customPrint && <p className="text-xs text-blue-600">Custom Print: {item.printText}</p>}</TableCell>
                  <TableCell className="font-mono text-xs">{item.productSku}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">₦{Number(item.unitPrice).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">₦{Number(item.totalPrice).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-72 space-y-1 rounded-lg border bg-muted/30 p-4 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₦{Number(order.subtotal).toLocaleString()}</span></div>
          {Number(order.taxAmount) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>₦{Number(order.taxAmount).toLocaleString()}</span></div>}
          {Number(order.shippingAmount) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>₦{Number(order.shippingAmount).toLocaleString()}</span></div>}
          {Number(order.discountAmount) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-green-600">-₦{Number(order.discountAmount).toLocaleString()}</span></div>}
          <Separator />
          <div className="flex justify-between text-base font-bold"><span>Total</span><span>₦{Number(order.totalAmount).toLocaleString()}</span></div>
        </div>
      </div>

      {/* Notes */}
      {(order.customerNotes || order.adminNotes) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {order.customerNotes && (<div className="rounded-lg border p-3"><p className="text-xs font-medium text-muted-foreground mb-1">Customer Notes</p><p className="text-sm">{order.customerNotes}</p></div>)}
          {order.adminNotes && (<div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3"><p className="text-xs font-medium text-blue-700 mb-1">Admin Notes</p><p className="text-sm">{order.adminNotes}</p></div>)}
        </div>
      )}

      {/* Timestamps */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-4">
        <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
        {order.shippedAt && <p>Shipped: {new Date(order.shippedAt).toLocaleString()}</p>}
        {order.deliveredAt && <p>Delivered: {new Date(order.deliveredAt).toLocaleString()}</p>}
      </div>
    </div>
  );
}

function UpdateOrderModal({ order, onClose, onSuccess }: { order: OrderDto; onClose: () => void; onSuccess: () => void }) {
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? "");
  const [adminNotes, setAdminNotes] = useState(order.adminNotes ?? "");
  const [updateError, setUpdateError] = useState("");

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => updateOrderApi(order.id, data),
    onSuccess: () => {
      toast.success("Order updated successfully");
      onSuccess();
    },
    onError: (err: Error) => {
      setUpdateError(err.message);
      toast.error(err.message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUpdateError("");
    const updates: Record<string, unknown> = {};
    if (status !== order.status) updates.status = status;
    if (paymentStatus !== order.paymentStatus) updates.paymentStatus = paymentStatus;
    if (trackingNumber !== (order.trackingNumber ?? "")) updates.trackingNumber = trackingNumber;
    if (adminNotes !== (order.adminNotes ?? "")) updates.adminNotes = adminNotes;
    if (Object.keys(updates).length === 0) { onClose(); return; }
    mutation.mutate(updates);
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Order</DialogTitle>
          <DialogDescription>{order.orderNumber} — {order.customerName}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {updateError && (<Alert variant="destructive"><AlertDescription>{updateError}</AlertDescription></Alert>)}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Order Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ORDER_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PAYMENT_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Truck className="size-3.5" /> Tracking Number</Label>
            <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Enter tracking number" />
          </div>
          <div className="space-y-2">
            <Label>Admin Notes</Label>
            <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Internal notes..." rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Update Order"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}