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
} from "lucide-react";
import { cn } from "@/components/ui/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", permission: null, icon: LayoutDashboard },
  { label: "Users", href: "/dashboard/users", permission: "users.read", icon: Users },
  { label: "Roles", href: "/dashboard/roles", permission: "roles.read", icon: Shield },
  { label: "Permissions", href: "/dashboard/permissions", permission: "permissions.read", icon: Lock },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link href="/dashboard" className="text-xl font-bold text-sidebar-primary">
          Power8
        </Link>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavItem key={item.href} item={item} isActive={pathname === item.href} />
        ))}
      </nav>
    </aside>
  );
}

function NavItem({
  item,
  isActive,
}: {
  item: (typeof navItems)[number];
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
