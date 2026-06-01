"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  Search,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

interface PromoCodeDto {
  id: string;
  code: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number;
  isActive: boolean;
  startsAt: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
}

interface PaginatedPromos {
  data: PromoCodeDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function fetchPromos(page: number, search: string): Promise<PaginatedPromos> {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (search) params.set("search", search);
  const res = await fetch(`/api/admin/promo?${params}`);
  if (!res.ok) throw new Error("Failed to fetch promo codes");
  return res.json();
}

async function createPromoApi(data: Record<string, unknown>) {
  const res = await fetch("/api/admin/promo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create promo code");
  return json;
}

async function updatePromoApi(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/admin/promo/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update promo code");
  return json;
}

async function deletePromoApi(id: string) {
  const res = await fetch(`/api/admin/promo/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.message || "Failed to delete promo code");
  }
}

function formatDiscount(promo: PromoCodeDto) {
  if (promo.discountType === "PERCENTAGE") return `${promo.discountValue}%`;
  return `₦${Number(promo.discountValue).toLocaleString()}`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isExpired(promo: PromoCodeDto) {
  if (!promo.expiresAt) return false;
  return new Date(promo.expiresAt) < new Date();
}

export function PromoClient() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCodeDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PromoCodeDto | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-promos", page, search],
    queryFn: () => fetchPromos(page, search),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updatePromoApi(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promos"] });
      toast.success("Promo code updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePromoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promos"] });
      toast.success("Promo code deleted");
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setDeleteTarget(null);
    },
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  function handleOpenCreate() {
    setEditingPromo(null);
    setModalOpen(true);
  }

  function handleOpenEdit(promo: PromoCodeDto) {
    setEditingPromo(promo);
    setModalOpen(true);
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => toast.success("Code copied!"));
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px] max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search codes..."
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">Search</Button>
        </form>
        <Button onClick={handleOpenCreate} className="gap-2 ml-auto">
          <Plus className="size-4" /> New Promo Code
        </Button>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Codes", value: data.total },
            { label: "Active", value: data.data.filter((p) => p.isActive && !isExpired(p)).length },
            { label: "Expired", value: data.data.filter(isExpired).length },
            { label: "Total Uses", value: data.data.reduce((s, p) => s + p.usageCount, 0) },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : !data?.data.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      <Tag className="size-8 mx-auto mb-2 opacity-30" />
                      <p>No promo codes found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.data.map((promo) => {
                    const expired = isExpired(promo);
                    return (
                      <TableRow key={promo.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-sm">{promo.code}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6"
                              onClick={() => copyCode(promo.code)}
                              title="Copy code"
                            >
                              <Copy className="size-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {promo.description || <span className="italic text-muted-foreground/50">No description</span>}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <Badge variant="outline" className="font-semibold text-primary border-primary/30">
                              {formatDiscount(promo)}
                            </Badge>
                            {promo.minOrderAmount && (
                              <p className="text-[10px] text-muted-foreground">
                                Min: ₦{Number(promo.minOrderAmount).toLocaleString()}
                              </p>
                            )}
                            {promo.maxDiscount && (
                              <p className="text-[10px] text-muted-foreground">
                                Cap: ₦{Number(promo.maxDiscount).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">{promo.usageCount}</span>
                            {promo.usageLimit ? (
                              <span className="text-muted-foreground"> / {promo.usageLimit}</span>
                            ) : (
                              <span className="text-muted-foreground"> / ∞</span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{promo.orderCount} orders</p>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div>{formatDate(promo.startsAt)}</div>
                          {promo.expiresAt && (
                            <div className={expired ? "text-red-500 font-medium" : ""}>
                              → {formatDate(promo.expiresAt)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {expired ? (
                            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                              Expired
                            </Badge>
                          ) : promo.isActive ? (
                            <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500 border-gray-200">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              title={promo.isActive ? "Deactivate" : "Activate"}
                              onClick={() => toggleMutation.mutate({ id: promo.id, isActive: !promo.isActive })}
                              disabled={toggleMutation.isPending}
                            >
                              {promo.isActive ? (
                                <ToggleRight className="size-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="size-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => handleOpenEdit(promo)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(promo)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
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
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {data.totalPages} ({data.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="size-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
            >
              Next <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <PromoFormModal
          promo={editingPromo}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-promos"] });
            setModalOpen(false);
          }}
        />
      )}

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Promo Code?</AlertDialogTitle>
            <AlertDialogDescription>
              The code <strong>{deleteTarget?.code}</strong> will be permanently deleted. Orders
              that already used this code will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Promo Form Modal ──────────────────────────────────────────────────────────

function dateToInputValue(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().slice(0, 16);
}

function PromoFormModal({
  promo,
  onClose,
  onSuccess,
}: {
  promo: PromoCodeDto | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!promo;

  const [code, setCode] = useState(promo?.code ?? "");
  const [description, setDescription] = useState(promo?.description ?? "");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">(
    promo?.discountType ?? "PERCENTAGE",
  );
  const [discountValue, setDiscountValue] = useState(String(promo?.discountValue ?? ""));
  const [minOrderAmount, setMinOrderAmount] = useState(
    promo?.minOrderAmount != null ? String(promo.minOrderAmount) : "",
  );
  const [maxDiscount, setMaxDiscount] = useState(
    promo?.maxDiscount != null ? String(promo.maxDiscount) : "",
  );
  const [usageLimit, setUsageLimit] = useState(
    promo?.usageLimit != null ? String(promo.usageLimit) : "",
  );
  const [perUserLimit, setPerUserLimit] = useState(String(promo?.perUserLimit ?? 1));
  const [isActive, setIsActive] = useState(promo?.isActive ?? true);
  const [startsAt, setStartsAt] = useState(dateToInputValue(promo?.startsAt));
  const [expiresAt, setExpiresAt] = useState(dateToInputValue(promo?.expiresAt));
  const [formError, setFormError] = useState("");

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      isEdit ? updatePromoApi(promo!.id, data) : createPromoApi(data),
    onSuccess: () => {
      toast.success(isEdit ? "Promo code updated" : "Promo code created");
      onSuccess();
    },
    onError: (err: Error) => {
      setFormError(err.message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!code.trim()) {
      setFormError("Promo code is required");
      return;
    }
    const numValue = parseFloat(discountValue);
    if (isNaN(numValue) || numValue <= 0) {
      setFormError("Discount value must be a positive number");
      return;
    }

    const payload: Record<string, unknown> = {
      code: code.trim(),
      description: description.trim() || null,
      discountType,
      discountValue: numValue,
      isActive,
    };

    if (minOrderAmount) payload.minOrderAmount = parseFloat(minOrderAmount);
    if (maxDiscount) payload.maxDiscount = parseFloat(maxDiscount);
    if (usageLimit) payload.usageLimit = parseInt(usageLimit, 10);
    payload.perUserLimit = parseInt(perUserLimit || "1", 10);
    if (startsAt) payload.startsAt = new Date(startsAt).toISOString();
    if (expiresAt) payload.expiresAt = new Date(expiresAt).toISOString();
    else if (isEdit) payload.expiresAt = null;

    mutation.mutate(payload);
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Promo Code" : "Create Promo Code"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Editing ${promo!.code}`
              : "Add a new discount code for your customers"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">
              Promo Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SAVE20"
              className="font-mono uppercase"
              required
            />
            <p className="text-xs text-muted-foreground">Uppercase letters and numbers only</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 20% off for new customers"
              rows={2}
            />
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Type <span className="text-destructive">*</span></Label>
              <Select value={discountType} onValueChange={(v) => setDiscountType(v as "PERCENTAGE" | "FIXED_AMOUNT")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Fixed Amount (₦)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountValue">
                Value <span className="text-destructive">*</span>
              </Label>
              <Input
                id="discountValue"
                type="number"
                min="0.01"
                step="0.01"
                max={discountType === "PERCENTAGE" ? "100" : undefined}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "PERCENTAGE" ? "20" : "5000"}
                required
              />
            </div>
          </div>

          {/* Min Order & Max Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minOrderAmount">Min Order Amount (₦)</Label>
              <Input
                id="minOrderAmount"
                type="number"
                min="0"
                step="0.01"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxDiscount">Max Discount Cap (₦)</Label>
              <Input
                id="maxDiscount"
                type="number"
                min="0"
                step="0.01"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="usageLimit">Total Usage Limit</Label>
              <Input
                id="usageLimit"
                type="number"
                min="1"
                step="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Unlimited"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="perUserLimit">Uses per User</Label>
              <Input
                id="perUserLimit"
                type="number"
                min="0"
                step="1"
                value={perUserLimit}
                onChange={(e) => setPerUserLimit(e.target.value)}
                placeholder="1"
              />
            </div>
          </div>

          {/* Validity Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startsAt">Start Date</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiry Date</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">
                Customers can use this code when active
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                ? "Save Changes"
                : "Create Code"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
