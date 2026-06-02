"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import NextImage from "next/image";
import { usePermission } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
  MapPin, Download, Image as ImageIcon, Tag, Hash, User, Layers,
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
  basePrice: number;        // Product price before print surcharge
  printSurcharge: number;   // Per-unit custom print/design charge
  unitPrice: number;        // basePrice + printSurcharge
  totalPrice: number;       // unitPrice × quantity
  customPrint: boolean;
  printText: string | null;
  savedDesignId: string | null;
  designData: string | null;
  designThumbnailUrl: string | null;
}

interface OrderShippingAddress {
  firstName: string;
  lastName: string;
  company: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
  phone: string | null;
}

interface OrderPromoCode {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  description: string | null;
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
  shippingAddress: OrderShippingAddress | null;
  promoCode: OrderPromoCode | null;
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
            <DialogTitle className="flex items-center gap-2">
              <Hash className="size-4 text-muted-foreground" />
              {orderDetail?.data?.orderNumber ?? "Order Details"}
            </DialogTitle>
            <DialogDescription className="flex flex-wrap gap-3 text-xs mt-1">
              {orderDetail?.data && (
                <>
                  <span className="flex items-center gap-1">
                    <User className="size-3" /> {orderDetail.data.customerName}
                  </span>
                  <span className="text-muted-foreground/50">|</span>
                  <span className="font-mono text-muted-foreground/80">ID: {orderDetail.data.id}</span>
                </>
              )}
            </DialogDescription>
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

// ─── Design helpers ────────────────────────────────────────────────────────

function capitalize(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

interface DesignView {
  label: string;
  url: string;
}

/** Recreate an SVG thumbnail from raw ViewDesignState element data. */
function generateViewThumbnail(view: Record<string, unknown>): string {
  const tw = 300, th = 300;
  const cw = typeof view.canvasWidth === "number" ? view.canvasWidth : 600;
  const ch = typeof view.canvasHeight === "number" ? view.canvasHeight : 600;
  const scaleX = tw / cw;
  const scaleY = th / ch;
  const bg = typeof view.backgroundColor === "string" ? view.backgroundColor : "#ffffff";
  const elems = Array.isArray(view.elements) ? view.elements as Record<string, unknown>[] : [];

  const escXml = (s: string) =>
    s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c] ?? c));

  const parts: string[] = [];

  for (const e of elems.slice(0, 20)) {
    const ex = (e.x as number) ?? 0;
    const ey = (e.y as number) ?? 0;
    const ew = (e.width as number) ?? 50;
    const eh = (e.height as number) ?? 50;
    const opacity = typeof e.opacity === "number" ? e.opacity : 1;
    const x = Math.round((ex - ew / 2) * scaleX);
    const y = Math.round((ey - eh / 2) * scaleY);
    const w = Math.max(1, Math.round(ew * scaleX));
    const h = Math.max(1, Math.round(eh * scaleY));

    if (e.type === "shape") {
      const fill = typeof e.fillColor === "string" ? e.fillColor : "#cccccc";
      const shape = e.shape as string;
      if (shape === "circle") {
        parts.push(`<ellipse cx="${x + Math.round(w / 2)}" cy="${y + Math.round(h / 2)}" rx="${Math.round(w / 2)}" ry="${Math.round(h / 2)}" fill="${fill}" opacity="${opacity}"/>`);
      } else if (shape === "triangle") {
        const pts = `${x + Math.round(w / 2)},${y} ${x},${y + h} ${x + w},${y + h}`;
        parts.push(`<polygon points="${pts}" fill="${fill}" opacity="${opacity}"/>`);
      } else {
        parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" opacity="${opacity}"/>`);
      }
    } else if (e.type === "text") {
      const fs = Math.max(6, Math.round((e.fontSize as number ?? 16) * Math.min(scaleX, scaleY)));
      const fill = typeof e.color === "string" ? e.color : "#000000";
      const text = typeof e.text === "string" ? escXml(e.text.slice(0, 60)) : "";
      parts.push(`<text x="${Math.round(ex * scaleX)}" y="${Math.round(ey * scaleY)}" font-family="sans-serif" font-size="${fs}" fill="${fill}" text-anchor="middle" dominant-baseline="middle" opacity="${opacity}">${text}</text>`);
    } else if (e.type === "image") {
      const src = e.src as string | undefined;
      if (src && src.startsWith("data:")) {
        parts.push(`<image href="${escXml(src)}" x="${x}" y="${y}" width="${w}" height="${h}" opacity="${opacity}" preserveAspectRatio="xMidYMid meet"/>`);
      } else {
        // placeholder for external images
        parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e2e8f0" rx="4" opacity="${opacity}"/><text x="${x + Math.round(w / 2)}" y="${y + Math.round(h / 2)}" font-family="sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle" dominant-baseline="middle">img</text>`);
      }
    } else if (e.type === "qr") {
      // placeholder for QR codes
      parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${e.bgColor ?? "#ffffff"}" rx="4" opacity="${opacity}"/><rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" fill="none" stroke="${e.color ?? "#000000"}" stroke-width="2" opacity="${opacity}"/><text x="${x + Math.round(w / 2)}" y="${y + Math.round(h / 2)}" font-family="sans-serif" font-size="8" fill="${e.color ?? "#000"}" text-anchor="middle" dominant-baseline="middle" opacity="${opacity}">QR</text>`);
    }
  }

  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}"><rect width="${tw}" height="${th}" fill="${bg}"/>${parts.join("")}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
}

