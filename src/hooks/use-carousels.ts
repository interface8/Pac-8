"use client";

import { useEffect, useState } from "react";

export interface ApiCarouselSlide {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string | null;
  sortOrder: number;
}

export function useCarouselSlides(type = "homepage") {
  const [slides, setSlides] = useState<ApiCarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/carousels?type=${encodeURIComponent(type)}`)
      .then((res) => res.json())
      .then((json) => setSlides(json.data ?? []))
      .catch(() => setSlides([]))
      .finally(() => setLoading(false));
  }, [type]);

  return { slides, loading };
}
