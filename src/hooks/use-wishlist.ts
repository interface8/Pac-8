"use client";

import { useEffect, useState, useCallback, useRef } from "react";

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

// ─── Shared wishlist store ──────────────────────────────
// All useWishlist() consumers share the same data via listeners.
type Listener = () => void;
let sharedItems: WishlistItem[] = [];
let sharedLoading = true;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((fn) => fn());
}

function setSharedItems(items: WishlistItem[]) {
  sharedItems = items;
  notify();
}

function setSharedLoading(v: boolean) {
  sharedLoading = v;
  notify();
}

let fetchInFlight: Promise<void> | null = null;
let hasFetched = false;

async function fetchWishlist() {
  // Deduplicate concurrent fetches
  if (fetchInFlight) return fetchInFlight;

  fetchInFlight = (async () => {
    try {
      const res = await fetch("/api/wishlist", {
        headers: { "x-session-id": getSessionId() },
      });
      const json = await res.json();
      if (res.ok) setSharedItems(json.data ?? []);
    } catch {
      /* silently fail */
    } finally {
      setSharedLoading(false);
      hasFetched = true;
      fetchInFlight = null;
    }
  })();

  return fetchInFlight;
}

// ─── Hook ───────────────────────────────────────────────
export function useWishlist() {
  const [, forceUpdate] = useState(0);
  const rerender = useCallback(() => forceUpdate((n) => n + 1), []);

  useEffect(() => {
    listeners.add(rerender);
    // Fetch only once across all mounted consumers
    if (!hasFetched && !fetchInFlight) fetchWishlist();
    return () => { listeners.delete(rerender); };
  }, [rerender]);

  const toggle = useCallback(async (productId: string): Promise<boolean> => {
    const wasInList = sharedItems.some((i) => i.productId === productId);

    // Optimistic update — instant UI
    if (wasInList) {
      setSharedItems(sharedItems.filter((i) => i.productId !== productId));
    } else {
      setSharedItems([
        ...sharedItems,
        {
          id: `temp-${productId}`,
          productId,
          productName: "",
          productSlug: "",
          productImage: null,
          productPrice: 0,
          productInStock: true,
          createdAt: new Date().toISOString(),
        },
      ]);
    }

    try {
      const res = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": getSessionId(),
        },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        // Revert
        await fetchWishlist();
        return !wasInList;
      }

      const json = await res.json();
      const added = json.added ?? json.data?.added ?? !wasInList;

      // Background sync to get proper server IDs
      fetchWishlist();
      return added;
    } catch {
      await fetchWishlist();
      return !wasInList;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    // Optimistic removal — instant UI
    setSharedItems(sharedItems.filter((item) => item.id !== id));

    try {
      const res = await fetch(`/api/wishlist/${id}`, {
        method: "DELETE",
        headers: { "x-session-id": getSessionId() },
      });
      if (!res.ok) {
        // Revert on failure
        await fetchWishlist();
      }
    } catch {
      await fetchWishlist();
    }
  }, []);

  return {
    items: sharedItems,
    loading: sharedLoading,
    toggle,
    remove,
    refetch: fetchWishlist,
  };
}
