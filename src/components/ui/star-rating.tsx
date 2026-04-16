"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function StarRating({
  rating,
  size = 16,
  interactive = false,
  onRate,
}: StarRatingProps) {
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
