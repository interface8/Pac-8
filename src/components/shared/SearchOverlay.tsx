"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery("");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl mt-[15vh] mx-4 animate-in slide-in-from-top-4 duration-200">
        <form onSubmit={submit} className="relative">
          <Search
            size={20}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for packaging products..."
            className="w-full h-14 pl-14 pr-14 bg-card rounded-2xl text-base shadow-2xl ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => {
              onClose();
              setQuery("");
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-lg transition"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </form>
        <p className="text-center text-xs text-white/60 mt-4">
          Press Enter to search &middot; Esc to close
        </p>
      </div>
      <div
        className="absolute inset-0 -z-10"
        onClick={() => {
          onClose();
          setQuery("");
        }}
      />
    </div>
  );
}
