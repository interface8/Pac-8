import React from "react";
import { LucideIcon } from "lucide-react";

interface TimelineStepProps {
  number: string;
  icon: LucideIcon;
  color: string;
  title: string;
  description: string;
  isEven?: boolean;
}

export default function TimelineStep({
  number,
  icon: Icon,
  color,
  title,
  description,
  isEven = false,
}: TimelineStepProps) {
  return (
    <div
      className={`
        relative flex flex-col sm:flex-row items-start sm:items-center
        ${isEven ? "sm:justify-start" : "sm:justify-end sm:pl-0 sm:pr-0"}
        group
      `}
    >
      {/* Step number circle */}
      <div
        className={`
          shrink-0 z-10 flex items-center justify-center
          w-14 h-14 sm:w-16 sm:h-16
          rounded-full ${color} text-white
          font-semibold text-2xl sm:text-3xl shadow-xl
          ring-8 ring-orange-100
          transition-all duration-300 group-hover:ring-orange-200 group-hover:scale-110
        `}
      >
        {number}
      </div>

      {/* Content card */}
      <div
        className={`
          mt-4 sm:mt-0
          bg-white rounded-2xl sm:rounded-3xl
          shadow-lg border border-orange-200
          p-6 sm:p-8
          w-full sm:w-5/12 lg:w-5/12
          transition-all duration-300
          group-hover:shadow-2xl group-hover:-translate-y-1
          ${isEven ? "sm:ml-8 lg:ml-12" : "sm:mr-8 lg:mr-12 sm:text-right"}
        `}
      >
        <div className="flex items-center gap-4 mb-4 sm:mb-5">
          <div
            className={`
              flex items-center justify-center
              w-12 h-12 rounded-full ${color}
            `}
          >
            <Icon className="w-6 h-6 text-orange-100" />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
            {title}
          </h3>
        </div>

        <p className="text-left text-gray-600 text-base sm:text-lg leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
