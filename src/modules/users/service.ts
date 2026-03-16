import { compare } from "bcryptjs";
import * as userRepo from "./repository";
import type { CreateUserInput, UpdateUserInput, UserFilters } from "./types";

// ─── User service (orchestrates business logic) ────────

export async function listUsers(filters: UserFilters) {
  return userRepo.findUsers(filters);
}

export async function getUserById(id: string) {
  const user = await userRepo.findUserById(id);
  if (!user) throw new Error("User not found");
  return user;
}

export async function createUser(input: CreateUserInput) {
  if (await userRepo.emailExists(input.email)) throw new Error("Email already in use");
  if (await userRepo.phoneExists(input.phone)) throw new Error("Phone already in use");

  if (!input.roleIds?.length) {
    const customerRole = await userRepo.findRoleByName("Customer");
    if (customerRole) {
      input = { ...input, roleIds: [customerRole.id] };
    }
  }

  return userRepo.createUser(input);
}

export async function updateUser(id: string, input: UpdateUserInput) {
  if (input.email && (await userRepo.emailExists(input.email, id))) {
    throw new Error("Email already in use");
  }
  if (input.phone && (await userRepo.phoneExists(input.phone, id))) {
    throw new Error("Phone already in use");
  }
  return userRepo.updateUser(id, input);
}

export async function deleteUser(id: string) {
  const user = await userRepo.findUserById(id);
  if (!user) throw new Error("User not found");
  return userRepo.deleteUser(id);
}

export async function verifyCredentials(email: string, password: string) {
  const user = await userRepo.findUserByEmail(email);
  if (!user) return null;

  const valid = await compare(password, user.password);
  if (!valid) return null;

  if (!user.isActive) return null;

  return user;
}
