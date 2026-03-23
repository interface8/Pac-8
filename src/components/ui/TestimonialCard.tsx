"use client";

import React from "react";
import { Star } from "lucide-react";

type Props = {
  name: string;
  role: string;
  message: string;
  rating: number;
};

const TestimonialCard = ({ name, role, message, rating }: Props) => {
  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 border border-orange-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] flex flex-col justify-between h-70">
      <div>
        {/* Stars */}
        <div className="flex gap-1 text-yellow-400">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} size={16} fill="currentColor" />
          ))}
        </div>

        <p className=" text-left text-sm sm:text-base text-gray-600 mt-8 leading-relaxed">
          {message}
        </p>
      </div>

      <div className="mt-6">
        <h4 className="text-left text-sm font-semibold text-gray-900">
          {name}
        </h4>
        <p className="text-left text-xs text-gray-500">{role}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;
