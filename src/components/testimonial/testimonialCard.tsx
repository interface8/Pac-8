import { Card, CardContent, CardFooter } from "../ui/card";
import Image from "next/image";
import { Quote } from "lucide-react";

interface TestimonialCardProps {
  rating: string;
  quote: string;
  name: string;
  role: string;
  location: string;
  system: string;
  savings: string;
  image: string;
}

export default function TestimonialCard({
  rating,
  quote,
  name,
  role,
  location,
  system,
  savings,
  image,
}: TestimonialCardProps) {
  return (
    <Card
      className="hover:shadow-xl transition-all duration-300 border border-[#F05700]/20 px-8 mx-2 bg-white"
     
    >
      <CardContent className="pt-6 ">
        <div className="text-yellow-500 text-4xl flex items-center  mb-3">
          <span className="text-orange-200 font-bold text-8xl">
            <Quote />
          </span>
          {rating}
        </div>

        <p className="text-gray-500 font-normal mb-4 text-2xl pt-16 pb-12">
          {quote}
        </p>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-18 h-18 rounded-full overflow-hidden shrink-0 mb-4">
            <Image
              src={image}
              alt={name}
              width={50}
              height={50}
              className="object-cover w-full h-full"
            />
          </div>

          <div>
            <h4 className="font-semibold text-2xl text-gray-900">{name}</h4>
            <p className="text-lg text-gray-600">{role}</p>
            <p className="text-base text-gray-500">{location}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4 flex-col items-start gap-2 mt-4 mb-16 ">
        <p className="text-lg font-bold flex flex-row items-center justify-between w-full">
          <span className="font-medium text-gray-400">System:</span>
          <div>{system}</div>
        </p>
        <p className="text-lg font-bold text-green-600 flex flex-row items-center justify-between w-full">
          <span className="font-medium text-gray-400">Annual Savings:</span>
          <div>{savings}</div>
        </p>
      </CardFooter>
    </Card>
  );
}
