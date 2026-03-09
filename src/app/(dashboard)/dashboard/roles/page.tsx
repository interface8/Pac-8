import { requirePermission } from "@/lib/auth";
import { RolesClient } from "./roles-client";

export default async function RolesPage() {
  await requirePermission("roles.read");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
        <p className="text-muted-foreground">
          Define roles and assign permissions to control access
        </p>
      </div>
      <RolesClient />
    </div>
  );
}
