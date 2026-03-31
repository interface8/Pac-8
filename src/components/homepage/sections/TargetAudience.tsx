"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  PartyPopper,
  UtensilsCrossed,
  Palette,
  Building2,
  Gift,
} from "lucide-react";

const audiences = [
  {
    icon: Briefcase,
    title: "Entrepreneurs & Startups",
    description:
      "Stand out with branded packaging that makes your product unforgettable from unboxing to sharing.",
  },
  {
    icon: PartyPopper,
    title: "Event Planners",
    description:
      "Custom cups, bags, and boxes for weddings, conferences, parties, and corporate events.",
  },
  {
    icon: UtensilsCrossed,
    title: "Food & Beverage Vendors",
    description:
      "Branded takeaway containers, cups, and bags that elevate your food business identity.",
  },
  {
    icon: Palette,
    title: "Creatives & Designers",
    description:
      "Bring your designs to life on real packaging. Perfect for merch, art prints, and more.",
  },
  {
    icon: Building2,
    title: "Corporate & B2B",
    description:
      "Bulk orders with consistent branding for offices, retail chains, and franchise operations.",
  },
  {
    icon: Gift,
    title: "Gift & Seasonal",
    description:
      "Personalized packaging for holidays, birthdays, and special occasions — made memorable.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function TargetAudience() {
  return (
    <section className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">
          Built for you
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">
          Who uses PAC-8?
        </h2>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
          Whether you&apos;re packaging a product, an event, or an experience
          — we&apos;ve got you covered
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {audiences.map((item) => (
          <motion.div
            key={item.title}
            variants={itemVariants}
            className="group rounded-2xl border border-border bg-card p-7 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <item.icon className="text-primary" size={22} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
