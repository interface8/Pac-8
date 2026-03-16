import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import type { Prisma } from "@prisma/client";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserDto,
  UserFilters,
  PaginatedResult,
} from "./types";

// ─── Prisma include for user with roles ────────────────
const userWithRoles = {
  include: {
    roles: {
      include: {
        role: {
          select: { id: true, name: true },
        },
      },
    },
  },
} as const;

interface UserWithRoles {
  id: string;
  email: string;
  phone: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: Array<{
    role: { id: string; name: string };
  }>;
}

function toUserDto(user: UserWithRoles): UserDto {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    roles: user.roles?.map((ur) => ({ id: ur.role.id, name: ur.role.name })) ?? [],
  };
}

// ─── Repository functions (functional pattern) ─────────

export async function findUsers(
  filters: UserFilters = {},
): Promise<PaginatedResult<UserDto>> {
  const { search, isActive, roleId, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (roleId) {
    where.roles = { some: { roleId } };
  }

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      ...userWithRoles,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: data.map(toUserDto),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function findUserById(id: string): Promise<UserDto | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    ...userWithRoles,
  });

  return user ? toUserDto(user) : null;
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    ...userWithRoles,
  });
}

export async function createUser(input: CreateUserInput): Promise<UserDto> {
  const hashedPassword = await hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      phone: input.phone,
      password: hashedPassword,
      name: input.name,
      roles: input.roleIds?.length
        ? {
            create: input.roleIds.map((roleId) => ({ roleId })),
          }
        : undefined,
    },
    ...userWithRoles,
  });

  return toUserDto(user);
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<UserDto> {
  const data: {
    email?: string;
    phone?: string;
    name?: string;
    isActive?: boolean;
    password?: string;
    roles?: { create: Array<{ roleId: string }> };
  } = {};

  if (input.email) data.email = input.email;
  if (input.phone) data.phone = input.phone;
  if (input.name) data.name = input.name;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.password) data.password = await hash(input.password, 12);

  // Handle role assignments
  if (input.roleIds) {
    // Delete existing roles & re-create
    await prisma.userRole.deleteMany({ where: { userId: id } });
    data.roles = {
      create: input.roleIds.map((roleId) => ({ roleId })),
    };
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    ...userWithRoles,
  });

  return toUserDto(user);
}

export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({ where: { id } });
}

export async function emailExists(
  email: string,
  excludeId?: string,
): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      email,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
  return !!user;
}

export async function phoneExists(phone: string, excludeId?: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      phone,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
  return !!user;
}

export async function findRoleByName(name: string) {
  return prisma.role.findUnique({ where: { name } });
}

