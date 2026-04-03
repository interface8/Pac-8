"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { LogOut, User, ChevronDown, ExternalLink, Menu } from "lucide-react";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { logout } from "@/app/actions/auth";

export function DashboardHeader({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const user = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    toast.success("Signed out successfully");
    window.location.href = "/";
  };

  const segments = pathname.replace(/^\/dashboard\/?/, "").split("/").filter(Boolean);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onToggleSidebar}>
          <Menu className="size-5" />
        </Button>

        {/* Breadcrumb */}
        <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {segments.length > 0 ? (
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            ) : (
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {segments.map((seg, i) => (
            <React.Fragment key={seg}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {i === segments.length - 1 ? (
                  <BreadcrumbPage className="capitalize">{seg}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={`/dashboard/${segments.slice(0, i + 1).join("/")}`} className="capitalize">{seg}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="hidden sm:flex gap-1.5 text-muted-foreground">
          <Link href="/" target="_blank">
            <ExternalLink className="size-3.5" /> View Store
          </Link>
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Badge variant="secondary" className="hidden sm:inline-flex">
          {user?.roles.join(", ") || "No role"}
        </Badge>

        <div ref={menuRef} className="relative">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <User className="size-4" />
            <span className="hidden sm:inline">{user?.name}</span>
            <ChevronDown className="size-3" />
          </Button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95">
              <div className="px-2 py-1.5 text-sm font-medium">{user?.email}</div>
              <div className="bg-border -mx-1 my-1 h-px" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="size-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
