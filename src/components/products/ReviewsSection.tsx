"use client";

import { useState, useEffect } from "react";
import { Star, User, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  userName: string;
  createdAt: string;
}

interface ReviewsSectionProps {
  productId: string;
  productSlug: string;
}

function StarRating({
  rating,
  size = 16,
  interactive = false,
  onRate,
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          disabled={!interactive}
        >
          <Star
            size={size}
            className={
              star <= displayRating
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-muted-foreground/30"
            }
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {review.userName}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} size={14} />
      </div>
      {review.title && (
        <h4 className="text-sm font-semibold text-foreground mb-1">
          {review.title}
        </h4>
      )}
      {review.comment && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {review.comment}
        </p>
      )}
    </div>
  );
}

export default function ReviewsSection({
  productId,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Fetch reviews
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

  // Rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
  }));

  if (loading) {
    return (
      <section className="mt-16">
        <h2 className="text-xl font-bold text-foreground mb-6">
          Customer Reviews
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
            <div className="h-10 bg-muted rounded w-16 mx-auto mb-3" />
            <div className="h-4 bg-muted rounded w-24 mx-auto" />
          </div>
          <div className="md:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-5 animate-pulse"
              >
                <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-16">
      <h2 className="text-xl font-bold text-foreground mb-6">
        Customer Reviews
      </h2>

      {totalReviews === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={28} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No Reviews Yet
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Be the first to review this product
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Rating summary */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-foreground">
                {averageRating.toFixed(1)}
              </p>
              <StarRating rating={Math.round(averageRating)} size={18} />
              <p className="text-sm text-muted-foreground mt-1">
                {totalReviews} review{totalReviews !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Rating bars */}
            <div className="space-y-2">
              {ratingCounts.map(({ rating, count }) => (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-muted-foreground">{rating}</span>
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{
                        width:
                          totalReviews > 0
                            ? `${(count / totalReviews) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <span className="w-6 text-right text-muted-foreground text-xs">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Review list */}
          <div className="md:col-span-2 space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export { StarRating };
