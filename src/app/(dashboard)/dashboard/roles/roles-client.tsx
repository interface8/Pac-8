"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { usePermission } from "@/components/providers/auth-provider";

interface RoleDto {
  id: string;
  name: string;
  description: string | null;
  permissions: { id: string; resource: string; action: string }[];
}

interface PermissionOption {
  id: string;
  resource: string;
  action: string;
}

async function fetchRoles(): Promise<RoleDto[]> {
  const res = await fetch("/api/roles");
  if (!res.ok) throw new Error("Failed to fetch roles");
  return res.json();
}

async function fetchPermissions(): Promise<PermissionOption[]> {
  const res = await fetch("/api/permissions");
  if (!res.ok) return [];
  return res.json();
}

export function RolesClient() {
  const queryClient = useQueryClient();
  const canCreate = usePermission("roles.create");
  const canUpdate = usePermission("roles.update");
  const canDelete = usePermission("roles.delete");

  const [editing, setEditing] = useState<RoleDto | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: roles, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });

  const { data: permissions } = useQuery({
    queryKey: ["permissions-options"],
    queryFn: fetchPermissions,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete role");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });

  return (
    <div>
      {canCreate && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + New Role
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : roles?.length === 0 ? (
          <p className="text-sm text-gray-500">No roles found.</p>
        ) : (
          roles?.map((role) => (
            <div key={role.id} className="rounded-lg border bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{role.name}</h3>
                  {role.description && (
                    <p className="mt-0.5 text-sm text-gray-500">
                      {role.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {canUpdate && (
                    <button
                      onClick={() => {
                        setEditing(role);
                        setShowForm(true);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => {
                        if (confirm("Delete this role?"))
                          deleteMutation.mutate(role.id);
                      }}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {role.permissions.map((p) => (
                  <span
                    key={p.id}
                    className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                  >
                    {p.resource}.{p.action}
                  </span>
                ))}
                {role.permissions.length === 0 && (
                  <span className="text-xs text-gray-400">
                    No permissions assigned
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <RoleFormModal
          role={editing}
          permissions={permissions ?? []}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Role Form Modal ───────────────────────────────────

function RoleFormModal({
  role,
  permissions,
  onClose,
}: {
  role: RoleDto | null;
  permissions: PermissionOption[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEditing = !!role;

  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    role?.permissions.map((p) => p.id) ?? [],
  );
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = isEditing ? `/api/roles/${role.id}` : "/api/roles";
      const method = isEditing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message ?? "Operation failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      onClose();
    },
    onError: (err: Error) => setError(err.message),
  });

  function togglePermission(id: string) {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      name,
      description: description || undefined,
      permissionIds: selectedPermissionIds,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {isEditing ? "Edit Role" : "Create Role"}
        </h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Permissions
            </label>
            <div className="max-h-48 overflow-y-auto rounded-md border p-3">
              <div className="flex flex-wrap gap-2">
                {permissions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePermission(p.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      selectedPermissionIds.includes(p.id)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {p.resource}.{p.action}
                  </button>
                ))}
                {permissions.length === 0 && (
                  <p className="text-xs text-gray-500">
                    No permissions available.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? "Saving..." : isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
