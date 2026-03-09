import { requirePermission } from "@/lib/auth";
import { PermissionsClient } from "./permissions-client";

export default async function PermissionsPage() {
  await requirePermission("permissions.read");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Permission Management
        </h1>
        <p className="text-muted-foreground">
          Manage fine-grained permissions for resources and actions
        </p>
      </div>
      <PermissionsClient />
    </div>
  );
}
