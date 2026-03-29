import * as addressRepo from "./repository";
import type { CreateAddressInput, UpdateAddressInput } from "./types";

export async function getAddresses(userId: string) {
  return addressRepo.findByUserId(userId);
}

export async function getAddressById(id: string) {
  const address = await addressRepo.findById(id);
  if (!address) throw new Error("Address not found");
  return address;
}

export async function createAddress(userId: string, input: CreateAddressInput) {
  // Auto-set as default if user has no addresses of this type
  const existing = await addressRepo.findByUserId(userId);
  const sameType = existing.filter((a) => a.type === (input.type ?? "SHIPPING"));
  const isDefault = sameType.length === 0 ? true : (input.isDefault ?? false);

  return addressRepo.createAddress({
    ...input,
    userId,
    isDefault,
  });
}

export async function updateAddress(id: string, userId: string, input: UpdateAddressInput) {
  const address = await addressRepo.findById(id);
  if (!address) throw new Error("Address not found");
  if (address.userId !== userId) throw new Error("Address not found");

  return addressRepo.updateAddress(id, input);
}

export async function deleteAddress(id: string, userId: string) {
  const address = await addressRepo.findById(id);
  if (!address) throw new Error("Address not found");
  if (address.userId !== userId) throw new Error("Address not found");

  return addressRepo.deleteAddress(id);
}
