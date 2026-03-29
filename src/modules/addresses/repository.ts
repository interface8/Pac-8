import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AddressDto, CreateAddressInput, UpdateAddressInput } from "./types";

type AddressRecord = Prisma.AddressGetPayload<object>;

function toAddressDto(address: AddressRecord): AddressDto {
  return {
    id: address.id,
    userId: address.userId,
    type: address.type as AddressDto["type"],
    firstName: address.firstName,
    lastName: address.lastName,
    company: address.company,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    state: address.state,
    country: address.country,
    phone: address.phone,
    isDefault: address.isDefault,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
}

export async function findByUserId(userId: string): Promise<AddressDto[]> {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return addresses.map(toAddressDto);
}

export async function findById(id: string): Promise<AddressDto | null> {
  const address = await prisma.address.findUnique({ where: { id } });
  return address ? toAddressDto(address) : null;
}

export async function createAddress(input: CreateAddressInput): Promise<AddressDto> {
  // If setting as default, unset other defaults of same type for user
  if (input.isDefault && input.userId) {
    await prisma.address.updateMany({
      where: { userId: input.userId, type: input.type ?? "SHIPPING", isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: input.userId,
      type: input.type ?? "SHIPPING",
      firstName: input.firstName,
      lastName: input.lastName,
      company: input.company,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2,
      city: input.city,
      state: input.state,
      country: input.country ?? "US",
      phone: input.phone,
      isDefault: input.isDefault ?? false,
    },
  });

  return toAddressDto(address);
}

export async function updateAddress(id: string, input: UpdateAddressInput): Promise<AddressDto> {
  // If setting as default, get the address first to know its userId and type
  if (input.isDefault) {
    const existing = await prisma.address.findUnique({ where: { id } });
    if (existing?.userId) {
      await prisma.address.updateMany({
        where: {
          userId: existing.userId,
          type: input.type ?? existing.type,
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }
  }

  const address = await prisma.address.update({
    where: { id },
    data: input,
  });
  return toAddressDto(address);
}

export async function deleteAddress(id: string): Promise<void> {
  await prisma.address.delete({ where: { id } });
}

export async function addressExists(id: string): Promise<boolean> {
  const count = await prisma.address.count({ where: { id } });
  return count > 0;
}
