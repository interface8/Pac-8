"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  ChevronRight,
  Package,
} from "lucide-react";
import { cn } from "@/components/ui/utils";

const accountNav = [
  { label: "Overview", href: "/account", icon: User },
  { label: "My Orders", href: "/account/orders", icon: ShoppingBag },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Wishlist", href: "/account/wishlist", icon: Heart },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {accountNav.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {item.label}
            {isActive && <ChevronRight className="ml-auto size-4" />}
          </Link>
        );
      })}
    </nav>
  );
}

export function AccountShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div className="flex items-center gap-2">
              <Package className="size-5 text-primary" />
              <span className="text-lg font-bold">My Account</span>
            </div>
            <AccountSidebar />
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          <MobileAccountNav />
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function MobileAccountNav() {
  const pathname = usePathname();

  return (
    <>
      {accountNav.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium border transition-all",
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/30"
            )}
          >
            <Icon className="size-3.5" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
