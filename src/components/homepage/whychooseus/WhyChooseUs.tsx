import React from "react";
import WhyChooseCard from "@/components/ui/WhyChooseCard";
import { whyChooseData } from "./whyChooseData";

export default function WhyChooseUs() {
  return (
    <section className="bg-[#fffbf6] py-10 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight">
          Why Choose <span className="text-orange-600">Power - 8</span>?
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl md:max-w-3xl mx-auto mt-3 sm:mt-4">
          The smartest way to go solar in Nigeria
        </p>

        {/* Cards Grid */}
        <div
          className="
            grid gap-5 sm:gap-6 md:gap-8 mt-8 sm:mt-10 md:mt-12
            grid-cols-1          /* default: mobile < 640px → 1 column */
            sm:grid-cols-2       /* ≥640px  → 2 columns */
            md:grid-cols-2       /* ≥768px  → still 2 columns */
            lg:grid-cols-4       /* ≥1024px → 4 columns */
          "
        >
          {whyChooseData.map((item, index) => (
            <WhyChooseCard key={index} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

