import { prisma } from "@/lib/prisma";
import type { Testimonial, User } from "@prisma/client";

export async function getTestimonials(): Promise<
  Array<Testimonial & { user: Pick<User, "id" | "name"> }>
> {
  return prisma.testimonial.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}