"use client";

import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { addItem } from "@/store/cartSlice";
import { toast } from "react-toastify";

interface AddToCartParams {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity?: number;
  slug?: string;
}

export function useAddToCart() {
  const dispatch = useDispatch();

  const addToCart = useCallback(
    (product: AddToCartParams) => {
      const qty = product.quantity ?? 1;
      dispatch(
        addItem({
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: qty,
        })
      );
      toast.success(
        qty > 1 ? `${qty} items added to cart` : "Added to cart"
      );
    },
    [dispatch]
  );

  return addToCart;
}
