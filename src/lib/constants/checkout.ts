// ─── Checkout Types ─────────────────────────────────
export interface ShippingAddress {
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

export interface SavedAddress {
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

export type ShippingMethod = "standard" | "express";
export type PaymentMethod = "stripe" | "bank_transfer";

// ─── Constants ──────────────────────────────────────────
export const SHIPPING_RATES: Record<ShippingMethod, { label: string; price: number; days: string }> = {
  standard: { label: "Standard Delivery", price: 2500, days: "5-7 business days" },
  express: { label: "Express Delivery", price: 5000, days: "1-3 business days" },
};

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export const EMPTY_ADDRESS: ShippingAddress = {
  firstName: "", lastName: "", company: "", addressLine1: "",
  addressLine2: "", city: "", state: "", country: "Nigeria", phone: "",
};
