import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthProvider } from "@/components/providers/auth-provider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

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
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
