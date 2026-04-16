"use client";

import { MapPin, CreditCard, ClipboardCheck, Check } from "lucide-react";

const steps = [
  { icon: MapPin, label: "Shipping" },
  { icon: CreditCard, label: "Payment" },
  { icon: ClipboardCheck, label: "Review" },
];

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
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
