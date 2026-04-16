"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  User,
  ShoppingCart,
} from "lucide-react";
import type { ApiCategory } from "@/hooks/use-categories";
import type { HeaderUser } from "@/components/shared/Header";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ApiCategory[];
  loading: boolean;
  cartCount: number;
  user: HeaderUser | null;
  onLogout: () => void;
}

export default function MobileDrawer({
  isOpen,
  onClose,
  categories,
  loading,
  cartCount,
  user,
  onLogout,
}: MobileDrawerProps) {
  const isAdmin = user?.roles?.some((r) => r.toLowerCase() === "admin");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="absolute left-0 top-0 h-full w-[300px] max-w-[85vw] bg-card shadow-2xl flex flex-col animate-in slide-in-from-left duration-250">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5"
          >
            <Image
              src="/images/pac8-logo.jpeg"
              alt="PAC-8 Logo"
              width={34}
              height={34}
              className="rounded-xl"
            />
            <span className="text-lg font-extrabold tracking-tight text-foreground">
              PAC<span className="text-primary">-8</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-lg transition"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto py-3">
          <div className="px-3 space-y-0.5 mb-2">
            {[
              { href: "/", label: "Home" },
              { href: "/products", label: "Shop All" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/70 hover:bg-muted transition"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/70 hover:bg-muted transition"
            >
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Divider */}
          <div className="mx-5 my-3 border-t border-border" />

          {/* Categories */}
          <div className="px-3">
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              Categories
            </p>
            {loading ? (
              <div className="space-y-2 px-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-9 bg-muted rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              categories.map((cat) => (
                <div key={cat.id}>
                  <div className="flex items-center">
                    <Link
                      href={`/products?categoryId=${cat.id}`}
                      onClick={onClose}
                      className="flex-1 px-3 py-2.5 text-sm text-foreground/70 hover:bg-muted rounded-xl transition"
                    >
                      {cat.name}
                    </Link>
                    {cat.children && cat.children.length > 0 && (
                      <button
                        onClick={() =>
                          setExpandedCat(
                            expandedCat === cat.id ? null : cat.id
                          )
                        }
                        className="p-2 hover:bg-muted rounded-lg transition"
                      >
                        <ChevronDown
                          size={14}
                          className={`text-muted-foreground transition-transform duration-200 ${expandedCat === cat.id ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>
                  {expandedCat === cat.id &&
                    cat.children &&
                    cat.children.length > 0 && (
                      <div className="ml-5 pl-3 border-l-2 border-primary/20 space-y-0.5 mb-2">
                        {cat.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/products?categoryId=${child.id}`}
                            onClick={onClose}
                            className="flex items-center justify-between px-3 py-2 text-[13px] text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition"
                          >
                            <span>{child.name}</span>
                            {child.productCount !== undefined &&
                              child.productCount > 0 && (
                                <span className="text-[10px] text-muted-foreground/50">
                                  {child.productCount}
                                </span>
                              )}
                          </Link>
                        ))}
                      </div>
                    )}
                </div>
              ))
            )}
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-4 space-y-2">
          {user ? (
            <>
              <div className="flex items-center gap-3 px-1 py-2">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              {isAdmin && (
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-foreground border border-border hover:bg-muted transition"
                >
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
              )}
              <Link
                href="/account"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-foreground border border-border hover:bg-muted transition"
              >
                <User size={15} /> My Account
              </Link>
              <Link
                href="/account/orders"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-foreground border border-border hover:bg-muted transition"
              >
                <ShoppingCart size={15} /> My Orders
              </Link>
              <button
                onClick={() => { onClose(); onLogout(); }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30 transition"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-foreground border border-border hover:bg-muted transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
