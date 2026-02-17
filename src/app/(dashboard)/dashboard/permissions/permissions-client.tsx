"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { usePermission } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

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
  const [deleteTarget, setDeleteTarget] = useState<PermissionDto | null>(null);

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/permissions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete permission");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      setDeleteTarget(null);
    },
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
    <>
      {canCreate && (
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <Plus className="size-4" />
            New Permission
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No permissions found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([resource, perms]) => (
            <Card key={resource}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {resource}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {perms.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-2.5"
                  >
                    <div>
                      <span className="text-sm font-medium">
                        {perm.resource}.{perm.action}
                      </span>
                      {perm.description && (
                        <p className="text-xs text-muted-foreground">
                          {perm.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {canUpdate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditing(perm);
                            setShowForm(true);
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(perm)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => {
        if (!open) {
          setShowForm(false);
          setEditing(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Permission" : "Create Permission"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update permission details"
                : "Define a new resource-action permission"}
            </DialogDescription>
          </DialogHeader>
          <PermissionFormInner
            permission={editing}
            onClose={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Permission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.resource}.{deleteTarget?.action}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Permission Form (inside Dialog) ─────────────────────

function PermissionFormInner({
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="perm-resource">Resource</Label>
        <Input
          id="perm-resource"
          type="text"
          value={resource}
          onChange={(e) => setResource(e.target.value)}
          required
          placeholder="e.g. users, roles"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="perm-action">Action</Label>
        <Input
          id="perm-action"
          type="text"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          required
          placeholder="e.g. read, create, update, delete"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="perm-desc">Description</Label>
        <Input
          id="perm-desc"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : isEditing ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
