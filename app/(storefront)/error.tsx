"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20 relative">
            <div className="absolute inset-0 rounded-full border border-destructive/10 animate-ping" />
            <RefreshCcw className="h-10 w-10 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">
            System Flicker
          </h1>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed">
            We encountered a temporary connection issue. Your experience is our
            priority—let's get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            onClick={() => reset()}
            className="rounded-none uppercase tracking-widest font-black h-12 px-8 w-full sm:w-auto"
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            asChild
            className="rounded-none uppercase tracking-widest font-black h-12 px-8 w-full sm:w-auto"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
