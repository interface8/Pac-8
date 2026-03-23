import React from "react";
import { ShoppingBag, Shield, Zap, Calculator, TrendingUp } from "lucide-react";
import TimelineStep from "@/components/ui/HowItWorksCard";

const steps = [
  {
    number: "1",
    icon: Calculator,
    color: "bg-orange-500",
    title: "Calculate Your Needs",
    description:
      "Upload images of your appliances or manually enter wattage. Our AI-powered system recommends the perfect solar setup tailored to your consumption.",
  },
  {
    number: "2",
    icon: ShoppingBag,
    color: "bg-blue-500",
    title: "Choose Your Products",
    description:
      "Browse our catalog of premium solar panels, inverters, and batteries. Add items to cart based on smart recommendations.",
  },
  {
    number: "3",
    icon: TrendingUp,
    color: "bg-emerald-500",
    title: "Select Payment Option",
    description:
      "Choose full payment or pay-small-small. Set deposit amount (minimum 20%) and payment duration (6-24 months).",
  },
  {
    number: "4",
    icon: Shield,
    color: "bg-purple-500",
    title: "Verify Identity",
    description:
      "Complete BVN/NIN verification for credit purchases to ensure secure transactions and build trust.",
  },
  {
    number: "5",
    icon: Zap,
    color: "bg-amber-500",
    title: "Installation & Monitoring",
    description:
      "Professional installation with smart monitoring. Track payments and system status from your personalized dashboard.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-orange-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-black">
            How It Works
          </h2>
          <p className="mt-3 sm:mt-4 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-medium">
            Get started in{" "}
            <span className="text-orange-600 font-medium">5 simple steps</span>
          </p>
        </div>

        {/* Vertical Timeline */}
        <div className="relative max-w-4xl mx-auto">
         
          <div
            className="
              absolute left-6 sm:left-1/2 sm:-translate-x-1/2
              top-10 bottom-10 w-1 bg-linear-to-b from-orange-200 via-blue-200 to-amber-200
              rounded-full hidden sm:block
            "
          />

          <div className="space-y-12 sm:space-y-16 md:space-y-20">
            {steps.map((step, index) => (
              <TimelineStep
                key={index}
                number={step.number}
                icon={step.icon}
                color={step.color}
                title={step.title}
                description={step.description}
                isEven={index % 2 === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
