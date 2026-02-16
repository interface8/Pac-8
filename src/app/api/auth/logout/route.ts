import { removeAuthCookie } from "@/lib/auth";
import { jsonResponse } from "@/lib/http";

export async function POST() {
  await removeAuthCookie();
  return jsonResponse({ message: "Logged out successfully" });
}
