"use client";

import Link from "next/link";
import { LogIn, UserPlus, Sun, Star } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-2 rounded-xl shadow">
            <Sun className="text-white" size={30} />
          </div>
          <span className="text-2xl text-orange-500 font-semibold">
            Power - 8
          </span>
        </div>

        {/* Right Side (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
         
          <Link
            href="/testimonials"
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium border-2 border-orange-400 text-orange-600 rounded-lg hover:bg-orange-50 transition"
          >
            <Star size={14} />
            Testimonials
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-2 border border-orange-400 hover:bg-orange-50 px-4 py-2 rounded-md text-sm"
          >
            <LogIn size={16} />
            Login
          </Link>

          <Link
            href="/register"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 hover:shadow-lg text-white px-4 py-2 rounded-md text-sm"
          >
            <UserPlus size={16} />
            Get Started
          </Link>
        </div>

        {/* Mobile Buttons */}
        <div className="flex md:hidden items-center gap-2">
        
          <Link
            href="/testimonials"
            className="border-2 border-orange-400 text-orange-600 p-2 rounded-md"
          >
            <Star size={18} />
          </Link>

          <button className="border p-2 rounded-md">
            <LogIn size={18} />
          </button>

          <button className="bg-orange-500 text-white p-2 rounded-md">
            <UserPlus size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
