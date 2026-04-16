"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { clearCart } from "@/store/cartSlice";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ShoppingBag } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

import type { ShippingAddress, SavedAddress, ShippingMethod, PaymentMethod } from "@/lib/constants/checkout";
import { SHIPPING_RATES, EMPTY_ADDRESS } from "@/lib/constants/checkout";
import StepIndicator from "@/components/checkout/StepIndicator";
import ShippingStep from "@/components/checkout/ShippingStep";
import PaymentStep from "@/components/checkout/PaymentStep";
import ReviewStep from "@/components/checkout/ReviewStep";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = promo ? promo.discount : 0;
  const shipping = SHIPPING_RATES[shippingMethod].price;
  const vat = (subtotal - discount) * 0.075;
  const total = subtotal - discount + vat + shipping;

  const customerEmail = user?.email || guestEmail;
  const customerName = user?.name || guestName;
  const customerPhone = guestPhone || "";

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

  const initializePayment = async () => {
    if (paymentMethod !== "stripe") return;
    try {
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, customerEmail, customerName }),
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
      if (paymentMethod === "stripe") {
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
        shippingMethod,
        paymentMethod: paymentMethod === "stripe" ? "STRIPE" : "BANK_TRANSFER",
        items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })),
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

      if (paymentIntentId && orderId) {
        await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total, customerEmail, customerName, orderId, metadata: { orderNumber } }),
        }).catch(() => {});
      }

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

  if (cartItems.length === 0 && step === 0) {
    return (
      <div className="pt-32 md:pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-lg mx-auto text-center">
          <ShoppingBag size={48} className="text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some items before checking out.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition"
          >
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
          <div className="lg:col-span-2">
            {step === 0 && (
              <ShippingStep
                user={user}
                address={address}
                setAddress={setAddress}
                savedAddresses={savedAddresses}
                selectedAddressId={selectedAddressId}
                setSelectedAddressId={setSelectedAddressId}
                useNewAddress={useNewAddress}
                setUseNewAddress={setUseNewAddress}
                shippingMethod={shippingMethod}
                setShippingMethod={setShippingMethod}
                guestName={guestName}
                setGuestName={setGuestName}
                guestEmail={guestEmail}
                setGuestEmail={setGuestEmail}
                guestPhone={guestPhone}
                setGuestPhone={setGuestPhone}
                isShippingValid={isShippingValid}
                onNext={handleNextStep}
                populateAddress={populateAddress}
              />
            )}

            {step === 1 && (
              <PaymentStep
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                clientSecret={clientSecret}
                stripePromise={stripePromise}
                paymentLoading={paymentLoading}
                setPaymentLoading={setPaymentLoading}
                onStripeSuccess={(id) => handlePlaceOrder(id)}
                onStripeError={(msg) => toast.error(msg)}
                onBack={() => setStep(0)}
                onContinue={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <ReviewStep
                address={address}
                shippingMethod={shippingMethod}
                paymentMethod={paymentMethod}
                cartItems={cartItems}
                total={total}
                orderLoading={orderLoading}
                onEditShipping={() => setStep(0)}
                onEditPayment={() => setStep(1)}
                onBack={() => setStep(1)}
                onPlaceOrder={() => handlePlaceOrder()}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <CheckoutSummary
              cartItems={cartItems}
              subtotal={subtotal}
              discount={discount}
              vat={vat}
              shipping={shipping}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
