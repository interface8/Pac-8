"use client";

import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { setPromo } from "@/store/cartSlice";
import { toast } from "react-toastify";

interface PromoData {
  id: string;
  code: string;
  discount: number;
  discountType: string;
  discountValue: number;
  description: string | null;
}

export function usePromoCode(subtotal: number) {
  const dispatch = useDispatch<AppDispatch>();
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");

  const applyPromo = useCallback(async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");

    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim(), subtotal }),
      });
      const json = await res.json();

      if (!res.ok) {
        setPromoError(json.message || "Invalid promo code");
        return;
      }

      dispatch(setPromo(json.data as PromoData));
      toast.success(`Promo code "${json.data.code}" applied!`);
    } catch {
      setPromoError("Failed to validate promo code");
    } finally {
      setPromoLoading(false);
    }
  }, [promoCode, subtotal, dispatch]);

  const removePromo = useCallback(() => {
    dispatch(setPromo(null));
    setPromoCode("");
    setPromoError("");
  }, [dispatch]);

  return {
    promoCode,
    setPromoCode,
    promoLoading,
    promoError,
    setPromoError,
    applyPromo,
    removePromo,
  };
}
