"use client";

import Link from "next/link";
import { LogIn, UserPlus, Sun, ShoppingCart } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export default function Navbar() {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-purple-600 p-2 rounded-xl shadow-md">
            <Sun className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold text-gray-900">
            Power<span className="text-purple-600"> - 8</span>
          </span>
        </Link>

        {/* Right Side (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/products"
            className="text-sm font-medium text-gray-600 hover:text-purple-600 px-3 py-2 transition"
          >
            Products
          </Link>

          <Link
            href="/cart"
            className="relative p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <ShoppingCart size={20} className="text-gray-600" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition"
          >
            <LogIn size={16} />
            Login
          </Link>

          <Link
            href="/register"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <UserPlus size={16} />
            Sign Up
          </Link>
        </div>

        {/* Mobile Buttons */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/cart"
            className="relative p-2 rounded-lg hover:bg-gray-100"
          >
            <ShoppingCart size={18} className="text-gray-600" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-purple-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            href="/login"
            className="border border-gray-200 p-2 rounded-lg"
          >
            <LogIn size={18} className="text-gray-600" />
          </Link>

          <Link
            href="/register"
            className="bg-purple-600 text-white p-2 rounded-lg"
          >
            <UserPlus size={18} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
