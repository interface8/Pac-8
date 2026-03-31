import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

// POST /api/newsletter — subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse("Please provide a valid email address", 400);
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isActive) {
        return errorResponse("You're already subscribed!", 409);
      }
      // Re-subscribe
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { isActive: true, unsubscribedAt: null },
      });
      return jsonResponse({ message: "Welcome back! You've been re-subscribed." });
    }

    await prisma.newsletterSubscriber.create({
      data: { email, name: body.name || null },
    });

    return jsonResponse({ message: "Successfully subscribed!" }, 201);
  } catch {
    return errorResponse("Failed to subscribe", 500);
  }
}
