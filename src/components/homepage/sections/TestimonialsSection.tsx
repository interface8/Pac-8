"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useTestimonials } from "@/hooks/use-testimonials-api";

const fallbackTestimonials = [
  {
    id: "1",
    name: "Adaeze Okonkwo",
    role: "Event Planner",
    company: "Glow Events",
    content:
      "PAC-8 made my wedding favor packaging look absolutely stunning. The customization editor is so intuitive — I had 200 personalized boxes ready in minutes.",
    rating: 5,
    image: null,
    sortOrder: 1,
  },
  {
    id: "2",
    name: "Tunde Bakare",
    role: "Food Vendor",
    company: "Tunde's Grill House",
    content:
      "Our branded takeaway bags and cups have completely changed how customers perceive our brand. Quality is top-notch and delivery was faster than expected.",
    rating: 5,
    image: null,
    sortOrder: 2,
  },
  {
    id: "3",
    name: "Chioma Eze",
    role: "Startup Founder",
    company: "Bloom Skincare",
    content:
      "The bulk pricing made it affordable for us as a small business, and the design tool let us match our exact brand colors. Absolutely recommend PAC-8!",
    rating: 5,
    image: null,
    sortOrder: 3,
  },
];

export default function TestimonialsSection() {
  const { testimonials: dbTestimonials, loading } = useTestimonials();
  const testimonials = dbTestimonials.length > 0 ? dbTestimonials : fallbackTestimonials;
  return (
    <section className="py-20 bg-muted/50 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-3">
            Loved by businesses like yours
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            See what our customers have to say about their PAC-8 experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading
            ? [1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-2xl border border-border p-8 animate-pulse">
                  <div className="h-10 w-10 bg-muted rounded mb-4" />
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div key={s} className="h-4 w-4 bg-muted rounded" />
                    ))}
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-5/6" />
                    <div className="h-3 bg-muted rounded w-4/6" />
                  </div>
                  <div className="border-t border-border pt-5 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              ))
            : testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl border border-border p-8 hover:shadow-lg transition-shadow"
            >
              <Quote className="text-primary/20 w-10 h-10 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-amber-400 fill-amber-400"
                  />
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              <div className="border-t border-border pt-5">
                <p className="text-sm font-semibold text-foreground">
                  {testimonial.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {testimonial.role}
                  {testimonial.company && ` — ${testimonial.company}`}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
