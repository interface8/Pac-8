"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        setSubscribed(true);
        setEmail("");
        toast.success("You're subscribed! Welcome to PAC-8.");
      } else {
        const data = await res.json();
        toast.error(data.error || "Something went wrong");
      }
    } catch {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-6 py-16 md:px-16 md:py-20 text-center"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white" />
        </div>

        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-4">
            Stay in the loop
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-sm md:text-base">
            Get exclusive deals, new product drops, and packaging tips delivered
            to your inbox. No spam, unsubscribe anytime.
          </p>

          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-primary-foreground font-semibold">
              <CheckCircle size={20} />
              You&apos;re on the list!
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 h-12 px-5 rounded-xl bg-white/20 backdrop-blur-sm text-primary-foreground placeholder:text-primary-foreground/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="h-12 px-6 rounded-xl bg-white text-primary font-semibold text-sm hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  "Subscribing..."
                ) : (
                  <>
                    Subscribe
                    <Send size={14} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  );
}
