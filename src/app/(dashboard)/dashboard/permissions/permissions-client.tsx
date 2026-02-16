"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { usePermission } from "@/components/providers/auth-provider";

interface PermissionDto {
  id: string;
  resource: string;
  action: string;
  description: string | null;
}

async function fetchPermissions(): Promise<PermissionDto[]> {
  const res = await fetch("/api/permissions");
  if (!res.ok) throw new Error("Failed to fetch permissions");
  return res.json();
}

export function PermissionsClient() {
  const queryClient = useQueryClient();
  const canCreate = usePermission("permissions.create");
  const canUpdate = usePermission("permissions.update");
  const canDelete = usePermission("permissions.delete");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PermissionDto | null>(null);

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/permissions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete permission");
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["permissions"] }),
  });

  // Group permissions by resource
  const grouped = (permissions ?? []).reduce(
    (acc, p) => {
      if (!acc[p.resource]) acc[p.resource] = [];
      acc[p.resource].push(p);
      return acc;
    },
    {} as Record<string, PermissionDto[]>,
  );

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
            + New Permission
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="text-sm text-gray-500">No permissions found.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([resource, perms]) => (
            <div key={resource} className="rounded-lg border bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                {resource}
              </h3>
              <div className="space-y-2">
                {perms.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-2"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {perm.resource}.{perm.action}
                      </span>
                      {perm.description && (
                        <p className="text-xs text-gray-500">
                          {perm.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {canUpdate && (
                        <button
                          onClick={() => {
                            setEditing(perm);
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
                            if (confirm("Delete this permission?"))
                              deleteMutation.mutate(perm.id);
                          }}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <PermissionFormModal
          permission={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Permission Form Modal ─────────────────────────────

function PermissionFormModal({
  permission,
  onClose,
}: {
  permission: PermissionDto | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEditing = !!permission;

  const [resource, setResource] = useState(permission?.resource ?? "");
  const [action, setAction] = useState(permission?.action ?? "");
  const [description, setDescription] = useState(permission?.description ?? "");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = isEditing
        ? `/api/permissions/${permission.id}`
        : "/api/permissions";
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
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      onClose();
    },
    onError: (err: Error) => setError(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      resource,
      action,
      description: description || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {isEditing ? "Edit Permission" : "Create Permission"}
        </h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Resource
            </label>
            <input
              type="text"
              value={resource}
              onChange={(e) => setResource(e.target.value)}
              required
              placeholder="e.g. users, roles"
              className="w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Action
            </label>
            <input
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              required
              placeholder="e.g. read, create, update, delete"
              className="w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
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
