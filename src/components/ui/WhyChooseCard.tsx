import React from "react";

type Props = {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
};

const WhyChooseCard = ({ title, description, icon: Icon, color }: Props) => {
  return (
    <div className="bg-white rounded-xl h-75 p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.03] border border-orange-100">
      <div
        className={`w-15 h-15 flex items-center justify-center rounded-lg text-white ${color} shadow-xl`}
      >
        <Icon size={30} />
      </div>

      <h3 className="mt-8 text-lg text-left font-semibold text-black">
        {title}
      </h3>

      <p className="mt-4 text-base text-left text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default WhyChooseCard;
