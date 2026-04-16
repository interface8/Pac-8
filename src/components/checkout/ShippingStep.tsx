"use client";

import Link from "next/link";
import { MapPin, Building2, Truck, Check, ChevronRight } from "lucide-react";
import type { ShippingAddress, SavedAddress, ShippingMethod } from "@/lib/constants/checkout";
import { NIGERIAN_STATES, SHIPPING_RATES, EMPTY_ADDRESS } from "@/lib/constants/checkout";

interface ShippingStepProps {
  user: { email: string; name: string } | null;
  address: ShippingAddress;
  setAddress: (addr: ShippingAddress) => void;
  savedAddresses: SavedAddress[];
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string | null) => void;
  useNewAddress: boolean;
  setUseNewAddress: (v: boolean) => void;
  shippingMethod: ShippingMethod;
  setShippingMethod: (m: ShippingMethod) => void;
  guestName: string;
  setGuestName: (v: string) => void;
  guestEmail: string;
  setGuestEmail: (v: string) => void;
  guestPhone: string;
  setGuestPhone: (v: string) => void;
  isShippingValid: () => boolean;
  onNext: () => void;
  populateAddress: (addr: SavedAddress) => void;
}

export default function ShippingStep({
  user,
  address,
  setAddress,
  savedAddresses,
  selectedAddressId,
  setSelectedAddressId,
  useNewAddress,
  setUseNewAddress,
  shippingMethod,
  setShippingMethod,
  guestName,
  setGuestName,
  guestEmail,
  setGuestEmail,
  guestPhone,
  setGuestPhone,
  isShippingValid,
  onNext,
  populateAddress,
}: ShippingStepProps) {
  return (
    <div className="space-y-6">
      {/* Guest info */}
      {!user && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Contact Information</h2>
          <p className="text-sm text-muted-foreground">
            Checking out as guest.{" "}
            <Link href="/login?callbackUrl=/checkout" className="text-primary font-medium hover:underline">
              Sign in
            </Link>{" "}
            for a faster experience.
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
                      {addr.addressLine1}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
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
                  <span className="inline-block text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded mt-2 uppercase">
                    Default
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setUseNewAddress(true);
              setSelectedAddressId(null);
              setAddress(EMPTY_ADDRESS);
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
                  <option key={s} value={s}>
                    {s}
                  </option>
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
          {(Object.entries(SHIPPING_RATES) as [ShippingMethod, (typeof SHIPPING_RATES)["standard"]][]).map(
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
        onClick={onNext}
        disabled={!isShippingValid()}
        className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        Continue to Payment <ChevronRight size={16} />
      </button>
    </div>
  );
}
