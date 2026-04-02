import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthProvider } from "@/components/providers/auth-provider";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = user.roles.some((r) => r.toLowerCase() === "admin");
  if (!isAdmin) {
    redirect("/account");
  }

  return (
    <AuthProvider user={user}>
      <div className="flex h-screen bg-muted/40">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
