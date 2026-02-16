"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermission } from "@/components/providers/auth-provider";

const navItems = [
  { label: "Dashboard", href: "/dashboard", permission: null },
  { label: "Users", href: "/dashboard/users", permission: "users.read" },
  { label: "Roles", href: "/dashboard/roles", permission: "roles.read" },
  { label: "Permissions", href: "/dashboard/permissions", permission: "permissions.read" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="text-xl font-bold text-blue-600">
          Power8
        </Link>
      </div>

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

  // Show item if no permission required, or if user has permission
  if (item.permission && !hasAccess) return null;

  return (
    <Link
      href={item.href}
      className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {item.label}
    </Link>
  );
}
