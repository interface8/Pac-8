"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, Loader2,
  ArrowRight, User, Phone, CheckCircle2, XCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Password rule checks
const RULES = [
  { id: "length",    label: "At least 8 characters",            test: (p: string) => p.length >= 8 },
  { id: "upper",     label: "One uppercase letter (A-Z)",        test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower",     label: "One lowercase letter (a-z)",        test: (p: string) => /[a-z]/.test(p) },
  { id: "number",    label: "One number (0-9)",                  test: (p: string) => /[0-9]/.test(p) },
  { id: "special",   label: "One special character (!@#$%^&*)",  test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

function getStrength(password: string): number {
  return RULES.filter((r) => r.test(password)).length;
}

const STRENGTH_COLORS = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];
const STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong"];

export default function RegisterPage() {
  const { register, loading, error } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false, phone: false, password: false, confirm: false });
  const [submitted, setSubmitted] = useState(false);

  const strength = useMemo(() => getStrength(form.password), [form.password]);
  const passedRules = useMemo(() => RULES.map((r) => ({ ...r, passed: r.test(form.password) })), [form.password]);

  const confirmError = form.confirm && form.password !== form.confirm ? "Passwords do not match" : "";

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const blur = (field: string) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);

    if (strength < 5) return;
    if (form.password !== form.confirm) return;

    await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
  }

  return (
    <div className="w-full">
      {/* Card */}
      <div className="bg-card border border-border rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
        {/* Top band */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary/50" />

        <div className="p-7 sm:p-9">
          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <Image
              src="/images/pac8-logo.jpeg"
              alt="PAC-8 Logo"
              width={56}
              height={56}
              className="rounded-2xl shadow-lg shadow-primary/30 mb-4"
            />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1">Join PAC-8 and start ordering today</p>
          </div>

          {/* API Error */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 mb-5">
              <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={set("name")}
                  onBlur={blur("name")}
                  required
                  className="w-full h-11 pl-10 pr-4 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>
              {(touched.name || submitted) && !form.name && (
                <p className="text-xs text-destructive flex items-center gap-1"><XCircle size={12} /> Name is required</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set("email")}
                  onBlur={blur("email")}
                  required
                  className="w-full h-11 pl-10 pr-4 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>
              {(touched.email || submitted) && !form.email && (
                <p className="text-xs text-destructive flex items-center gap-1"><XCircle size={12} /> Email is required</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">Phone Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+234 800 000 0000"
                  value={form.phone}
                  onChange={set("phone")}
                  onBlur={blur("phone")}
                  required
                  className="w-full h-11 pl-10 pr-4 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={set("password")}
                  onBlur={blur("password")}
                  required
                  className="w-full h-11 pl-10 pr-11 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength bar */}
              {form.password.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          i < strength ? STRENGTH_COLORS[strength - 1] : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength >= 4 ? "text-green-600" : strength >= 3 ? "text-yellow-600" : "text-red-500"}`}>
                    {STRENGTH_LABELS[strength - 1] ?? "Very weak"}
                  </p>
                </div>
              )}

              {/* Rules — show when password field is touched or submitted */}
              {(touched.password || submitted) && form.password.length > 0 && (
                <ul className="space-y-1 pt-1">
                  {passedRules.map((rule) => (
                    <li key={rule.id} className={`flex items-center gap-1.5 text-xs ${rule.passed ? "text-green-600" : "text-muted-foreground"}`}>
                      {rule.passed
                        ? <CheckCircle2 size={12} className="shrink-0" />
                        : <XCircle size={12} className="shrink-0 text-red-400" />}
                      {rule.label}
                    </li>
                  ))}
                </ul>
              )}

              {/* Submission error when rules not met */}
              {submitted && strength < 5 && form.password.length === 0 && (
                <p className="text-xs text-destructive flex items-center gap-1"><XCircle size={12} /> Password is required</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirm" className="text-sm font-medium text-foreground">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={set("confirm")}
                  onBlur={blur("confirm")}
                  required
                  className={`w-full h-11 pl-10 pr-11 bg-muted/50 border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition ${
                    confirmError
                      ? "border-destructive focus:ring-destructive/30"
                      : form.confirm && form.password === form.confirm
                      ? "border-green-500 focus:ring-green-500/20"
                      : "border-border focus:ring-primary/40 focus:border-primary"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmError && (
                <p className="text-xs text-destructive flex items-center gap-1"><XCircle size={12} /> {confirmError}</p>
              )}
              {form.confirm && !confirmError && (
                <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 size={12} /> Passwords match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-primary/20"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Creating account...</>
              ) : (
                <>Create account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">Already have an account?</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Link
            href="/login"
            className="w-full h-11 flex items-center justify-center rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition"
          >
            Sign in instead
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground mt-5">
        &copy; {new Date().getFullYear()} PAC-8 Packaging. All rights reserved.
      </p>
    </div>
  );
}
