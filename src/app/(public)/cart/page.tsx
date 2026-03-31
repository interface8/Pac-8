"use client";

import Cart from "@/components/cart/Cart";
import Header from "@/components/shared/Header";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Cart />
    </div>
  );
}