/** Parse all available design view thumbnails from an order item. */
function parseDesignViews(item: { designThumbnailUrl: string | null; designData: string | null }): DesignView[] {
  const views: DesignView[] = [];
  const seen = new Set<string>();
  const add = (label: string, url: string) => {
    if (url && !seen.has(url)) { seen.add(url); views.push({ label, url }); }
  };

  // 1. Stored thumbnail from SavedDesign
  if (item.designThumbnailUrl) add("Preview", item.designThumbnailUrl);

  if (!item.designData) return views;

  let data: Record<string, unknown>;
  try { data = JSON.parse(item.designData) as Record<string, unknown>; }
  catch { return views; }

  // 2. Embedded thumbnail snapshot (stored inside designData at order time)
  if (typeof data._thumbnailUrl === "string" && data._thumbnailUrl) {
    add("Preview", data._thumbnailUrl);
  }

  // 3. Version 3 format — generate SVG thumbnails from element data for each view
  if (data.version === "3" && data.views && typeof data.views === "object" && !Array.isArray(data.views)) {
    for (const [key, view] of Object.entries(data.views as Record<string, unknown>)) {
      if (view && typeof view === "object") {
        const svg = generateViewThumbnail(view as Record<string, unknown>);
        add(capitalize(key) + " View", svg);
      }
    }
  }

  // 4. Legacy formats (imageUrl / url fields, arrays, top-level keys)
  if (data.version !== "3" && data.views && typeof data.views === "object" && !Array.isArray(data.views)) {
    for (const [key, view] of Object.entries(data.views as Record<string, unknown>)) {
      if (view && typeof view === "object") {
        const v = view as Record<string, unknown>;
        const url = typeof v.imageUrl === "string" ? v.imageUrl : typeof v.url === "string" ? v.url : null;
        if (url) add(capitalize(key) + " View", url);
      } else if (typeof view === "string" && (view.startsWith("data:") || view.startsWith("http"))) {
        add(capitalize(key) + " View", view);
      }
    }
  }
  if (Array.isArray(data.views)) {
    for (const view of data.views as Record<string, unknown>[]) {
      const url = typeof view.url === "string" ? view.url : typeof view.imageUrl === "string" ? view.imageUrl : null;
      const label = typeof view.label === "string" ? view.label : typeof view.name === "string" ? view.name : "View";
      if (url) add(label, url);
    }
  }
  for (const key of ["front", "back", "left", "right", "side", "top", "bottom"]) {
    const val = data[key];
    if (typeof val === "string" && (val.startsWith("data:") || val.startsWith("http"))) add(capitalize(key), val);
  }

  return views;
}

