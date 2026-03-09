import { requirePermission } from "@/lib/auth";
import { UsersClient } from "./users-client";

export default async function UsersPage() {
  await requirePermission("users.read");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts, assign roles, and control access
        </p>
      </div>
      <UsersClient />
    </div>
  );
}
