import { prisma } from "@/lib/prisma";
import type {
  CreatePermissionInput,
  UpdatePermissionInput,
  PermissionDto,
} from "./types";
import type { Permission } from "@prisma/client";

function toPermissionDto(p: Permission): PermissionDto {
  return {
    id: p.id,
    resource: p.resource,
    action: p.action,
    description: p.description,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export async function findAllPermissions(): Promise<PermissionDto[]> {
  const permissions = await prisma.permission.findMany({
    orderBy: [{ resource: "asc" }, { action: "asc" }],
  });
  return permissions.map(toPermissionDto);
}

export async function findPermissionById(
  id: string,
): Promise<PermissionDto | null> {
  const permission = await prisma.permission.findUnique({ where: { id } });
  return permission ? toPermissionDto(permission) : null;
}

export async function createPermission(
  input: CreatePermissionInput,
): Promise<PermissionDto> {
  const permission = await prisma.permission.create({
    data: {
      resource: input.resource,
      action: input.action,
      description: input.description,
    },
  });
  return toPermissionDto(permission);
}

export async function updatePermission(
  id: string,
  input: UpdatePermissionInput,
): Promise<PermissionDto> {
  const permission = await prisma.permission.update({
    where: { id },
    data: input,
  });
  return toPermissionDto(permission);
}

export async function deletePermission(id: string): Promise<void> {
  await prisma.permission.delete({ where: { id } });
}
