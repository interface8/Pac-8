import { requirePermission } from "@/lib/auth";
import { PermissionsClient } from "./permissions-client";

export default async function PermissionsPage() {
  await requirePermission("permissions.read");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Permission Management
      </h1>
      <PermissionsClient />
    </div>
  );
}
