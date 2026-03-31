"use client";

import HeroCarousel from "@/components/homepage/HeroCarousel";
import BestSellers from "@/components/homepage/sections/BestSellers";
import HowItWorks from "@/components/homepage/sections/HowItWorks";
import TargetAudience from "@/components/homepage/sections/TargetAudience";
import TestimonialsSection from "@/components/homepage/sections/TestimonialsSection";
import NewsletterSignup from "@/components/homepage/sections/NewsletterSignup";

export default function Home() {
  return (
    <>
      <main className="pt-32 md:pt-28">
        {/* Hero */}
        <HeroCarousel />

        {/* Sections */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <BestSellers />
        </div>

        <HowItWorks />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <TargetAudience />
        </div>

        <TestimonialsSection />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <NewsletterSignup />
        </div>
      </main>
    </>
  );
}
