"use client";

import Link from "next/link";
import { Sun } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0B1F3A] text-white py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-orange-400 p-3 rounded-xl">
            <Sun className="text-white" size={22} />
          </div>
          <span className="text-2xl font-medium">Power - 8</span>
        </div>

        <p className="text-gray-300 text-sm md:text-base max-w-md">
          Empowering homes with affordable solar energy
        </p>

        <div className="flex flex-wrap justify-center gap-6 text-gray-300 text-sm md:text-base">
          <Link href="/calculator" className="hover:text-orange-400 transition">
            Calculator
          </Link>

          <Link href="/products" className="hover:text-orange-400 transition">
            Products
          </Link>

          <Link
            href="/testimonials"
            className="hover:text-orange-400 transition"
          >
            Testimonials
          </Link>
        </div>

        <div className="w-full border-t border-gray-700 mt-6 pt-6">
          <p className="text-gray-400 text-sm">
            © 2026 Power - 8 Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
