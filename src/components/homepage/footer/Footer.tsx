"use client";

import Link from "next/link";
import { Sun } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-purple-600 p-2.5 rounded-xl">
                <Sun className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold">
                Power<span className="text-purple-400"> - 8</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering homes and businesses with affordable, reliable solar
              energy solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/products"
                  className="text-sm text-gray-400 hover:text-purple-400 transition"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-sm text-gray-400 hover:text-purple-400 transition"
                >
                  Solar Panels
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-sm text-gray-400 hover:text-purple-400 transition"
                >
                  Inverters
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-sm text-gray-400 hover:text-purple-400 transition"
                >
                  Batteries
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-purple-400 transition"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-purple-400 transition"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/calculator"
                  className="text-sm text-gray-400 hover:text-purple-400 transition"
                >
                  Solar Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              Support
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-purple-400 transition"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-purple-400 transition"
                >
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-purple-400 transition"
                >
                  Warranty Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 Power - 8 Platform. All rights reserved.
          </p>
          <div className="flex gap-6 text-gray-500 text-sm">
            <Link href="/" className="hover:text-purple-400 transition">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-purple-400 transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
