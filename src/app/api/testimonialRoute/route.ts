import { NextResponse } from "next/server";


export async function GET(){
     const testimonials = [
    {
      rating: "★☆☆☆",
      quote:
        "Power-8's pay-small-small option was a game changer for my business. I installed a 5kW system and my electricity costs dropped by 80%. The customer service is exceptional!",
      name: "Chidi Okafor",
      role: "Small Business Owner",
      location: "Lagos, Nigeria",
      system: "5kW Premium System",
      savings: "N450,000/year",
      image: "/images/download.jpg"
    },
    {
      rating: "★★★★☆",
      quote:
        "I was skeptical at first, but the OCR calculator helped me understand exactly what I needed. The installation was professional and the payment plan fits perfectly into my budget. No more generator noise!",
      name: "Amaka Nwosu",
      role: "Homeowner",
      location: "Abuja, Nigeria",
      system: "3kW Optimized System",
      savings: "N280,000/year",
      image: "/images/images-removebg-preview.png"

    },
    {
      rating: "★★★★★",
      quote:
        "Running a restaurant requires constant power. Power-8 delivered a reliable solar system that keeps my freezers and AC running 24/7. Best investment I've made!",
      name: "Tunde Adebayo",
      role: "Restaurant Owner",
      location: "Port Harcourt, Nigeria",
      system: "10kW Premium System",
      savings: "N850,000/year",
      image: "/images/images-removebg-preview.png"

    },
    {
      rating: "★★★★☆",
      quote:
        "The installation team was professional and completed everything in one day. My home has had zero power outages since going solar. Highly recommended!",
      name: "Blessing Eze",
      role: "Teacher",
      location: "Enugu, Nigeria",
      system: "4kW Premium System",
      savings: "N320,000/year",
      image: '/images/images.png'

    },
    {
      rating: "★★★★★",
      quote:
        "As a farmer, I need reliable power for my irrigation pumps. Power-8 delivered beyond my expectations. My yields have increased significantly.",
      name: "Musa Ibrahim",
      role: "Farmer",
      location: "Kaduna, Nigeria",
      system: "7.5kW Premium System",
      savings: "N520,000/year",
      image: "/images/images-removebg-preview.png"

    },
    {
      rating: "★★★★☆",
      quote:
        "I love tracking my savings through the dashboard. The system paid for itself in just 2 years. Now I'm enjoying free electricity!",
      name: "Yetunde Adeleke",
      role: "Banker",
      location: "Ibadan, Nigeria",
      system: "5kW Optimized System",
      savings: "N380,000/year",
      image: "/images/images-removebg-preview.png"

    },
  ];
  return NextResponse.json(testimonials)
}