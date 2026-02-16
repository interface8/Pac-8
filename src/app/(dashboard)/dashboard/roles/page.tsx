import { requirePermission } from "@/lib/auth";
import { RolesClient } from "./roles-client";

export default async function RolesPage() {
  await requirePermission("roles.read");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Role Management
      </h1>
      <RolesClient />
    </div>
  );
}
