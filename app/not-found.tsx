import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <div className="space-y-8 max-w-2xl relative">
        {/* Background Decorative Element */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 text-[20vw] font-black text-foreground/5 select-none pointer-events-none z-0 italic uppercase">
          Lost
        </div>

        <div className="relative z-10 space-y-4">
          <span className="inline-block bg-primary px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-[0.3em] text-primary-foreground mb-4">
            Error 404
          </span>

          <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.85]">
            Artifact <br /> Not Found
          </h1>

          <p className="text-muted-foreground text-lg font-medium max-w-lg mx-auto leading-relaxed">
            The page you're looking for has either been moved, deleted, or never
            existed in this dimension.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
          <Button
            asChild
            size="lg"
            className="rounded-none uppercase tracking-widest font-black h-16 px-12 text-lg shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(var(--primary),0.3)] transition-all"
          >
            <Link href="/shop">
              Shop All Products
              <ShoppingBag className="ml-3 h-5 w-5" />
            </Link>
          </Button>

          <Link
            href="/"
            className="group flex items-center text-sm font-black uppercase tracking-widest hover:text-primary transition-colors"
          >
            Back to Home
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