function downloadView(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.png`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─── DesignPreviewModal ──────────────────────────────────────────────────────
// Opens when the admin clicks "Preview Design" on an order item.
// Fetches live design data from /api/admin/designs/:id and renders SVG
// thumbnails generated from the version-3 element data (or falls back to any
// stored thumbnail URL).  Uses plain <img> so data: URIs work correctly.

function DesignPreviewModal({ item, onClose }: { item: OrderItem; onClose: () => void }) {
  const [views, setViews] = useState<DesignView[]>([]);
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [fullView, setFullView] = useState<DesignView | null>(null);

  useEffect(() => {
    let cancelled = false;

    // 1. Try parsing design data that already came with the order
    const localViews = parseDesignViews(item);
    if (localViews.length > 0) {
      setViews(localViews);
      setStatus("done");
      return;
    }

    // 2. If we have a savedDesignId, fetch live design data from the server
    if (!item.savedDesignId) {
      setStatus("error");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/admin/designs/${item.savedDesignId}`);
        const json = await res.json() as { data?: { thumbnailUrl: string | null; designData: string | null } };
        if (cancelled) return;
        if (!res.ok || !json.data) { setStatus("error"); return; }

        const freshViews = parseDesignViews({
          designThumbnailUrl: json.data.thumbnailUrl,
          designData: json.data.designData,
        });

        if (!cancelled) {
          setViews(freshViews);
          setStatus(freshViews.length > 0 ? "done" : "error");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  return (
    <>
      <Dialog open onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="size-4 text-primary" />
              Design Preview
            </DialogTitle>
            <DialogDescription>{item.productName} — {item.productSku}</DialogDescription>
          </DialogHeader>

          {status === "loading" && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <ImageIcon className="size-8 animate-pulse" />
              <p className="text-sm">Loading design…</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-amber-700">
              <ImageIcon className="size-8 shrink-0 text-amber-500" />
              <p className="text-sm font-medium">Could not load design preview</p>
              <p className="text-xs text-muted-foreground text-center max-w-xs">
                The design data may not have been captured at order time, or the design has been deleted.
              </p>
              {item.savedDesignId && (
                <p className="text-xs font-mono text-muted-foreground">ID: {item.savedDesignId}</p>
              )}
            </div>
          )}

          {status === "done" && views.length > 0 && (
            <div className="space-y-4">
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${Math.min(views.length, 3)}, 1fr)` }}
              >
                {views.map((view, vi) => (
                  <div key={vi} className="flex flex-col items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {view.label}
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={view.url}
                      alt={view.label}
                      onClick={() => setFullView(view)}
                      className="w-full aspect-square rounded-xl border-2 border-border bg-white object-contain p-3 cursor-pointer hover:border-primary hover:shadow-md transition-all"
                    />
                    <button
                      onClick={() => downloadView(view.url, `${item.productSku}-${view.label.toLowerCase().replace(/\s+/g, "-")}`)}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <Download className="size-3" /> Download
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-center text-[11px] text-muted-foreground">
                Click a view to enlarge · {views.length} view{views.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full-size image overlay */}
      {fullView && (
        <Dialog open onOpenChange={() => setFullView(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{fullView.label}</DialogTitle>
              <DialogDescription>{item.productName}</DialogDescription>
            </DialogHeader>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fullView.url}
              alt={fullView.label}
              className="w-full rounded-xl border bg-white object-contain"
            />
            <div className="flex justify-end pt-1">
              <button
                onClick={() => downloadView(fullView.url, `${item.productSku}-${fullView.label.toLowerCase().replace(/\s+/g, "-")}`)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
              >
                <Download className="size-4" /> Download
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// ─── OrderDetailView ────────────────────────────────────────────────────────

function OrderDetailView({ order, canUpdate, onQuickAction, isUpdating }: { order: OrderDto; canUpdate: boolean; onQuickAction: (u: Record<string, unknown>) => void; isUpdating: boolean }) {
  const [previewingDesign, setPreviewingDesign] = useState<OrderItem | null>(null);
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

      {/* Customer, Shipping Address & Payment */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Customer Details */}
        <div className="space-y-3 rounded-lg border p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold"><User className="size-4" /> Customer</h4>
          <div className="space-y-1 text-sm">
            <p className="font-semibold">{order.customerName}</p>
            <p className="text-muted-foreground">{order.customerEmail}</p>
            {order.customerPhone && <p className="text-muted-foreground">{order.customerPhone}</p>}
            {order.userId && (
              <p className="text-[10px] text-muted-foreground/60 font-mono mt-1 break-all">User ID: {order.userId}</p>
            )}
          </div>
          {/* Shipping Address */}
          {order.shippingAddress ? (
            <div className="border-t pt-3 space-y-0.5 text-sm">
              <p className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1"><MapPin className="size-3" /> Shipping Address</p>
              <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              {order.shippingAddress.company && <p className="text-muted-foreground">{order.shippingAddress.company}</p>}
              <p className="text-muted-foreground">{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p className="text-muted-foreground">{order.shippingAddress.addressLine2}</p>}
              <p className="text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p className="text-muted-foreground">{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && <p className="text-muted-foreground">{order.shippingAddress.phone}</p>}
            </div>
          ) : (
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground italic">No shipping address recorded</p>
            </div>
          )}
        </div>

        {/* Payment & Shipping */}
        <div className="space-y-3 rounded-lg border p-4">
          <h4 className="flex items-center gap-2 text-sm font-medium"><CreditCard className="size-4" /> Payment & Shipping</h4>
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className={STATUS_CONFIG[order.status]?.color}>{order.status}</Badge>
              <Badge variant="outline" className={PAYMENT_CONFIG[order.paymentStatus]?.color}>{order.paymentStatus.replace(/_/g, " ")}</Badge>
            </div>
            {order.paymentMethod && <p className="text-sm text-muted-foreground">Method: <span className="font-medium text-foreground">{order.paymentMethod}</span></p>}
            {order.paymentReference && (
              <p className="text-sm text-muted-foreground">
                Ref: <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{order.paymentReference}</span>
              </p>
            )}
            {order.trackingNumber && (
              <p className="text-sm">
                Tracking: <span className="font-mono font-medium">{order.trackingNumber}</span>
              </p>
            )}
            {order.shippingMethod && <p className="text-sm text-muted-foreground">Via {order.shippingMethod}</p>}
          </div>
          {/* Promo Code */}
          {order.promoCode && (
            <div className="border-t pt-3">
              <div className="flex items-center gap-2">
                <Tag className="size-3.5 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Promo Applied</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono font-semibold text-sm">{order.promoCode.code}</span>
                <Badge variant="outline" className="text-primary border-primary/30 text-xs">
                  {order.promoCode.discountType === "PERCENTAGE"
                    ? `${order.promoCode.discountValue}% off`
                    : `₦${Number(order.promoCode.discountValue).toLocaleString()} off`}
                </Badge>
              </div>
              {order.promoCode.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{order.promoCode.description}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div>
        <h4 className="mb-3 text-sm font-semibold flex items-center gap-2">
          <Layers className="size-4" /> Order Items
          <span className="font-normal text-muted-foreground">({order.items.length} item{order.items.length !== 1 ? "s" : ""})</span>
        </h4>
        <div className="space-y-4">
          {order.items.map((item, idx) => {
            return (
              <div key={item.id} className="rounded-xl border overflow-hidden">
                {/* Item Header */}
                <div className="flex items-start gap-3 p-4 bg-card">
                  <span className="shrink-0 flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">{idx + 1}</span>
                  {/* Product Image */}
                  <div className="shrink-0 size-16 rounded-lg overflow-hidden bg-muted border flex items-center justify-center">
                    {item.productImage ? (
                      <NextImage
                        src={item.productImage}
                        alt={item.productName}
                        width={64}
                        height={64}
                        className="object-cover size-full"
                        unoptimized={item.productImage.startsWith("data:")}
                      />
                    ) : (
                      <ImageIcon className="size-6 text-muted-foreground/40" />
                    )}
                  </div>
                  {/* Item Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-semibold text-sm leading-tight">{item.productName}</p>
                    <p className="text-xs text-muted-foreground font-mono bg-muted inline-block px-1.5 py-0.5 rounded">{item.productSku}</p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <span className="text-xs text-muted-foreground">Qty: <span className="font-medium text-foreground">{item.quantity}</span></span>
                      <span className="text-xs text-muted-foreground">Unit: <span className="font-medium text-foreground">₦{Number(item.unitPrice).toLocaleString()}</span></span>
                      <span className="ml-auto text-sm font-bold">₦{Number(item.totalPrice).toLocaleString()}</span>
                    </div>
                    {item.customPrint && item.printText && (
                      <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 mt-1">
                        Custom Print Text: <span className="font-medium">{item.printText}</span>
                      </p>
                    )}
                    {item.savedDesignId && (
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] bg-violet-50 border border-violet-200 text-violet-700 rounded px-1.5 py-0.5">
                          <Layers className="size-2.5" /> Custom Design
                        </span>
                        <button
                          onClick={() => setPreviewingDesign(item)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded px-2 py-0.5 transition-colors"
                        >
                          <Eye className="size-3" /> Preview Design
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Design Preview Modal */}
      {previewingDesign && (
        <DesignPreviewModal item={previewingDesign} onClose={() => setPreviewingDesign(null)} />
      )}

      {/* Price Breakdown */}
      <div className="rounded-xl border overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b flex items-center gap-2">
          <CreditCard className="size-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Price Breakdown</h4>
        </div>
        <div className="divide-y">

          {/* Per-item rows */}
          <div className="p-4 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Items</p>
            {order.items.map((item) => {
              const hasPrintCharge = item.customPrint && item.printSurcharge > 0;
              return (
                <div key={item.id} className="space-y-1">
                  {/* Product line */}
                  <div className="flex justify-between text-sm">
                    <span className="font-medium truncate max-w-[55%]">{item.productName}</span>
                    <span className="font-semibold">₦{Number(item.totalPrice).toLocaleString()}</span>
                  </div>
                  {/* Formula row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground pl-2">
                    <span>
                      <span className="font-medium text-foreground">₦{Number(item.basePrice).toLocaleString()}</span>
                      {" base × "}
                      <span className="font-medium text-foreground">{item.quantity}</span>
                      {" unit"}{item.quantity !== 1 ? "s" : ""}
                      {" = ₦"}{Number(item.basePrice * item.quantity).toLocaleString()}
                    </span>
                    {hasPrintCharge && (
                      <span className="text-blue-600">
                        + <span className="font-medium">₦{Number(item.printSurcharge).toLocaleString()}</span>
                        {" print × "}
                        <span className="font-medium">{item.quantity}</span>
                        {" = ₦"}{Number(item.printSurcharge * item.quantity).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 pl-2">
                    {item.customPrint && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 border border-blue-200 text-blue-700 rounded px-1.5 py-0.5">
                        <ImageIcon className="size-2.5" /> Custom Print
                      </span>
                    )}
                    {item.savedDesignId && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-violet-50 border border-violet-200 text-violet-700 rounded px-1.5 py-0.5">
                        <Layers className="size-2.5" /> Custom Design
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order-level totals */}
          <div className="p-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Items Subtotal ({order.items.reduce((s, i) => s + i.quantity, 0)} unit{order.items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""})</span>
              <span>₦{Number(order.subtotal).toLocaleString()}</span>
            </div>

            {order.items.some((i) => i.customPrint && i.printSurcharge > 0) && (
              <div className="flex justify-between text-blue-700">
                <span className="flex items-center gap-1">
                  <ImageIcon className="size-3" />
                  Custom Print Charges
                </span>
                <span>
                  ₦{Number(
                    order.items.reduce((s, i) => s + (i.customPrint ? i.printSurcharge * i.quantity : 0), 0)
                  ).toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex justify-between text-muted-foreground">
              <span className="flex items-center gap-1">
                <Truck className="size-3" />
                Shipping
                {order.shippingMethod && (
                  <span className="text-[10px] bg-muted border rounded px-1.5 py-0.5 ml-1">
                    {order.shippingMethod === "express" ? "Express (1–3 days)" : order.shippingMethod === "standard" ? "Standard (5–7 days)" : order.shippingMethod}
                  </span>
                )}
              </span>
              <span className={Number(order.shippingAmount) === 0 ? "text-green-600 font-medium" : ""}>
                {Number(order.shippingAmount) === 0 ? "Free" : `₦${Number(order.shippingAmount).toLocaleString()}`}
              </span>
            </div>

            {Number(order.taxAmount) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>VAT <span className="text-[10px] bg-muted border rounded px-1 py-0.5 ml-0.5">7.5%</span></span>
                <span>₦{Number(order.taxAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}

            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-green-700">
                <span className="flex items-center gap-1">
                  <Tag className="size-3" />
                  Discount{order.promoCode ? ` — ${order.promoCode.code}` : ""}
                  {order.promoCode && (
                    <span className="text-[10px] bg-green-50 border border-green-200 rounded px-1.5 py-0.5 ml-1">
                      {order.promoCode.discountType === "PERCENTAGE"
                        ? `${order.promoCode.discountValue}% off`
                        : `₦${Number(order.promoCode.discountValue).toLocaleString()} off`}
                    </span>
                  )}
                </span>
                <span className="font-medium">−₦{Number(order.discountAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="px-4 py-3 bg-muted/30 flex justify-between items-center">
            <span className="font-bold text-sm">Total Charged</span>
            <span className="text-lg font-bold text-primary">₦{Number(order.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
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
        <p>Placed: {new Date(order.createdAt).toLocaleString()}</p>
        {order.shippedAt && <p>Shipped: {new Date(order.shippedAt).toLocaleString()}</p>}
        {order.deliveredAt && <p>Delivered: {new Date(order.deliveredAt).toLocaleString()}</p>}
        <p className="ml-auto">Last updated: {new Date(order.updatedAt).toLocaleString()}</p>
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