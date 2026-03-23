"use client"
import { LucideArrowLeft } from "lucide-react";
import Link from "next/link";
import StatsSummary from "./StatsSummary";
import TestimonialCard from "./testimonialCard";
import CTASection from "./CTASection";
import { useTestimonials } from "@/hooks/use-testimonials";

export default function TestimonialContent() {
  const { testimonials, loading, error } = useTestimonials();

  return (
    <div className="min-h-screen w-full bg-[#FFFAEC] px-24">
      <div className=" w-[97%] mx-auto pt-24  py-8">
        <Link href="/" className="flex items-center space-x-4 pl-8">
          <span>
            <LucideArrowLeft size={15} />
          </span>
          <p className="text-gray-800 font-xl text-sm md:text-xl lg:font-semibold">
            Back to Home
          </p>
        </Link>
      </div>
      <section className="py-4 px-4 ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-7xl font-medium text-gray-900 mb-8 tracking-wider">
              Stories from Our
              <div className="h-18 overflow-hidden">
              <span className="block text-orange-600 leading-none">Happy Customers</span>
              </div>
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 max-w-6xl mx-auto tracking-wide">
              Real experiences from real people who&apos;ve{' '}
                <br className="block sm:hidden" />
                transformed their lives with solar energy
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-[90%] sm:w-{80%} mx-auto mt-12"></div>
        </div>
      </section>

      <div className="px-4 sm:px-6 lg:px-8">
        <StatsSummary />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-24">
          <p className="text-xl text-gray-600">Loading testimonials...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex justify-center items-center py-24">
          <p className="text-xl text-red-600">Error: {error}</p>
        </div>
      )}

      {/* Testimonials Grid */}
      {!loading && !error && testimonials.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4 px-6 my-24">
          {testimonials.map((testimonial) => (
            <TestimonialCard 
              key={testimonial.id} 
              rating="1"
              quote={testimonial.description}
              name={testimonial.user.name}
              role=""
              location=""
              system=""
              savings=""
              image=""
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && testimonials.length === 0 && (
        <div className="flex justify-center items-center py-24">
          <p className="text-xl text-gray-600">No testimonials yet.</p>
        </div>
      )}

      <div className="flex justify-center items-center pb-24">
        <CTASection />
      </div>
    </div>
  
  );
}
