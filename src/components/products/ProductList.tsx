import React from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/types/products";

const products: Product[] = [
  {
    id: "1",
    name: "Monocrystalline Solar Panel 300W",
    image: "/images/product-1.jpg",
    price: 45000,
    stock: 50,
    description:
      "High-efficiency monocrystalline solar panel with excellent low-light performance",
    category: "Panel",
    power: "300W",
    warranty: "25 years",
  },
  {
    id: "2",
    name: "Monocrystalline Solar Panel 350W",
    image: "/images/product-2.jpg",
    price: 52000,
    stock: 40,
    description: "Premium monocrystalline panel with higher efficiency rating",
    category: "Panel",
    power: "350W",
    warranty: "25 years",
  },
  {
    id: "3",
    name: "Polycrystalline Solar Panel 250W",
    image: "/images/product-3.jpg",
    price: 35000,
    stock: 60,
    description:
      "Cost-effective polycrystalline panel for budget-conscious buyers",
    category: "Panel",
    power: "250W",
    warranty: "20 years",
  },
  {
    id: "4",
    name: "Pure Sine Wave Inverter 1000W",
    image: "/images/product-4.jpg",
    price: 65000,
    stock: 30,
    description: "Compact inverter suitable for small home applications",
    category: "inverter",
    power: "1000W",
    warranty: "2 years",
  },
  {
    id: "5",
    name: "Pure Sine Wave Inverter 2000W",
    image: "/images/product-5.jpg",
    price: 95000,
    stock: 25,
    description: "Mid-range inverter for medium-sized homes",
    category: "inverter",
    power: "2000W",
    warranty: "2 years",
  },
  {
    id: "6",
    name: "Pure Sine Wave Inverter 3500W",
    image: "/images/product-6.jpg",
    price: 145000,
    stock: 20,
    description: "Heavy-duty inverter for larger homes and offices",
    category: "inverter",
    power: "3500W",
    warranty: "3 years",
  },
  {
    id: "7",
    name: "Hybrid Inverter 5000W",
    image: "/images/product-7.jpg",
    price: 220000,
    stock: 15,
    description:
      "Premium hybrid inverter with grid-tie capability and smart features",
    category: "Inverter",
    power: "5000W",
    warranty: "5 years",
  },
  {
    id: "8",
    name: "Deep Cycle Battery 100Ah",
    image: "/images/product-8.jpg",
    price: 55000,
    stock: 35,
    description: "Reliable deep cycle battery for solar energy storage",
    category: "Battery",
    capacity: "100Ah",
    warranty: "1 year",
  },
  {
    id: "9",
    name: "Deep Cycle Battery 150Ah",
    image: "/images/product-9.jpg",
    price: 78000,
    stock: 30,
    description: "Higher capacity battery for extended backup time",
    category: "Battery",
    capacity: "100Ah",
    warranty: "1 year",
  },
  {
    id: "10",
    name: "Tubular Battery 200Ah",
    image: "/images/product-10.png",
    price: 105000,
    stock: 25,
    description: "Long-lasting tubular battery with excellent cycle life",
    category: "Battery",
    capacity: "200Ah",
    warranty: "2 years",
  },
  {
    id: "11",
    name: "Lithium LiFePO4 Battery 100Ah",
    image: "/images/product-15.jpg",
    price: 185000,
    stock: 15,
    description:
      "Premium lithium battery with superior performance and longevity",
    category: "Battery",
    capacity: "100Ah",
    warranty: "5 years",
  },
  {
    id: "12",
    name: "MPPT Charge Controller 30A",
    image: "/images/product-11.jpg",
    price: 28000,
    stock: 40,
    description:
      "Maximum Power Point Tracking charge controller for optimal efficiency",
    category: "Accessory",
    capacity: "30A",
    warranty: "2 years",
  },
  {
    id: "13",
    name: "MPPT Charge Controller 60A",
    image: "/images/product-12.jpg",
    price: 48000,
    stock: 30,
    description: "High-capacity MPPT controller for larger solar arrays",
    category: "Accessory",
    capacity: "60A",
    warranty: "3 years",
  },
  {
    id: "14",
    name: "Solar Panel Mounting Kit",
    image: "/images/product-13.jpg",
    price: 15000,
    stock: 50,
    description: "Complete mounting hardware for secure panel installation",
    category: "Accessory",
    power: "",
    warranty: "5 years",
  },
  {
    id: "15",
    name: "Solar Cable Set 10m",
    image: "/images/product-14.png",
    price: 8000,
    stock: 60,
    description: "UV-resistant solar cables with MC4 connectors",
    category: "Accessory",
    capacity: "4mm²",
    warranty: "1 year",
  },
];

const ProductList = () => {
  return (
    <div className="p-4">
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="transform transition-transform duration-300 hover:scale-105"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
