"use client";

import Link from "next/link";
import { Package, Mail, Phone, MapPin } from "lucide-react";

const productLinks = [
  { href: "/products", label: "All Products" },
  { href: "/products?category=cups", label: "Custom Cups" },
  { href: "/products?category=boxes", label: "Branded Boxes" },
  { href: "/products?category=bags", label: "Paper Bags" },
  { href: "/products?category=bottles", label: "Bottles & Containers" },
];

const companyLinks = [
  { href: "/about", label: "About PAC-8" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/bulk-orders", label: "Bulk Orders" },
  { href: "/contact", label: "Contact Us" },
];

const supportLinks = [
  { href: "/faq", label: "FAQs" },
  { href: "/shipping", label: "Shipping & Delivery" },
  { href: "/returns", label: "Returns Policy" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Main footer */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="bg-primary p-2 rounded-xl">
                <Package className="text-primary-foreground" size={20} />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                PAC<span className="text-primary">-8</span>
              </span>
            </Link>
            <p className="text-background/60 text-sm leading-relaxed mb-6 max-w-xs">
              Turn ideas into reality, one package at a time. Premium custom
              packaging for brands, events, and businesses.
            </p>
            <div className="space-y-3">
              <a
                href="mailto:hello@pac8.com"
                className="flex items-center gap-2.5 text-sm text-background/50 hover:text-primary transition"
              >
                <Mail size={14} />
                hello@pac8.com
              </a>
              <a
                href="tel:+2348000000000"
                className="flex items-center gap-2.5 text-sm text-background/50 hover:text-primary transition"
              >
                <Phone size={14} />
                +234 800 000 0000
              </a>
              <span className="flex items-center gap-2.5 text-sm text-background/50">
                <MapPin size={14} />
                Lagos, Nigeria
              </span>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background/40 mb-5">
              Products
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/60 hover:text-primary transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background/40 mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/60 hover:text-primary transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background/40 mb-5">
              Support
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/60 hover:text-primary transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-background/40 text-sm">
            &copy; {new Date().getFullYear()} PAC-8. All rights reserved.
          </p>
          <p className="text-background/30 text-xs">
            Pack it, Pack more ($)
          </p>
        </div>
      </div>
    </footer>
  );
}
