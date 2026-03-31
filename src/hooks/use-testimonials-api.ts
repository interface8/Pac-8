"use client";

import { useEffect, useState } from "react";

export interface ApiTestimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  image: string | null;
  rating: number;
  sortOrder: number;
}

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<ApiTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((json) => setTestimonials(json.data ?? []))
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false));
  }, []);

  return { testimonials, loading };
}
