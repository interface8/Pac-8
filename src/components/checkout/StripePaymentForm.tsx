"use client";

import { Loader2, CreditCard } from "lucide-react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface StripePaymentFormProps {
  onSuccess: (paymentIntentId: string) => void;
  onError: (message: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

export default function StripePaymentForm({
  onSuccess,
  onError,
  loading,
  setLoading,
}: StripePaymentFormProps) {
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
