import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Welcome</h3>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {user?.name}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Roles</h3>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {user?.roles.join(", ") || "None assigned"}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Permissions</h3>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {user?.permissions.length ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Your Permissions
        </h2>
        <div className="flex flex-wrap gap-2">
          {user?.permissions.map((perm) => (
            <span
              key={perm}
              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
            >
              {perm}
            </span>
          ))}
          {(!user?.permissions || user.permissions.length === 0) && (
            <p className="text-sm text-gray-500">No permissions assigned.</p>
          )}
        </div>
      </div>
    </div>
  );
}
