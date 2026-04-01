"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermission } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  Shield,
  Lock,
  ShoppingCart,
  Package,
  FolderTree,
  Home,
} from "lucide-react";
import { cn } from "@/components/ui/utils";

interface NavSection {
  title: string;
  items: {
    label: string;
    href: string;
    permission: string | null;
    icon: typeof LayoutDashboard;
  }[];
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", permission: null, icon: LayoutDashboard },
    ],
  },
  {
    title: "Commerce",
    items: [
      { label: "Orders", href: "/dashboard/orders", permission: "orders.read", icon: ShoppingCart },
      { label: "Products", href: "/dashboard/products", permission: "products.read", icon: Package },
      { label: "Categories", href: "/dashboard/categories", permission: "categories.read", icon: FolderTree },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Users", href: "/dashboard/users", permission: "users.read", icon: Users },
      { label: "Roles", href: "/dashboard/roles", permission: "roles.read", icon: Shield },
      { label: "Permissions", href: "/dashboard/permissions", permission: "permissions.read", icon: Lock },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
        <Link href="/dashboard" className="text-xl font-bold text-sidebar-primary">
          Pac8
        </Link>
        <Link href="/" title="Go to site">
          <Home className="size-4 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors" />
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <NavSection key={section.title} section={section} pathname={pathname} />
        ))}
      </nav>

      <Separator />
      <div className="p-4">
        <p className="text-[10px] text-sidebar-foreground/40 text-center">Pac8 Admin Panel</p>
      </div>
    </aside>
  );
}

function NavSection({ section, pathname }: { section: NavSection; pathname: string }) {
  return (
    <div className="space-y-1">
      <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
        {section.title}
      </p>
      {section.items.map((item) => (
        <NavItem key={item.href} item={item} isActive={pathname === item.href} />
      ))}
    </div>
  );
}

function NavItem({
  item,
  isActive,
}: {
  item: NavSection["items"][number];
  isActive: boolean;
}) {
  const hasAccess = usePermission(item.permission ?? "");

  if (item.permission && !hasAccess) return null;

  const Icon = item.icon;

  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-3",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
      )}
      asChild
    >
      <Link href={item.href}>
        <Icon className="size-4" />
        {item.label}
      </Link>
    </Button>
  );
}
