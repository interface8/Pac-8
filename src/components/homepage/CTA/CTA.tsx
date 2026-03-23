"use client";

import React from "react";
import Link from "next/link";
import { Calculator, ShoppingBag } from "lucide-react";

const CTA = () => {
  return (
    <section className="bg-linear-to-br from-orange-500 to-amber-300 py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight">
          Ready to Go Solar?
        </h2>

        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mt-3 sm:mt-4 mx-auto">
          Join thousands of Nigerians powering their homes with clean,
          affordable energy
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 sm:mt-8">
          <button className="flex items-center justify-center gap-2 w-full sm:w-auto bg-white text-orange-600 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <Calculator size={18} />
            Get Started Now
          </button>

          <Link
            href="/products"
            className="flex items-center justify-center gap-2 w-full sm:w-auto border border-white text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-white hover:text-orange-600 transition-all duration-300"
          >
            <ShoppingBag size={18} />
            View Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
