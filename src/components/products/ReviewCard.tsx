"use client";

import { User } from "lucide-react";
import StarRating from "@/components/ui/star-rating";
import type { Review } from "@/hooks/use-reviews";

export default function ReviewCard({ review }: { review: Review }) {
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
