"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useCarouselSlides } from "@/hooks/use-carousels";

const fallbackSlides = [
  {
    image: "/images/hero-packaging-1.jpg",
    title: "Custom Packaging, Your Way",
    subtitle: "Design branded cups, boxes, bags & more with our real-time editor.",
    link: "/products",
  },
  {
    image: "/images/hero-packaging-2.jpg",
    title: "Bulk Orders, Better Prices",
    subtitle: "Get volume discounts on 100+ units. Perfect for events & businesses.",
    link: "/products?isFeatured=true",
  },
  {
    image: "/images/hero-packaging-3.jpg",
    title: "From Concept to Delivery",
    subtitle: "Browse, customize, and order — we handle printing and shipping.",
    link: "/products",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const { slides: dbSlides, loading } = useCarouselSlides("homepage");

  const slides = useMemo(() => {
    if (dbSlides.length > 0) {
      return dbSlides.map((s) => ({
        image: s.imageUrl,
        title: s.title,
        subtitle: s.description,
        link: s.link || "/products",
      }));
    }
    return fallbackSlides;
  }, [dbSlides]);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative w-full aspect-[16/7] min-h-[320px] md:min-h-[400px] rounded-2xl overflow-hidden group">
      {loading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-2xl" />
      )}

      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

          {/* Slide content */}
          <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-12 max-w-2xl">
            <h2 className="text-2xl md:text-5xl font-bold text-white leading-tight mb-3">
              {slide.title}
            </h2>
            <p className="text-sm md:text-lg text-white/80 mb-6 max-w-lg">
              {slide.subtitle}
            </p>
            <Link
              href={slide.link}
              className="inline-flex items-center gap-2 w-fit bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              Shop Now
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ))}

      {/* Left/Right Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dot pagination */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === current
                ? "bg-white w-8"
                : "bg-white/50 w-2.5 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
