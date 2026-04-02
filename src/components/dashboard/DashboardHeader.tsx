"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { LogOut, User, ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logout } from "@/app/actions/auth";

export function DashboardHeader() {
  const user = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully");
    router.push("/");
    router.refresh();
  };

  const segments = pathname.replace(/^\/dashboard\/?/, "").split("/").filter(Boolean);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <User className="size-4" />
              <span className="hidden sm:inline">{user?.name}</span>
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 size-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
