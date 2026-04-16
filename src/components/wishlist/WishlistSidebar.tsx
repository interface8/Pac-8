"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingBag, Package } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useWishlist, type WishlistItem } from "@/hooks/use-wishlist";
import { useDispatch } from "react-redux";
import { addItem } from "@/store/cartSlice";
import { toast } from "sonner";

interface WishlistSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WishlistSidebar({
  open,
  onOpenChange,
}: WishlistSidebarProps) {
  const { items, loading, remove } = useWishlist();
  const dispatch = useDispatch();

  const handleAddToCart = (item: WishlistItem) => {
    dispatch(
      addItem({
        id: item.productId,
        name: item.productName,
        price: item.productPrice,
        image: item.productImage ?? "",
        quantity: 1,
      })
    );
    toast.success(`${item.productName} added to cart`);
  };

  const handleRemove = (item: WishlistItem) => {
    remove(item.id);
    toast.success(`Removed from wishlist`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Heart size={18} className="text-primary" />
            Wishlist
            {items.length > 0 && (
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Your saved wishlist items
          </SheetDescription>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex gap-3 animate-pulse"
                >
                  <div className="w-20 h-20 bg-muted rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Heart size={28} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Your wishlist is empty
              </p>
              <p className="text-xs text-muted-foreground mb-5">
                Save items you love by tapping the heart icon
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                asChild
              >
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 p-4 group">
                  {/* Product image */}
                  <Link
                    href={`/products/${item.productSlug}`}
                    onClick={() => onOpenChange(false)}
                    className="relative w-20 h-20 bg-muted rounded-xl overflow-hidden shrink-0"
                  >
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package
                          size={24}
                          className="text-muted-foreground/40"
                        />
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.productSlug}`}
                      onClick={() => onOpenChange(false)}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.productName}
                    </Link>

                    <p className="text-sm font-semibold text-primary mt-1">
                      ₦{item.productPrice.toLocaleString()}
                    </p>

                    {!item.productInStock && (
                      <p className="text-[11px] text-destructive mt-0.5">
                        Out of stock
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2.5"
                        disabled={!item.productInStock}
                        onClick={() => handleAddToCart(item)}
                      >
                        <ShoppingBag size={12} className="mr-1" />
                        Add to cart
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(item)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-4">
            <Button
              className="w-full"
              size="sm"
              onClick={() => onOpenChange(false)}
              asChild
            >
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
