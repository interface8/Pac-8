"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountShell } from "@/components/account/AccountShell";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  productPrice: number;
  productInStock: boolean;
  createdAt: string;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        setItems(data.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleRemove(itemId: string) {
    setRemoving(itemId);
    try {
      const res = await fetch(`/api/wishlist/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Removed from wishlist");
        setItems((prev) => prev.filter((i) => i.id !== itemId));
      } else {
        toast.error("Failed to remove item");
      }
    } finally {
      setRemoving(null);
    }
  }

  return (
    <AccountShell title="Wishlist" description="Products you've saved for later.">
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : !items.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="mx-auto size-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Your wishlist is empty.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/products">Discover Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <Link href={`/products/${item.productSlug}`}>
                <div className="relative aspect-square bg-muted">
                  {item.productImage ? (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="size-8 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
              </Link>
              <CardContent className="p-4">
                <Link href={`/products/${item.productSlug}`}>
                  <h3 className="font-medium text-sm line-clamp-1 hover:text-primary transition-colors">
                    {item.productName}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mt-1 mb-3">
                  <span className="font-semibold">
                    ₦{Number(item.productPrice).toLocaleString()}
                  </span>
                  {!item.productInStock && (
                    <span className="text-xs text-destructive font-medium">Out of Stock</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" asChild>
                    <Link href={`/products/${item.productSlug}`}>
                      <ShoppingCart className="size-3.5 mr-1" /> View
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(item.id)}
                    disabled={removing === item.id}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
