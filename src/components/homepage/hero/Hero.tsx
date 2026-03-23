"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TrendingUp, Calculator, ShoppingBag } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import Image from "next/image";

const slides = [
  {
    image: "/images/power-2.jpg",
    title: "Advanced Technology",
    description: "State-of-the-art solar energy system",
  },
  {
    image: "/images/power-1.jpg",
    title: "Professional Installation",
    description: "Expert solar panel installation for your home",
  },
  {
    image: "/images/power-7.jpg",
    title: "Power Your Household",
    description: "Reliable Energy for your household",
  },
];

export default function Hero() {
  return (
    <section className="w-full bg-orange-50 py-40">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 xl:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center border border-orange-200 gap-2 bg-orange-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
            <p className="text-orange-700 text-xs sm:text-sm font-medium">
              🌟 Nigeria&apos;s #1 Solar Platform
            </p>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-gray-800 leading-tight">
            Power Your Home
            <br />
            <span className="text-orange-500">Pay Small Small</span>
          </h1>

          <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-md md:max-w-xl">
            Get the perfect solar system for your needs. Calculate, buy, and pay
            in flexible installments.
            <span className="text-orange-500 font-medium">
              {" "}
              No huge upfront costs.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex items-center justify-center gap-2 w-full sm:w-auto bg-orange-400 hover:bg-orange-500 text-white px-4 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition">
              <Calculator size={16} />
              <span> Calculate Solar Needs </span>
            </button>

            <Link
              href="/products"
              className="flex items-center justify-center gap-2 w-full sm:w-auto border-2 border-orange-300 text-gray-700 px-6 py-3 rounded-lg font-medium bg-white hover:bg-orange-50 transition"
            >
              <ShoppingBag size={16} />
              <span>Browse Products</span>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-center gap-4 sm:gap-8 pt-2  pr-4 pb-4">
            <div className="text-left md:text-left">
              <p className="text-2xl md:text-xl font-semibold text-gray-800">
                5,000+
              </p>
              <p className="text-sm text-gray-500">Happy Customers</p>
            </div>

            <div className="hidden md:block h-12 border-l border-gray-300 mx-4"></div>

            <div className="text-left md:text-left">
              <p className="text-2xl md:text-xl font-semibold text-gray-800">
                98%
              </p>
              <p className="text-sm text-gray-500">Satisfaction Rate</p>
            </div>

            <div className="hidden md:block h-12 border-l border-gray-300 mx-4"></div>
            <div className="text-left md:text-left flex items-center  justify-start">
              <p className="text-yellow-500 text-lg">⭐⭐⭐⭐⭐</p>
              <p className="text-xs text-gray-500 ml-2">(2,847)</p>
            </div>
          </div>
        </div>

        <div className="relative w-full">
          <Carousel
            plugins={[
              Autoplay({
                delay: 4000,
                stopOnInteraction: false,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent>
              {slides.map((slide, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-64 sm:h-72 md:h-105 lg:h-120 rounded-2xl overflow-hidden">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-cover"
                    />

                    <div className="absolute bottom-6 sm:bottom-8 md:bottom:14 left-4 sm:left-6 md:left-8 text-white max-w-[80%]">
                      <h3 className="text-lg sm:text-xl md:text-4xl font-semibold leading-tight">
                        {slide.title}
                      </h3>

                      <p className="text-xs sm:text-sm md:text-xl opacity-90">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="left-3 md:left-6 bg-white shadow-md" />
            <CarouselNext className="right-3 md:right-6 bg-white shadow-md" />
          </Carousel>

          <div className="hidden lg:flex absolute bottom-6 -left-7 translate-y-1/2 bg-white rounded-2xl shadow-lg p-6 items-center gap-4">
            <div className="bg-green-500 text-white p-3 rounded-xl">
              <TrendingUp />
            </div>

            <div>
              <p className="text-xl font-medium">₦2.8B+</p>
              <p className="text-sm text-gray-700">Customer Savings</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
