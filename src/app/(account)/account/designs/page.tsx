"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountShell } from "@/components/account/AccountShell";
import { addItem } from "@/store/cartSlice";
import {
  Palette,
  Pencil,
  Check,
  Trash2,
  Archive,
  ShoppingCart,
  ArrowRight,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface DesignItem {
  id: string;
  name: string;
  status: "DRAFT" | "COMPLETED" | "ARCHIVED";
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  productPrice: number;
  printPrice: number;
  inCart: boolean;
}

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", className: "bg-amber-100 text-amber-700 border-amber-200" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-700 border-green-200" },
  ARCHIVED: { label: "Archived", className: "bg-gray-100 text-gray-500 border-gray-200" },
};

type FilterTab = "ALL" | "DRAFT" | "COMPLETED" | "ARCHIVED";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function DesignsPage() {
  const dispatch = useDispatch();
  const [designs, setDesigns] = useState<DesignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/designs")
      .then((r) => r.json())
      .then((json) => setDesigns(json.data ?? []))
      .catch(() => toast.error("Failed to load designs"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? designs : designs.filter((d) => d.status === filter);

  async function handleDelete(id: string) {
    if (!confirm("Delete this design? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/designs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setDesigns((prev) => prev.filter((d) => d.id !== id));
      toast.success("Design deleted");
    } catch {
      toast.error("Could not delete design");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleArchive(id: string, current: "DRAFT" | "COMPLETED" | "ARCHIVED") {
    const newStatus = current === "ARCHIVED" ? "DRAFT" : "ARCHIVED";
    setArchivingId(id);
    try {
      const res = await fetch(`/api/designs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      setDesigns((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: newStatus as DesignItem["status"] } : d))
      );
      toast.success(newStatus === "ARCHIVED" ? "Design archived" : "Design restored");
    } catch {
      toast.error("Could not update design");
    } finally {
      setArchivingId(null);
    }
  }

  function handleAddToCart(design: DesignItem) {
    dispatch(
      addItem({
        id: design.productId,
        name: design.productName,
        image: design.productImage ?? "",
        price: design.productPrice + design.printPrice,
        quantity: 1,
        slug: design.productSlug,
        designThumbnail: design.thumbnailUrl ?? undefined,
        customPrint: design.printPrice > 0,
        printPrice: design.printPrice,
        designId: design.id,
      })
    );
    toast.success(`${design.productName} added to cart`);
  }

  const tabs: { label: string; value: FilterTab }[] = [
    { label: "All", value: "ALL" },
    { label: "Drafts", value: "DRAFT" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Archived", value: "ARCHIVED" },
  ];

  return (
    <AccountShell
      title="My Designs"
      description="View and manage your saved product customizations."
    >
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              filter === tab.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
            {tab.value !== "ALL" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({designs.filter((d) => d.status === tab.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : !filtered.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Palette className="mx-auto size-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground font-medium">
              {filter === "ALL" ? "No saved designs yet." : `No ${filter.toLowerCase()} designs.`}
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/products">
                Browse Products to Design <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((design) => (
            <DesignCard
              key={design.id}
              design={design}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onAddToCart={handleAddToCart}
              deletingId={deletingId}
              archivingId={archivingId}
            />
          ))}
        </div>
      )}
    </AccountShell>
  );
}

function DesignCard({
  design,
  onDelete,
  onArchive,
  onAddToCart,
  deletingId,
  archivingId,
}: {
  design: DesignItem;
  onDelete: (id: string) => void;
  onArchive: (id: string, status: DesignItem["status"]) => void;
  onAddToCart: (design: DesignItem) => void;
  deletingId: string | null;
  archivingId: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(design.name);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  async function saveName() {
    const trimmed = nameVal.trim();
    if (!trimmed || trimmed === design.name) {
      setNameVal(design.name);
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/designs/${design.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error();
      design.name = trimmed;
      toast.success("Design renamed");
    } catch {
      toast.error("Could not rename design");
      setNameVal(design.name);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  const thumbnail = design.thumbnailUrl ?? design.productImage;
  const statusCfg = STATUS_CONFIG[design.status];
  const isArchived = design.status === "ARCHIVED";

  return (
    <Card className={`overflow-hidden transition-shadow hover:shadow-md ${isArchived ? "opacity-60" : ""}`}>
      {/* Thumbnail */}
      <div className="relative aspect-square bg-muted/30 flex items-center justify-center overflow-hidden">
        {thumbnail ? (
          thumbnail.startsWith("data:image/svg") ? (
            // SVG data URL — render via img
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt={design.name}
              className="object-contain w-full h-full p-4"
            />
          ) : (
            <Image
              src={thumbnail}
              alt={design.name}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          )
        ) : (
          <ImageIcon className="size-12 text-muted-foreground/30" />
        )}
        {/* Status badge */}
        <span
          className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full border ${statusCfg.className}`}
        >
          {statusCfg.label}
        </span>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Product name */}
        <p className="text-xs text-muted-foreground truncate">{design.productName}</p>

        {/* Design name (inline edit) */}
        <div className="flex items-center gap-1">
          {editing ? (
            <input
              ref={inputRef}
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName();
                if (e.key === "Escape") { setNameVal(design.name); setEditing(false); }
              }}
              className="flex-1 text-sm font-semibold bg-muted rounded px-2 py-0.5 outline-none ring-1 ring-primary min-w-0"
              disabled={saving}
            />
          ) : (
            <span className="flex-1 text-sm font-semibold truncate">{design.name}</span>
          )}
          <button
            onClick={editing ? saveName : () => setEditing(true)}
            className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
            title={editing ? "Save name" : "Rename design"}
          >
            {editing ? <Check className="size-3.5" /> : <Pencil className="size-3.5" />}
          </button>
        </div>

        {/* Time */}
        <p className="text-xs text-muted-foreground">{timeAgo(design.updatedAt)}</p>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            asChild
          >
            <Link href={`/products/${design.productSlug}/customize?designId=${design.id}`}>
              Continue
            </Link>
          </Button>
          <Button
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onAddToCart(design)}
            disabled={isArchived}
          >
            <ShoppingCart className="size-3.5 mr-1" />
            Add to Cart
          </Button>
        </div>

        {/* Secondary actions */}
        <div className="flex items-center justify-end gap-1 pt-0.5">
          <button
            title={isArchived ? "Restore design" : "Archive design"}
            onClick={() => onArchive(design.id, design.status)}
            disabled={archivingId === design.id}
            className="p-1.5 rounded text-muted-foreground hover:text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <Archive className="size-3.5" />
          </button>
          <button
            title="Delete design"
            onClick={() => onDelete(design.id)}
            disabled={deletingId === design.id}
            className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
