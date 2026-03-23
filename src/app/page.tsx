import Navbar from "@/components/homepage/navbar/Navbar";
import Hero from "@/components/homepage/hero/Hero";
import WhyChooseUs from "@/components/homepage/whychooseus/WhyChooseUs";
import Footer from "@/components/homepage/footer/Footer";
import HowItWorks from "@/components/homepage/howitworks/HowItWorks";
import TestimonialPrev from "@/components/homepage/TestimonialPreview/TestimonialPrev";
import CTA from "@/components/homepage/CTA/CTA";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <WhyChooseUs />
      <HowItWorks />
      <TestimonialPrev />
      <CTA />
      <Footer />
    </>
  );
}
