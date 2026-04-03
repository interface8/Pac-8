"use client";

import { motion } from "framer-motion";
import { Search, Paintbrush, Truck } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Browse",
    description:
      "Explore our catalog of cups, boxes, bags, bottles, and more. Filter by category, size, or material.",
  },
  {
    icon: Paintbrush,
    step: "02",
    title: "Customize",
    description:
      "Use our real-time design editor to add your logo, text, colors, and QR codes. Preview instantly.",
  },
  {
    icon: Truck,
    step: "03",
    title: "Order",
    description:
      "Place your order — single units or bulk. We print, pack, and deliver to your doorstep.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HowItWorks() {
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
            How it works
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-3">
            Three simple steps
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            From idea to delivered packaging in just a few clicks
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {steps.map((step) => (
            <motion.div
              key={step.step}
              variants={itemVariants}
              className="relative bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow group"
            >
              {/* Step number */}
              <span className="absolute top-6 right-6 text-4xl sm:text-5xl font-extrabold text-muted/80 select-none">
                {step.step}
              </span>

              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <step.icon className="text-primary" size={26} />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
