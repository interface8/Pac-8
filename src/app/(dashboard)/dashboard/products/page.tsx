import { requirePermission } from "@/lib/auth";
import { ProductsClient } from "./products-client";

export default async function ProductsPage() {
  await requirePermission("products.read");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Product Management</h1>
        <p className="text-muted-foreground">
          Manage your product catalog, inventory, and pricing
        </p>
      </div>
      <ProductsClient />
    </div>
  );
}
