"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingBag,
  User,
  ChevronDown,
  Menu,
  Heart,
  LayoutDashboard,
  LogOut,
  ShoppingCart,
} from "lucide-react";

export interface HeaderUser {
  name: string;
  email: string;
  roles: string[];
}

import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useCategories } from "@/hooks/use-categories";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import WishlistSidebar from "@/components/wishlist/WishlistSidebar";
import { useWishlist } from "@/hooks/use-wishlist";
import { toast } from "sonner";
import { logout } from "@/app/actions/auth";
import CategoryMega from "@/components/shared/CategoryMega";
import SearchOverlay from "@/components/shared/SearchOverlay";
import MobileDrawer from "@/components/shared/MobileDrawer";

export default function Header({ user }: { user?: HeaderUser | null }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const { categories, loading: catLoading } = useCategories();
  const { items: wishlistItems } = useWishlist();

  const isAdmin = user?.roles?.some((r) => r.toLowerCase() === "admin");

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully");
    window.location.href = "/";
  };

  // Close account dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    if (accountOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [accountOpen]);

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full">
        {/* Top strip */}
        <div className="bg-foreground text-background/70 text-[11px] py-1.5 text-center tracking-wide">
          <span className="hidden sm:inline">
            Custom packaging for every occasion &nbsp;&bull;&nbsp; Bulk
            discounts available
          </span>
          <span className="sm:hidden">Custom packaging — Bulk discounts</span>
        </div>

        {/* Main bar */}
        <div className="bg-card/95 backdrop-blur-xl border-b border-border/80">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-[60px]">
              {/* Left cluster */}
              <div className="flex items-center gap-6">
                {/* Mobile burger */}
                <button
                  className="lg:hidden p-1.5 -ml-1.5 hover:bg-muted rounded-lg transition"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu size={22} className="text-foreground" />
                </button>

                {/* Logo */}
                <Link
                  href="/"
                  className="flex items-center gap-2 shrink-0 group"
                >
                  <Image
                    src="/images/pac8-logo.jpeg"
                    alt="PAC-8 Logo"
                    width={40}
                    height={40}
                    className="rounded-xl"
                  />
                  <span className="text-xl font-extrabold tracking-tight text-foreground">
                    PAC<span className="text-primary">-8</span>
                  </span>
                </Link>

                {/* Desktop nav links */}
                <nav className="hidden lg:flex items-center gap-1">
                  <CategoryMega
                    categories={categories}
                    loading={catLoading}
                  />
                  <Link
                    href="/products"
                    className="text-[13px] font-semibold tracking-wide uppercase text-foreground/70 hover:text-primary transition-colors px-3 py-2"
                  >
                    Shop
                  </Link>
                </nav>
              </div>

              {/* Right cluster */}
              <div className="flex items-center gap-0.5 sm:gap-1">
                {/* Search trigger */}
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 rounded-full hover:bg-muted transition group"
                  aria-label="Search"
                >
                  <Search
                    size={19}
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                  />
                </button>

                {/* Theme toggle */}
                <ThemeToggle />

                {/* Wishlist (desktop) */}
                <button
                  onClick={() => setWishlistOpen(true)}
                  className="hidden sm:flex relative p-2.5 rounded-full hover:bg-muted transition group"
                  title="Wishlist"
                >
                  <Heart
                    size={19}
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                  />
                  {wishlistItems.length > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-card">
                      {wishlistItems.length > 99
                        ? "99+"
                        : wishlistItems.length}
                    </span>
                  )}
                </button>

                {/* Account */}
                {user ? (
                  <div className="relative hidden sm:block" ref={accountRef}>
                    <button
                      onClick={() => setAccountOpen((v) => !v)}
                      className="flex items-center gap-1.5 p-2 rounded-full hover:bg-muted transition group"
                      title="Account"
                    >
                      <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <ChevronDown size={12} className={`text-muted-foreground transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`} />
                    </button>
                    {accountOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl shadow-2xl shadow-black/8 ring-1 ring-black/5 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          {isAdmin && (
                            <Link href="/dashboard" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted transition">
                              <LayoutDashboard size={15} /> Dashboard
                            </Link>
                          )}
                          <Link href="/account" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted transition">
                            <User size={15} /> My Account
                          </Link>
                          <Link href="/account/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted transition">
                            <ShoppingCart size={15} /> My Orders
                          </Link>
                        </div>
                        <div className="border-t border-border py-1">
                          <button onClick={() => { setAccountOpen(false); handleLogout(); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition">
                            <LogOut size={15} /> Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="hidden sm:flex p-2.5 rounded-full hover:bg-muted transition group"
                    title="Account"
                  >
                    <User
                      size={19}
                      className="text-muted-foreground group-hover:text-primary transition-colors"
                    />
                  </Link>
                )}

                {/* Cart */}
                <Link
                  href="/cart"
                  className="relative p-2.5 rounded-full hover:bg-muted transition group"
                  title="Cart"
                >
                  <ShoppingBag
                    size={19}
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                  />
                  {cartCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-card">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile drawer */}
      <MobileDrawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        categories={categories}
        loading={catLoading}
        cartCount={cartCount}
        user={user ?? null}
        onLogout={handleLogout}
      />

      {/* Wishlist sidebar */}
      <WishlistSidebar
        open={wishlistOpen}
        onOpenChange={setWishlistOpen}
      />
    </>
  );
}
