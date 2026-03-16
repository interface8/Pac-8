"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserDto {
  id: string;
  email: string;
  phone: string;
  name: string;
  isActive: boolean;
  roles: { id: string; name: string }[];
}

interface RoleOption {
  id: string;
  name: string;
}

interface UserFormModalProps {
  user: UserDto | null;
  onClose: () => void;
}

async function fetchRoles(): Promise<RoleOption[]> {
  const res = await fetch("/api/roles");
  if (!res.ok) return [];
  return res.json();
}

export function UserFormModal({ user, onClose }: UserFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!user;

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(
    user?.roles.map((r) => r.id) ?? [],
  );
  const [error, setError] = useState("");

  const { data: roles } = useQuery({
    queryKey: ["roles-options"],
    queryFn: fetchRoles,
  });

  const mutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = isEditing ? `/api/users/${user.id}` : "/api/users";
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
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const payload: Record<string, unknown> = {
      name,
      email,
      phone,
      isActive,
    };

    if (selectedRoleIds.length > 0) {
      payload.roleIds = selectedRoleIds;
    }

    if (password) {
      payload.password = password;
    } else if (!isEditing) {
      setError("Password is required");
      return;
    }

    mutation.mutate(payload);
  }

  function toggleRole(roleId: string) {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="user-name">Name</Label>
        <Input
          id="user-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-phone">Phone</Label>
        <Input
          id="user-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-email">Email</Label>
        <Input
          id="user-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-password">
          Password {isEditing && "(leave blank to keep current)"}
        </Label>
        <Input
          id="user-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          {...(!isEditing ? { required: true } : {})}
        />
      </div>

      {isEditing && (
        <div className="flex items-center gap-3">
          <Switch
            id="user-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="user-active">Active</Label>
        </div>
      )}

      <div className="space-y-2">
        <Label>Roles</Label>
        <div className="flex flex-wrap gap-2">
          {roles?.map((role) => (
            <Badge
              key={role.id}
              variant={
                selectedRoleIds.includes(role.id) ? "default" : "outline"
              }
              className="cursor-pointer"
              onClick={() => toggleRole(role.id)}
            >
              {role.name}
            </Badge>
          ))}
          {(!roles || roles.length === 0) && (
            <p className="text-xs text-muted-foreground">No roles available.</p>
          )}
        </div>
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
