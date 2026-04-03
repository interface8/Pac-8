"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { clearCart } from "@/store/cartSlice";
import { useAuth } from "@/components/providers/auth-provider";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  CreditCard,
  ClipboardCheck,
  Truck,
  Building2,
  Check,
  Loader2,
  ShoppingBag,
  Package,
  Shield,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// ─── Stripe setup ──────────────────────────────────────
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ─── Types ─────────────────────────────────────────────
interface ShippingAddress {
  id?: string;
  firstName: string;
  lastName: string;
  company: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  phone: string;
}

interface SavedAddress {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
}

type ShippingMethod = "standard" | "express";

const SHIPPING_RATES: Record<ShippingMethod, { label: string; price: number; days: string }> = {
  standard: { label: "Standard Delivery", price: 2500, days: "5-7 business days" },
  express: { label: "Express Delivery", price: 5000, days: "1-3 business days" },
};

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const emptyAddress: ShippingAddress = {
  firstName: "", lastName: "", company: "", addressLine1: "",
  addressLine2: "", city: "", state: "", country: "Nigeria", phone: "",
};

// ─── Step Indicator ────────────────────────────────────
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { icon: MapPin, label: "Shipping" },
    { icon: CreditCard, label: "Payment" },
    { icon: ClipboardCheck, label: "Review" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
      {steps.map((step, i) => {
        const StepIcon = step.icon;
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;
        return (
          <div key={step.label} className="flex items-center gap-2 sm:gap-4">
            {i > 0 && (
              <div className={`w-8 sm:w-16 h-0.5 ${isCompleted ? "bg-primary" : "bg-border"}`} />
            )}
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check size={16} /> : <StepIcon size={16} />}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stripe Payment Form ───────────────────────────────
function StripePaymentForm({
  onSuccess,
  onError,
  loading,
  setLoading,
}: {
  onSuccess: (paymentIntentId: string) => void;
  onError: (message: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      onError(error.message ?? "Payment failed");
      setLoading(false);
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    } else {
      onError("Payment was not completed");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PaymentElement />
      <button
        onClick={handleSubmit}
        disabled={!stripe || loading}
        className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 size={18} className="animate-spin" /> Processing...</>
        ) : (
          <><CreditCard size={18} /> Pay Now</>
        )}
      </button>
    </div>
  );
}

// ─── Main Checkout Page ────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useAuth();

  const allItems = useSelector((state: RootState) => state.cart.items);
  const promo = useSelector((state: RootState) => state.cart.promo);
  const cartItems = allItems.filter((item) => !item.savedForLater);

  const [step, setStep] = useState(0);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "bank_transfer">("stripe");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  // Guest info
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // Calculated prices
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = promo ? promo.discount : 0;
  const shipping = SHIPPING_RATES[shippingMethod].price;
  const vat = (subtotal - discount) * 0.075;
  const total = subtotal - discount + vat + shipping;

  const customerEmail = user?.email || guestEmail;
  const customerName = user?.name || guestName;
  const customerPhone = guestPhone || "";

  // Fetch saved addresses for logged-in users
  useEffect(() => {
    if (user) {
      fetch("/api/addresses")
        .then((res) => res.json())
        .then((json) => {
          if (json.data) {
            setSavedAddresses(json.data);
            const defaultAddr = json.data.find((a: SavedAddress) => a.isDefault);
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
              populateAddress(defaultAddr);
            }
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const populateAddress = (addr: SavedAddress) => {
    setAddress({
      id: addr.id,
      firstName: addr.firstName,
      lastName: addr.lastName,
      company: addr.company ?? "",
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 ?? "",
      city: addr.city,
      state: addr.state,
      country: addr.country,
      phone: addr.phone ?? "",
    });
  };

  const isShippingValid = useCallback(() => {
    if (!user && (!guestEmail || !guestName)) return false;
    const a = address;
    return !!(a.firstName && a.lastName && a.addressLine1 && a.city && a.state);
  }, [user, guestEmail, guestName, address]);

  // Create Stripe payment intent when moving to payment step
  const initializePayment = async () => {
    if (paymentMethod !== "stripe") return;

    try {
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          customerEmail,
          customerName,
        }),
      });
      const json = await res.json();
      if (res.ok && json.data?.clientSecret) {
        setClientSecret(json.data.clientSecret);
      } else {
        toast.error(json.message || "Failed to initialize payment");
      }
    } catch {
      toast.error("Failed to connect to payment service");
    }
  };

  const handleNextStep = async () => {
    if (step === 0) {
      if (!isShippingValid()) {
        toast.error("Please fill in all required shipping fields");
        return;
      }
      if (step === 0 && paymentMethod === "stripe") {
        await initializePayment();
      }
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    }
  };

  const handlePlaceOrder = async (paymentIntentId?: string) => {
    setOrderLoading(true);

    try {
      // Save address if new and user is logged in
      let shippingAddressId = address.id;
      if (user && !address.id) {
        const addrRes = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: address.firstName,
            lastName: address.lastName,
            company: address.company || undefined,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || undefined,
            city: address.city,
            state: address.state,
            country: address.country,
            phone: address.phone || undefined,
            isDefault: savedAddresses.length === 0,
          }),
        });
        const addrJson = await addrRes.json();
        if (addrRes.ok) shippingAddressId = addrJson.id;
      }

      const orderBody = {
        customerEmail,
        customerName,
        customerPhone: customerPhone || undefined,
        shippingAddressId: shippingAddressId || undefined,
        shippingMethod: shippingMethod,
        paymentMethod: paymentMethod === "stripe" ? "STRIPE" : "BANK_TRANSFER",
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderBody),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.message || "Failed to place order");
        setOrderLoading(false);
        return;
      }

      const order = json.data || json;
      const orderId = order.id;
      const orderNumber = order.orderNumber;

      // Update payment intent with orderId if Stripe payment
      if (paymentIntentId && orderId) {
        await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            customerEmail,
            customerName,
            orderId,
            metadata: { orderNumber },
          }),
        }).catch(() => {});
      }

      // Send confirmation email
      await fetch("/api/orders/confirm-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      }).catch(() => {});

      dispatch(clearCart());
      router.push(`/orders/${orderNumber}/confirmation`);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setOrderLoading(false);
    }
  };

  // Redirect if cart is empty
  if (cartItems.length === 0 && step === 0) {
    return (
      <div className="pt-32 md:pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-lg mx-auto text-center">
          <ShoppingBag size={48} className="text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some items before checking out.</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 md:pt-28 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-2">Checkout</h1>
        <StepIndicator currentStep={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Step Content */}
          <div className="lg:col-span-2">
            {/* ─── Step 0: Shipping ─────────────────────────── */}
            {step === 0 && (
              <div className="space-y-6">
                {/* Guest info */}
                {!user && (
                  <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">Contact Information</h2>
                    <p className="text-sm text-muted-foreground">
                      Checking out as guest. <Link href="/login?callbackUrl=/checkout" className="text-primary font-medium hover:underline">Sign in</Link> for a faster experience.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Full Name *</label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Email *</label>
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="+234 800 000 0000"
                      />
                    </div>
                  </div>
                )}

                {/* Saved Addresses */}
                {user && savedAddresses.length > 0 && !useNewAddress && (
                  <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <MapPin size={18} /> Shipping Address
                    </h2>
                    <div className="space-y-3">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            populateAddress(addr);
                          }}
                          className={`w-full text-left p-4 rounded-xl border-2 transition ${
                            selectedAddressId === addr.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {addr.firstName} {addr.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {addr.city}, {addr.state} — {addr.country}
                              </p>
                              {addr.phone && <p className="text-xs text-muted-foreground mt-1">{addr.phone}</p>}
                            </div>
                            {selectedAddressId === addr.id && (
                              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                                <Check size={14} className="text-primary-foreground" />
                              </div>
                            )}
                          </div>
                          {addr.isDefault && (
                            <span className="inline-block text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded mt-2 uppercase">Default</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setUseNewAddress(true);
                        setSelectedAddressId(null);
                        setAddress(emptyAddress);
                      }}
                      className="text-sm font-medium text-primary hover:text-primary/80 transition"
                    >
                      + Add a new address
                    </button>
                  </div>
                )}

                {/* New Address Form */}
                {(!user || useNewAddress || savedAddresses.length === 0) && (
                  <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <MapPin size={18} /> Shipping Address
                      </h2>
                      {useNewAddress && savedAddresses.length > 0 && (
                        <button
                          onClick={() => {
                            setUseNewAddress(false);
                            const def = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
                            setSelectedAddressId(def.id);
                            populateAddress(def);
                          }}
                          className="text-sm text-primary hover:text-primary/80 transition"
                        >
                          Use saved address
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">First Name *</label>
                        <input
                          type="text"
                          value={address.firstName}
                          onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                          className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Last Name *</label>
                        <input
                          type="text"
                          value={address.lastName}
                          onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                          className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Company (Optional)</label>
                      <div className="relative">
                        <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={address.company}
                          onChange={(e) => setAddress({ ...address, company: e.target.value })}
                          className="w-full h-10 pl-9 pr-3 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Address Line 1 *</label>
                      <input
                        type="text"
                        value={address.addressLine1}
                        onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                        className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Street address"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        value={address.addressLine2}
                        onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                        className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Apt, suite, floor, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">City *</label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">State *</label>
                        <select
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select state</option>
                          {NIGERIAN_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
                        <input
                          type="tel"
                          value={address.phone}
                          onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                          className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="+234..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping Method */}
                <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Truck size={18} /> Shipping Method
                  </h2>
                  <div className="space-y-3">
                    {(Object.entries(SHIPPING_RATES) as [ShippingMethod, typeof SHIPPING_RATES["standard"]][]).map(
                      ([key, rate]) => (
                        <button
                          key={key}
                          onClick={() => setShippingMethod(key)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition flex items-center justify-between ${
                            shippingMethod === key
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground">{rate.label}</p>
                            <p className="text-xs text-muted-foreground">{rate.days}</p>
                          </div>
                          <span className="text-sm font-bold text-foreground">₦{rate.price.toLocaleString()}</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  disabled={!isShippingValid()}
                  className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Continue to Payment <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* ─── Step 1: Payment ──────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <CreditCard size={18} /> Payment Method
                  </h2>

                  <div className="space-y-3">
                    <button
                      onClick={() => setPaymentMethod("stripe")}
                      className={`w-full text-left p-4 rounded-xl border-2 transition ${
                        paymentMethod === "stripe"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard size={20} className="text-primary" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Card Payment</p>
                          <p className="text-xs text-muted-foreground">Pay securely with your debit or credit card</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("bank_transfer")}
                      className={`w-full text-left p-4 rounded-xl border-2 transition ${
                        paymentMethod === "bank_transfer"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 size={20} className="text-primary" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Bank Transfer</p>
                          <p className="text-xs text-muted-foreground">Transfer directly to our bank account</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Stripe Card Form */}
                {paymentMethod === "stripe" && clientSecret && (
                  <div className="bg-card rounded-xl border border-border p-5">
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: "stripe",
                          variables: {
                            colorPrimary: "#7c3aed",
                            borderRadius: "8px",
                          },
                        },
                      }}
                    >
                      <StripePaymentForm
                        onSuccess={(paymentIntentId) => handlePlaceOrder(paymentIntentId)}
                        onError={(msg) => toast.error(msg)}
                        loading={paymentLoading}
                        setLoading={setPaymentLoading}
                      />
                    </Elements>
                  </div>
                )}

                {/* Bank Transfer Details */}
                {paymentMethod === "bank_transfer" && (
                  <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Bank Transfer Details</h3>
                    <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bank</span>
                        <span className="font-medium text-foreground">Access Bank</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account Name</span>
                        <span className="font-medium text-foreground">PAC-8 Packaging Ltd</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account Number</span>
                        <span className="font-medium text-foreground font-mono">0123456789</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      After transferring, your order will be confirmed once payment is verified (within 24 hours).
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(0)}
                    className="h-12 px-6 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition flex items-center gap-2"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  {paymentMethod === "bank_transfer" && (
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2"
                    >
                      Continue to Review <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ─── Step 2: Review & Confirm ─────────────────── */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Shipping Summary */}
                <div className="bg-card rounded-xl border border-border p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <MapPin size={18} /> Shipping
                    </h2>
                    <button onClick={() => setStep(0)} className="text-sm text-primary hover:text-primary/80 transition">
                      Edit
                    </button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{address.firstName} {address.lastName}</p>
                    <p>{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}</p>
                    <p>{address.city}, {address.state} — {address.country}</p>
                    {address.phone && <p>{address.phone}</p>}
                  </div>
                  <div className="text-sm text-muted-foreground pt-2 border-t border-border">
                    <span className="font-medium text-foreground">{SHIPPING_RATES[shippingMethod].label}</span>
                    <span className="ml-2">({SHIPPING_RATES[shippingMethod].days})</span>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <CreditCard size={18} /> Payment
                    </h2>
                    <button onClick={() => setStep(1)} className="text-sm text-primary hover:text-primary/80 transition">
                      Edit
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {paymentMethod === "stripe" ? "Card Payment (Stripe)" : "Bank Transfer"}
                  </p>
                </div>

                {/* Order Items */}
                <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Package size={18} /> Items ({cartItems.length})
                  </h2>
                  <div className="divide-y divide-border">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Place Order */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="h-12 px-6 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition flex items-center gap-2"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button
                    onClick={() => handlePlaceOrder()}
                    disabled={orderLoading}
                    className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {orderLoading ? (
                      <><Loader2 size={18} className="animate-spin" /> Placing Order...</>
                    ) : (
                      <><Shield size={18} /> Place Order — ₦{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Order Summary (sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-5 lg:sticky lg:top-28 space-y-4">
              <h3 className="text-lg font-bold text-foreground">Order Summary</h3>

              {/* Items preview */}
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-12 h-12 bg-muted rounded-lg overflow-hidden shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold text-foreground">₦{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-medium">₦{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>−₦{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT (7.5%)</span>
                  <span className="text-foreground font-medium">₦{vat.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-foreground font-medium">₦{shipping.toLocaleString()}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground">
                  <span>Total</span>
                  <span className="text-xl text-primary">₦{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
