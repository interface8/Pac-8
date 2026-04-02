"use server";

import { removeAuthCookie } from "@/lib/auth";

export async function logout() {
  await removeAuthCookie();
}
