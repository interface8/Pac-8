"use client";

import { CreditCard, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import StripePaymentForm from "./StripePaymentForm";
import type { PaymentMethod } from "@/lib/constants/checkout";

interface PaymentStepProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
  clientSecret: string | null;
  stripePromise: Promise<Stripe | null>;
  paymentLoading: boolean;
  setPaymentLoading: (v: boolean) => void;
  onStripeSuccess: (paymentIntentId: string) => void;
  onStripeError: (msg: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function PaymentStep({
  paymentMethod,
  setPaymentMethod,
  clientSecret,
  stripePromise,
  paymentLoading,
  setPaymentLoading,
  onStripeSuccess,
  onStripeError,
  onBack,
  onContinue,
}: PaymentStepProps) {
  return (
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
              onSuccess={onStripeSuccess}
              onError={onStripeError}
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
          onClick={onBack}
          className="h-12 px-6 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition flex items-center gap-2"
        >
          <ChevronLeft size={16} /> Back
        </button>
        {paymentMethod === "bank_transfer" && (
          <button
            onClick={onContinue}
            className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2"
          >
            Continue to Review <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
