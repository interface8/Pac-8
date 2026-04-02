"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  User,
  ChevronDown,
  Menu,
  X,
  ChevronRight,
  Package,
  Heart,
  ArrowRight,
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
import { useCategories, type ApiCategory } from "@/hooks/use-categories";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import WishlistSidebar from "@/components/wishlist/WishlistSidebar";
import { useWishlist } from "@/hooks/use-wishlist";

/* ------------------------------------------------------------------ */
/*  CategoryMega – desktop hover mega-menu                            */
/* ------------------------------------------------------------------ */
function CategoryMega({
  categories,
  loading,
}: {
  categories: ApiCategory[];
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enter = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const leave = () => {
    timer.current = setTimeout(() => {
      setOpen(false);
      setActiveId(null);
    }, 220);
  };

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );
  useEffect(() => {
    if (open && categories.length && !activeId) setActiveId(categories[0].id);
  }, [open, categories, activeId]);

  const active = categories.find((c) => c.id === activeId);

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        className={`flex items-center gap-1 text-[13px] font-semibold tracking-wide uppercase transition-colors ${
          open
            ? "text-primary"
            : "text-foreground/70 hover:text-primary"
        }`}
      >
        Categories
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-4 w-[640px] bg-card rounded-2xl shadow-2xl shadow-black/8 ring-1 ring-black/5 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {loading ? (
            <div className="p-8 grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-muted rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No categories yet
            </div>
          ) : (
            <div className="flex min-h-[280px]">
              {/* Left – parent list */}
              <div className="w-[220px] bg-muted/40 py-3 border-r border-border">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?categoryId=${cat.id}`}
                    onMouseEnter={() => setActiveId(cat.id)}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between px-5 py-2.5 text-[13px] transition-all ${
                      activeId === cat.id
                        ? "bg-card text-primary font-semibold shadow-sm border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/50 border-l-2 border-transparent"
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {cat.children && cat.children.length > 0 && (
                      <ChevronRight
                        size={13}
                        className="text-muted-foreground/50 shrink-0"
                      />
                    )}
                  </Link>
                ))}
                <div className="mx-5 mt-2 pt-2 border-t border-border">
                  <Link
                    href="/products"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:text-primary/80 py-1.5"
                  >
                    View all products
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Right – subcategories */}
              <div className="flex-1 p-6">
                {active ? (
                  <>
                    <Link
                      href={`/products?categoryId=${active.id}`}
                      onClick={() => setOpen(false)}
                      className="text-sm font-bold text-foreground hover:text-primary transition-colors"
                    >
                      {active.name}
                    </Link>
                    {active.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-sm">
                        {active.description}
                      </p>
                    )}
                    {active.children && active.children.length > 0 ? (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-4">
                        {active.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/products?categoryId=${child.id}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between py-2 text-[13px] text-muted-foreground hover:text-primary transition-colors group"
                          >
                            <span>{child.name}</span>
                            {child.productCount !== undefined &&
                              child.productCount > 0 && (
                                <span className="text-[11px] text-muted-foreground/50 group-hover:text-primary/60 tabular-nums">
                                  {child.productCount}
                                </span>
                              )}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-6 text-sm text-muted-foreground/50">
                        No subcategories
                      </p>
                    )}
                    <div className="mt-5 pt-3 border-t border-border">
                      <Link
                        href={`/products?categoryId=${active.id}`}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
                      >
                        Shop all {active.name} <ArrowRight size={12} />
                      </Link>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground/50 mt-10 text-center">
                    Hover a category
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SearchOverlay – click icon → full-screen search                   */
/* ------------------------------------------------------------------ */
function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery("");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl mt-[15vh] mx-4 animate-in slide-in-from-top-4 duration-200">
        <form onSubmit={submit} className="relative">
          <Search
            size={20}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for packaging products..."
            className="w-full h-14 pl-14 pr-14 bg-card rounded-2xl text-base shadow-2xl ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => {
              onClose();
              setQuery("");
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-lg transition"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </form>
        <p className="text-center text-xs text-white/60 mt-4">
          Press Enter to search &middot; Esc to close
        </p>
      </div>
      <div
        className="absolute inset-0 -z-10"
        onClick={() => {
          onClose();
          setQuery("");
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MobileDrawer                                                      */
/* ------------------------------------------------------------------ */
function MobileDrawer({
  isOpen,
  onClose,
  categories,
  loading,
  cartCount,
  user,
  onLogout,
}: {
  isOpen: boolean;
  onClose: () => void;
  categories: ApiCategory[];
  loading: boolean;
  cartCount: number;
  user: HeaderUser | null;
  onLogout: () => void;
}) {
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
            <div className="bg-gradient-to-br from-primary to-primary/80 p-1.5 rounded-xl">
              <Package className="text-primary-foreground" size={16} />
            </div>
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
                href="/orders"
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

/* ================================================================== */
/*  Header                                                            */
/* ================================================================== */
export default function Header({ user }: { user?: HeaderUser | null }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { categories, loading: catLoading } = useCategories();
  const { items: wishlistItems } = useWishlist();

  const isAdmin = user?.roles?.some((r) => r.toLowerCase() === "admin");

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

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
                  <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow">
                    <Package
                      className="text-primary-foreground"
                      size={18}
                    />
                  </div>
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
                          <Link href="/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted transition">
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
