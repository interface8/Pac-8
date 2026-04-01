import { requirePermission } from "@/lib/auth";
import { CategoriesClient } from "./categories-client";

export default async function CategoriesPage() {
  await requirePermission("categories.read");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Category Management</h1>
        <p className="text-muted-foreground">
          Organize your product catalog with categories and subcategories
        </p>
      </div>
      <CategoriesClient />
    </div>
  );
}
