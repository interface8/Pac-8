"use client"

import React from "react";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { Product } from "@/types/products";
import { useDispatch } from "react-redux";
import { addItem } from "@/store/cartSlice";
import { toast } from "react-toastify";

type Props = {
  product: Product;
};

const ProductCard = ({ product }: Props) => {
  // Category logic
  const capacityCategories = [
    "battery",
    "batteries",
    "accessory",
    "accessories",
  ];
  const powerCategories = ["panel", "inverter"];

  const category = product.category?.toLowerCase() ?? "";

  const isCapacity = capacityCategories.includes(category);
  const isPower = powerCategories.includes(category);

  let specLabel = "";
  let specValue = "";

  if (isCapacity && product.capacity) {
    specLabel = "Capacity";
    specValue = product.capacity;
  } else if (isPower && product.power) {
    specLabel = "Power";
    specValue = product.power;
  }
 
  const dispatch = useDispatch();
  const handleAddToCart = () => {
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: 1,
      }),
    );

    toast.success("Product added to cart")
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col h-full">
      {/* Image */}
      <div className="relative w-full aspect-4/3 sm:aspect-video">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Badge (like Figma) */}
        <span className="inline-block bg-green-700 text-white text-[10px] px-2 py-1 rounded-md font-medium w-fit">
          {product.category || "Panel"}
        </span>

        {/* Title */}
        <h3 className="text-[15px] mt-2 font-semibold text-gray-800 leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">
          {product.description}
        </p>

        {/* Specs */}
        <div className="text-[11px] text-gray-500 mt-2 space-y-1">
          {specValue && (
            <p>
              {specLabel}: {specValue}
            </p>
          )}
          {product.warranty && <p>Warranty: {product.warranty}</p>}
        </div>

        {/* Push bottom content down */}
        <div className="flex-1" />

        {/* Price & Stock */}
        <div className="flex justify-between items-center mt-3">
          <p className="text-lg font-bold text-orange-500">
            ₦{product.price.toLocaleString()}
          </p>
          <p className="text-[12px] text-gray-400">Stock: {product.stock}</p>
        </div>

        {/* Button */}
        <button onClick={handleAddToCart} className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 mt-3 transition">
          <ShoppingCart size={16} />
          Add to Cart
        </button>

        {/* Bottom spacing like Figma */}
        <div className="mt-2" />
      </div>
    </div>
  );
};

export default ProductCard;
