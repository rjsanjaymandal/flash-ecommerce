"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function GlobalLoader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lock scroll when loader is active
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center scale-110">
        {/* Outer Ring */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        {/* Inner Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* The 'F' the user likes */}
          <span className="font-black italic text-lg tracking-tighter text-foreground">
            F
          </span>
        </div>
      </div>
      <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
        Loading Experience
      </p>
    </div>,
    document.body
  );
}
