import HeroCarousel from "@/components/homepage/HeroCarousel";
import BestSellers from "@/components/homepage/sections/BestSellers";
import HowItWorks from "@/components/homepage/sections/HowItWorks";
import TargetAudience from "@/components/homepage/sections/TargetAudience";
import TestimonialsSection from "@/components/homepage/sections/TestimonialsSection";
import NewsletterSignup from "@/components/homepage/sections/NewsletterSignup";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const now = new Date();
  const initialSlides = await prisma.carousel.findMany({
    where: {
      isActive: true,
      type: "homepage",
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { sortOrder: "asc" },
    select: { id: true, title: true, description: true, imageUrl: true, link: true, sortOrder: true },
  });
  return (
    <>
      <main className="pt-32 md:pt-28">
        {/* Hero */}
        <HeroCarousel initialSlides={initialSlides} />

        {/* Sections */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <BestSellers />
        </div>

        <HowItWorks />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <TargetAudience />
        </div>

        <TestimonialsSection />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <NewsletterSignup />
        </div>
      </main>
    </>
  );
}
