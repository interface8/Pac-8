"use client";

import { useEffect, useState, useCallback } from "react";

export interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  productPrice: number;
  productInStock: boolean;
  createdAt: string;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("pac8_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("pac8_session_id", id);
  }
  return id;
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist", {
        headers: { "x-session-id": getSessionId() },
      });
      const json = await res.json();
      if (res.ok) setItems(json.data ?? []);
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggle = useCallback(async (productId: string) => {
    try {
      const res = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": getSessionId(),
        },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        const json = await res.json();
        // Re-fetch to get fresh list
        const listRes = await fetch("/api/wishlist", {
          headers: { "x-session-id": getSessionId() },
        });
        const listJson = await listRes.json();
        if (listRes.ok) setItems(listJson.data ?? []);
        return json.data?.added ?? false;
      }
    } catch {
      /* silently fail */
    }
    return false;
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/wishlist/${id}`, {
        method: "DELETE",
        headers: { "x-session-id": getSessionId() },
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {
      /* silently fail */
    }
  }, []);

  return { items, loading, toggle, remove, refetch: fetchWishlist };
}
