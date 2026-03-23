import ProductHero from "@/components/products/ProductHero";
import ProductList from "@/components/products/ProductList";
import ProductNavbar from "@/components/products/ProductNavbar";
import ProductSearch from "@/components/products/ProductSearch";
import React from "react";

const page = () => {
  return (
    <div className="pt-16">
      <ProductNavbar />
      <ProductHero />
      <ProductSearch />
      <ProductList />
    </div>
  );
};

export default page;
