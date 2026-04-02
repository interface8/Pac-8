import { CarouselClient } from "./carousel-client";

export default function CarouselPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Carousel Slides</h1>
        <p className="text-muted-foreground">
          Manage hero banners and promotional slides displayed on the storefront.
        </p>
      </div>
      <CarouselClient />
    </div>
  );
}
