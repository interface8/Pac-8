import React from "react";

export default function ProductHero() {
  return (
    <div className="bg-linear-to-r from-orange-500 to-amber-300 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold">Solar products</h1>
        <p className="mt-2 text-sm md:text-lg opacity-90">
          Find everything you need for your solar installation
        </p>
      </div>
    </div>
  );
}
