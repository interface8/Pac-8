import * as roleRepo from "./repository";
import type { CreateRoleInput, UpdateRoleInput } from "./types";

export async function listRoles() {
  return roleRepo.findAllRoles();
}

export async function getRoleById(id: string) {
  const role = await roleRepo.findRoleById(id);
  if (!role) throw new Error("Role not found");
  return role;
}

export async function createRole(input: CreateRoleInput) {
  return roleRepo.createRole(input);
}

export async function updateRole(id: string, input: UpdateRoleInput) {
  const existing = await roleRepo.findRoleById(id);
  if (!existing) throw new Error("Role not found");
  return roleRepo.updateRole(id, input);
}

export async function deleteRole(id: string) {
  const existing = await roleRepo.findRoleById(id);
  if (!existing) throw new Error("Role not found");
  return roleRepo.deleteRole(id);
}
