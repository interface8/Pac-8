import { NextResponse } from "next/server";
import { testimonialsService } from "@/modules/testimonials";

export async function GET() {
  const testimonials = await testimonialsService.listTestimonials();
  return NextResponse.json(testimonials);
}