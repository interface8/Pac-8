"use client";

import Cart from "@/components/cart/Cart";
import SiteHeader from "@/components/layout/SiteHeader";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <Cart />
    </div>
  );
}
