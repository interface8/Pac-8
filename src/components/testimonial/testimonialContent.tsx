"use client"
import { LucideArrowLeft } from "lucide-react";
import Link from "next/link";
import StatsSummary from "./StatsSummary";
import TestimonialCard from "./testimonialCard";
import CTASection from "./CTASection";
import { useEffect, useState } from "react";
// import Image from "next/image";


type Testimonial = {
  rating: string;
  quote: string;
  name: string;
  role: string;
  location: string;
  system: string;
  savings: string;
  image: string

  
}




export default function TestimonialContent() {
  const [testimonial, setTestimonial] = useState<Testimonial[]>([])

  useEffect(() => {
    const fetchTestimonial = async() => {
      const res = await fetch("/api/testimonialRoute")
      const data = await res.json()
      setTestimonial(data)

    }
    fetchTestimonial()
  },[])


  return (
    <div className="min-h-screen w-full bg-[#FFFAEC]">
      <div className=" w-[97%] mx-auto pt-24  py-8">
        <Link href="/" className="flex items-center space-x-4 pl-8">
          <span>
            <LucideArrowLeft size={15} />
          </span>
          <p className="text-gray-700 font-xl text-sm md:text-xl lg:font-semibold">
            Back to Home
          </p>
        </Link>
      </div>
      <section className="py-4 px-4 ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-8xl font-medium text-gray-900 mb-8">
              Stories from Our
              <span className="block text-orange-600">Happy Customers</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-800 max-w-6xl mx-auto">
              Real experiences from real people who&apos;ve
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4 px-6 my-24">
            {testimonial.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial}  />
             ))}
          </div>

          <div className="flex justify-center items-center pb-24">
          <CTASection />

          </div>
        </div>
  
  );
}
