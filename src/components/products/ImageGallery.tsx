"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  altText: string | null;
  isMain: boolean;
  sortOrder: number;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  productName: string;
  discountPercent?: number;
}

export default function ImageGallery({
  images,
  productName,
  discountPercent = 0,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const selectedImage = images[selectedIndex] ?? images[0];

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!imageContainerRef.current) return;
      const rect = imageContainerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
    },
    []
  );

  const goToImage = (index: number) => {
    setSelectedIndex(index);
    setIsZoomed(false);
  };

  const goNext = () => goToImage((selectedIndex + 1) % images.length);
  const goPrev = () =>
    goToImage((selectedIndex - 1 + images.length) % images.length);

  return (
    <div className="space-y-4">
      {/* Main image with zoom */}
      <div
        ref={imageContainerRef}
        className="relative aspect-square bg-card rounded-2xl border border-border overflow-hidden shadow-sm group cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <Image
          src={selectedImage.url}
          alt={selectedImage.altText ?? productName}
          fill
          className={`object-contain p-6 transition-transform duration-200 ${
            isZoomed ? "scale-[2.5]" : "scale-100"
          }`}
          style={
            isZoomed
              ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }
              : undefined
          }
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        {/* Discount badge */}
        {discountPercent > 0 && (
          <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10">
            -{discountPercent}%
          </span>
        )}

        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 bg-card/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <ZoomIn size={14} />
          Hover to zoom
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm shadow-md flex items-center justify-center text-foreground hover:bg-card transition opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm shadow-md flex items-center justify-center text-foreground hover:bg-card transition opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => goToImage(idx)}
              className={`relative w-20 h-20 rounded-xl border-2 overflow-hidden shrink-0 transition ${
                idx === selectedIndex
                  ? "border-primary shadow-md ring-2 ring-primary/20"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${productName} ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen lightbox */}
      {/* Triggered by clicking the zoom indicator area — future enhancement */}
    </div>
  );
}
