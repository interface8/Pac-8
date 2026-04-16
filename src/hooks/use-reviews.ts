"use client";

import { useState, useEffect, useCallback } from "react";

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  userName: string;
  createdAt: string;
}

interface ReviewsData {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export function useReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetch(`/api/products/${productId}/reviews`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setReviews(json.data.reviews ?? []);
          setAverageRating(json.data.averageRating ?? 0);
          setTotalReviews(json.data.totalReviews ?? 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  const addReview = useCallback(
    (newReview: Review) => {
      setReviews((prev) => [newReview, ...prev]);
      const newTotal = totalReviews + 1;
      setTotalReviews(newTotal);
      const newAvg =
        (averageRating * totalReviews + newReview.rating) / newTotal;
      setAverageRating(Math.round(newAvg * 10) / 10);
    },
    [averageRating, totalReviews],
  );

  return { reviews, loading, averageRating, totalReviews, addReview } satisfies ReviewsData & {
    loading: boolean;
    addReview: (r: Review) => void;
  };
}

export function useSubmitReview(productId: string) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = useCallback(
    async (data: { rating: number; title: string; comment: string }) => {
      setError("");

      if (data.rating === 0) {
        setError("Please select a rating");
        return null;
      }

      setSubmitting(true);
      try {
        const res = await fetch(`/api/products/${productId}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: data.rating,
            title: data.title.trim(),
            comment: data.comment.trim(),
          }),
        });

        const json = await res.json();

        if (!res.ok) {
          setError(json.message ?? "Failed to submit review");
          return null;
        }

        setSuccess(true);
        return json.data as Review;
      } catch {
        setError("Something went wrong. Please try again.");
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [productId],
  );

  return { submit, submitting, error, success };
}
