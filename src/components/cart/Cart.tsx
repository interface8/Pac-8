"use client";

import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} from "@/store/cartSlice";
import Link from "next/link";

const Cart = () => {
  const items = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch<AppDispatch>();

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const vat = subtotal * 0.075;
  const total = subtotal + vat;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-xl font-medium text-foreground mb-4">
            Your cart is empty
          </p>
          <Link
            href="/products"
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-28 md:pt-24 py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          {/* LEFT: Cart Items */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-lg sm:rounded-xl shadow-sm border border-border p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 hover:shadow transition-shadow"
              >
                {/* Product Image */}
                <div className="relative w-full sm:w-28 md:w-32 h-44 sm:h-32 border border-border rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                    {item.name}
                  </h3>

                  <p className="text-lg font-bold text-primary mb-3 sm:mb-4">
                    ₦{item.price.toLocaleString()}
                  </p>

                  {/* Quantity + Remove */}
                  <div className="flex items-center gap-4 sm:gap-6 mt-auto">
                    <div className="flex items-center border border-border rounded-md overflow-hidden">
                      <button
                        onClick={() => dispatch(decreaseQuantity(item.id))}
                        className="px-3 py-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>

                      <span className="px-4 py-1.5 min-w-10 text-center text-sm font-medium">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => dispatch(increaseQuantity(item.id))}
                        className="px-3 py-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>

                {/* Subtotal per item (right-aligned on larger screens) */}
                <div className="text-right font-bold text-foreground text-lg sm:text-xl mt-3 sm:mt-0 sm:min-w-30">
                  ₦{(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg sm:rounded-xl shadow-sm border border-border p-5 sm:p-6 lg:sticky lg:top-6">
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-12">
                Order Summary
              </h3>

              <div className="space-y-3  sm:space-y-4 text-sm sm:text-base text-muted-foreground">
                <div className="flex mt-8 justify-between">
                  <span>Subtotal</span>
                    <span className="text-foreground font-semibold">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (7.5%)</span>
                  <span className="text-foreground font-semibold">
                    ₦{vat.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-border pt-4 mt-2">
                  <div className="flex justify-between text-lg sm:text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span className="text-primary text-2xl">
                      ₦{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button className="flex justify-center items-center gap-3 w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-medium text-base sm:text-lg transition shadow-sm hover:shadow active:scale-[0.98]">
                Proceed to Checkout
                <ArrowRight size={16} />
              </button>

              <p className="text-center text-xs sm:text-sm text-muted-foreground mt-4">
                Please{" "}
                <span className="text-primary font-medium">login</span> to
                continue
              </p>

              {/* Payment Options – added as per your Figma screenshot */}
              <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-border">
                <h4 className="text-base sm:text-lg font-semibold text-foreground mb-3">
                  Payment Options
                </h4>
                <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✔</span> Full Payment
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✔</span> Pay Small Small
                    (Installments)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
