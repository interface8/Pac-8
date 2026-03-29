"use client";

import { useEffect, useState, useCallback } from "react";

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  comparePrice: number | null;
  quantity: number;
  trackQuantity: boolean;
  lowStockThreshold: number;
  deliveryTime: string | null;
  weight: number | null;
  dimensions: string | null;
  allowCustomPrint: boolean;
  printPrice: number | null;
  status: string;
  isActive: boolean;
  isFeatured: boolean;
  isLowBudget: boolean;
  categoryId: string;
  categoryName: string;
  productCategoryId: string | null;
  productCategoryName: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  metaKeywords: string | null;
  images: {
    id: string;
    url: string;
    altText: string | null;
    isMain: boolean;
    sortOrder: number;
  }[];
  priceTiers: {
    id: string;
    minQuantity: number;
    discountType: string;
    discountValue: number;
    isActive: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  isFeatured?: boolean;
  isLowBudget?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.set("search", filters.search);
      if (filters?.categoryId) params.set("categoryId", filters.categoryId);
      if (filters?.isFeatured) params.set("isFeatured", "true");
      if (filters?.isLowBudget) params.set("isLowBudget", "true");
      if (filters?.minPrice !== undefined)
        params.set("minPrice", String(filters.minPrice));
      if (filters?.maxPrice !== undefined)
        params.set("maxPrice", String(filters.maxPrice));
      if (filters?.inStock) params.set("inStock", "true");

      const qs = params.toString();
      const res = await fetch(`/api/products${qs ? `?${qs}` : ""}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.message ?? "Failed to fetch products");
      setProducts(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters?.search, filters?.categoryId, filters?.isFeatured, filters?.isLowBudget, filters?.minPrice, filters?.maxPrice, filters?.inStock]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

export function useFeaturedProducts(limit = 8) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/featured?limit=${limit}`)
      .then((res) => res.json())
      .then((json) => setProducts(json.data ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [limit]);

  return { products, loading };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setProduct(json.data);
        else throw new Error("Product not found");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Product not found")
      )
      .finally(() => setLoading(false));
  }, [slug]);

  return { product, loading, error };
}
