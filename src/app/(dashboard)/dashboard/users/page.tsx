import { requirePermission } from "@/lib/auth";
import { UsersClient } from "./users-client";

export default async function UsersPage() {
  // Server-side permission guard
  await requirePermission("users.read");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        User Management
      </h1>
      <UsersClient />
    </div>
  );
}
