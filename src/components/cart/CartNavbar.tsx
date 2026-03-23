"use client";

import Link from "next/link";
import { LogIn, Sun, ShoppingCart } from "lucide-react";

export default function CartNavbar() {
  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-2 rounded-xl shadow">
            <Sun className="text-white" size={30} />
          </div>
          <span className="text-xl text-orange-600 font-bold">Power - 8</span>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/products"
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium border border-gray-200 bg-green-50 text-black rounded-lg hover:bg-green-200 hover:shadow-lg transition"
          >
            <ShoppingCart size={16} />
            Continue Shopping
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white border bg-green-950 hover:bg-green-900 hover:shadow-lg "
          >
            <LogIn size={16} />
            Login
          </Link>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/products"
            className="border border-gray-200 bg-green-50 hover:bg-green-200 hover:shadow-lg text-black p-2 rounded-md"
          >
            <ShoppingCart size={18} />
          </Link>

          <Link
            href="/login"
            className="border p-2 text-white bg-green-950 hover:bg-green-900 hover:text-white hover:shadow-lg rounded-md"
          >
            <LogIn size={18} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
