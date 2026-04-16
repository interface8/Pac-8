"use client";

import { useState } from "react";
import { Send, LogIn } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";
import StarRating from "@/components/ui/star-rating";
import { useSubmitReview, type Review } from "@/hooks/use-reviews";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: (review: Review) => void;
}

export default function ReviewForm({
  productId,
  onReviewSubmitted,
}: ReviewFormProps) {
  const user = useAuth();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const { submit, submitting, error, success } = useSubmitReview(productId);

  if (!user) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <LogIn size={24} className="mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-3">
          Log in to write a review
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Log In
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-card border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
        <p className="text-sm font-medium text-green-600 dark:text-green-400">
          Thank you! Your review has been submitted.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const review = await submit({ rating, title, comment });
    if (review) {
      onReviewSubmitted(review);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-xl p-6 space-y-4"
    >
      <h3 className="text-sm font-semibold text-foreground">Write a Review</h3>

      {/* Star rating */}
      <div>
        <label className="text-xs text-muted-foreground block mb-1">
          Your Rating
        </label>
        <StarRating rating={rating} size={24} interactive onRate={setRating} />
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="review-title"
          className="text-xs text-muted-foreground block mb-1"
        >
          Title (optional)
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={150}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Comment */}
      <div>
        <label
          htmlFor="review-comment"
          className="text-xs text-muted-foreground block mb-1"
        >
          Your Review (optional)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like or dislike about this product?"
          rows={4}
          maxLength={1000}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting || rating === 0}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={14} />
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
