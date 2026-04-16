"use client";

import { Star, MessageSquare } from "lucide-react";
import StarRating from "@/components/ui/star-rating";
import ReviewCard from "@/components/products/ReviewCard";
import ReviewForm from "@/components/products/ReviewForm";
import { useReviews } from "@/hooks/use-reviews";

interface ReviewsSectionProps {
  productId: string;
  productSlug: string;
}

export default function ReviewsSection({
  productId,
}: ReviewsSectionProps) {
  const { reviews, loading, averageRating, totalReviews, addReview } =
    useReviews(productId);

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
        <div className="space-y-6">
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
          <ReviewForm productId={productId} onReviewSubmitted={addReview} />
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

          {/* Write a review */}
          <div className="md:col-span-3">
            <ReviewForm productId={productId} onReviewSubmitted={addReview} />
          </div>
        </div>
      )}
    </section>
  );
}
