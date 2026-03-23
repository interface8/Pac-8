"use client";

import React from "react";
import TestimonialCard from "@/components/ui/TestimonialCard";
import { testimonialData } from "./testimonial";
import { Users } from "lucide-react";

const TestimonialPrev = () => {
  return (
    <section className="bg-[#fffbf6] py-10 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        {/* Title */}
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-gray-900 leading-tight">
          Loved by <span className="text-orange-600">Thousands</span>
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 mt-2 sm:mt-3 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
          See what our customers are saying
        </p>

        {/* Cards */}
        <div
          className="
          grid mt-8 sm:mt-10 md:mt-12
          gap-4 sm:gap-6 md:gap-8
          grid-cols-1
          md:grid-cols-3
        "
        >
          {testimonialData.map((item, index) => (
            <TestimonialCard key={index} {...item} />
          ))}
        </div>

        {/* Button */}
        <div className="flex items-center justify-center mt-8 sm:mt-10 md:mt-12">
          <button
            className="
            flex items-center justify-center gap-2 sm:gap-3
            border border-orange-300 
            bg-white 
            text-gray-800 
            px-4 sm:px-6 
            py-2 sm:py-3
            text-xs sm:text-sm md:text-base
            rounded-lg font-medium
            hover:bg-orange-50 hover:border-orange-400
            transition-all duration-300
          "
          >
            <Users size={16} />
            Read All Testimonials
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialPrev;
