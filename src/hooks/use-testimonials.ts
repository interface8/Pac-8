import { useQuery } from "./use-api";
import { useEffect } from "react";

export interface Testimonial {
  id: string;
  rating: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    name: string;
  };
}

export function useTestimonials() {
  const { data, loading, error, refetch, clearError } = useQuery<Testimonial[]>("/api/testimonials", {
    onSuccess: () => {
      console.log("Testimonials fetched successfully");
    },
    onError: (error) => {
      console.error("Failed to fetch testimonials:", error);
    },
  });

  // Fetch testimonials on mount
  useEffect(() => {
    refetch();
  }, []);

  return {
    testimonials: data ?? [],
    loading,
    error,
    refetch,
    clearError,
  };
}

export function useTestimonialStats() {
  const { data, loading, error, refetch, clearError } = useQuery<{ totalTestimonials: number; averageRating: number }>(
    "/api/testimonials/stats",
    {
      onSuccess: () => {
        console.log("Testimonial stats fetched successfully");
      },
      onError: (error) => {
        console.error("Failed to fetch testimonial stats:", error);
      },
    }
  );

  // Fetch testimonial stats on mount
  useEffect(() => {
    refetch();
  }, []);

  return {
    stats: data ?? { totalTestimonials: 0, averageRating: 0 },
    loading,
    error,
    refetch,
    clearError,
  };
}
