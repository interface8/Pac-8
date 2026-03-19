import { NextResponse } from "next/server";
import { testimonialsService } from "@/modules/testimonials";

export async function GET() {
  const stats = await testimonialsService.getTestimonialStats();
  console.log("API Stats:", stats);
  return NextResponse.json(stats);
}
