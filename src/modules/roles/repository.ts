import { prisma } from "@/lib/prisma";
import type { CreateRoleInput, UpdateRoleInput, RoleDto } from "./types";

const roleWithPermissions = {
  include: {
    permissions: {
      include: {
        permission: {
          select: { id: true, resource: true, action: true },
        },
      },
    },
  },
} as const;

interface RoleWithPermissions {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  permissions: Array<{
    permission: {
      id: string;
      resource: string;
      action: string;
    };
  }>;
}

function toRoleDto(role: RoleWithPermissions): RoleDto {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
    permissions:
      role.permissions?.map((rp) => ({
        id: rp.permission.id,
        resource: rp.permission.resource,
        action: rp.permission.action,
      })) ?? [],
  };
}

export async function findAllRoles(): Promise<RoleDto[]> {
  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
    ...roleWithPermissions,
  });
  return roles.map(toRoleDto);
}

export async function findRoleById(id: string): Promise<RoleDto | null> {
  const role = await prisma.role.findUnique({
    where: { id },
    ...roleWithPermissions,
  });
  return role ? toRoleDto(role) : null;
}

export async function createRole(input: CreateRoleInput): Promise<RoleDto> {
  const role = await prisma.role.create({
    data: {
      name: input.name,
      description: input.description,
      permissions: input.permissionIds?.length
        ? { create: input.permissionIds.map((permissionId) => ({ permissionId })) }
        : undefined,
    },
    ...roleWithPermissions,
  });
  return toRoleDto(role);
}

export async function updateRole(
  id: string,
  input: UpdateRoleInput,
): Promise<RoleDto> {
  const data: {
    name?: string;
    description?: string | null;
    permissions?: { create: Array<{ permissionId: string }> };
  } = {};
  if (input.name) data.name = input.name;
  if (input.description !== undefined) data.description = input.description;

  if (input.permissionIds) {
    await prisma.rolePermission.deleteMany({ where: { roleId: id } });
    data.permissions = {
      create: input.permissionIds.map((permissionId) => ({ permissionId })),
    };
  }

  const role = await prisma.role.update({
    where: { id },
    data,
    ...roleWithPermissions,
  });
  return toRoleDto(role);
}

export async function deleteRole(id: string): Promise<void> {
  await prisma.role.delete({ where: { id } });
}
