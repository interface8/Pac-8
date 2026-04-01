import { getCurrentUser } from "@/lib/auth";
import { DashboardOverview } from "./overview-client";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}. Here&apos;s an overview of your store.
        </p>
      </div>
      <DashboardOverview />
    </div>
  );
}
