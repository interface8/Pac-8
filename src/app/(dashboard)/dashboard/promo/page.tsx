import { requirePermission } from "@/lib/auth";
import { PromoClient } from "./promo-client";

export default async function PromoPage() {
  await requirePermission("orders.read");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Promo Codes</h1>
        <p className="text-muted-foreground">
          Create and manage discount codes for your customers
        </p>
      </div>
      <PromoClient />
    </div>
  );
}
