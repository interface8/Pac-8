"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Tag,
  X,
  Bookmark,
  ShoppingCart,
  ShoppingBag,
  Loader2,
  Palette,
  CheckCircle2,
  Package,
} from "lucide-react";
import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  saveForLater,
  moveToCart,
  setPromo,
} from "@/store/cartSlice";
import { toast } from "react-toastify";

const Cart = () => {
  const allItems = useSelector((state: RootState) => state.cart.items);
  const promo = useSelector((state: RootState) => state.cart.promo);
  const dispatch = useDispatch<AppDispatch>();

  const cartItems = allItems.filter((item) => !item.savedForLater);
  const savedItems = allItems.filter((item) => item.savedForLater);

  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const discount = promo ? promo.discount : 0;
  const vat = (subtotal - discount) * 0.075;
  const total = subtotal - discount + vat;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");

    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim(), subtotal }),
      });
      const json = await res.json();

      if (!res.ok) {
        setPromoError(json.message || "Invalid promo code");
        return;
      }

      dispatch(setPromo(json.data));
      toast.success(`Promo code "${json.data.code}" applied!`);
    } catch {
      setPromoError("Failed to validate promo code");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    dispatch(setPromo(null));
    setPromoCode("");
    setPromoError("");
  };

  if (cartItems.length === 0 && savedItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag size={40} className="text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven&apos;t added anything yet. Explore our packaging collection!</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition"
          >
            <ShoppingCart size={18} />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 md:pt-24 py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Shopping Cart
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-medium text-primary hover:text-primary/80 transition hidden sm:flex items-center gap-1"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          {/* LEFT: Cart Items */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 hover:shadow-md transition-shadow group"
              >
                {/* Product Image */}
                <Link
                  href={item.slug ? `/products/${item.slug}` : "/products"}
                  className="relative w-full sm:w-28 md:w-32 h-44 sm:h-32 border border-border rounded-xl overflow-hidden shrink-0"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.designThumbnail && (
                    <div className="absolute bottom-1 right-1 w-8 h-8 bg-primary/90 rounded-md flex items-center justify-center" title="Custom Design">
                      <Palette size={14} className="text-primary-foreground" />
                    </div>
                  )}
                </Link>

                {/* Main content */}
                <div className="flex-1 flex flex-col min-w-0">
                  <Link
                    href={item.slug ? `/products/${item.slug}` : "/products"}
                    className="text-base sm:text-lg font-semibold text-foreground mb-1 hover:text-primary transition truncate"
                  >
                    {item.name}
                  </Link>

                  <p className="text-lg font-bold text-primary mb-3 sm:mb-4">
                    ₦{item.price.toLocaleString()}
                    <span className="text-xs text-muted-foreground font-normal ml-1">/unit</span>
                  </p>

                  {/* Quantity + Actions */}
                  <div className="flex items-center gap-3 sm:gap-4 mt-auto flex-wrap">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => dispatch(decreaseQuantity(item.id))}
                        className="px-3 py-1.5 hover:bg-muted transition-colors disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-4 py-1.5 min-w-10 text-center text-sm font-semibold border-x border-border">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => dispatch(increaseQuantity(item.id))}
                        className="px-3 py-1.5 hover:bg-muted transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        dispatch(saveForLater(item.id));
                        toast.info("Saved for later");
                      }}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-primary text-xs font-medium transition-colors"
                    >
                      <Bookmark size={14} />
                      Save for later
                    </button>

                    <button
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-xs font-medium transition-colors"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>

                {/* Subtotal per item */}
                <div className="text-right font-bold text-foreground text-lg sm:text-xl mt-3 sm:mt-0 sm:min-w-[100px]">
                  ₦{(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}

            {/* No active items but have saved items */}
            {cartItems.length === 0 && savedItems.length > 0 && (
              <div className="bg-card rounded-xl shadow-sm border border-border p-8 text-center">
                <ShoppingCart size={32} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Your cart is empty. Move items from &quot;Saved for Later&quot; below.</p>
              </div>
            )}

            {/* Saved for Later */}
            {savedItems.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Bookmark size={18} className="text-muted-foreground" />
                  Saved for Later
                  <span className="text-sm font-normal text-muted-foreground">({savedItems.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-card rounded-xl shadow-sm border border-border p-4 flex gap-4"
                    >
                      <div className="relative w-20 h-20 border border-border rounded-lg overflow-hidden shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                        <p className="text-sm font-bold text-primary mt-1">₦{item.price.toLocaleString()}</p>
                        <div className="flex gap-3 mt-2">
                          <button
                            onClick={() => {
                              dispatch(moveToCart(item.id));
                              toast.success("Moved to cart");
                            }}
                            className="text-xs font-medium text-primary hover:text-primary/80 transition"
                          >
                            Move to Cart
                          </button>
                          <button
                            onClick={() => dispatch(removeFromCart(item.id))}
                            className="text-xs font-medium text-red-500 hover:text-red-600 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl shadow-sm border border-border p-5 sm:p-6 lg:sticky lg:top-28 space-y-5">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Order Summary
              </h3>

              {/* Promo Code */}
              <div>
                {promo ? (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400 truncate">{promo.code}</p>
                        <p className="text-xs text-green-600 dark:text-green-500">
                          {promo.discountType === "PERCENTAGE"
                            ? `${promo.discountValue}% off`
                            : `₦${promo.discountValue.toLocaleString()} off`}
                        </p>
                      </div>
                    </div>
                    <button onClick={handleRemovePromo} className="text-green-600 hover:text-green-800 transition p-1">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value.toUpperCase());
                            setPromoError("");
                          }}
                          placeholder="Promo code"
                          className="w-full h-10 pl-9 pr-3 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                        />
                      </div>
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoCode.trim()}
                        className="h-10 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50 shrink-0"
                      >
                        {promoLoading ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-xs text-red-500 mt-1.5">{promoError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="text-foreground font-semibold">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">−₦{discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span>VAT (7.5%)</span>
                  <span className="text-foreground font-semibold">
                    ₦{vat.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-1"><Package size={14} /> Shipping</span>
                  <span className="text-foreground font-medium text-xs">Calculated at checkout</span>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between font-bold text-foreground">
                    <span className="text-lg">Total</span>
                    <span className="text-2xl text-primary">
                      ₦{total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout button */}
              <Link
                href="/checkout"
                className={`flex justify-center items-center gap-3 w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-xl font-semibold text-base transition shadow-sm hover:shadow active:scale-[0.98] ${
                  cartItems.length === 0 ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Proceed to Checkout
                <ArrowRight size={16} />
              </Link>

              {/* Payment trust indicators */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Payment Options
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✔</span> Credit/Debit Card (Stripe)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✔</span> Bank Transfer
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✔</span> Pay Small Small (Installments)
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
