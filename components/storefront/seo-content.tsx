import React from "react";
import { Zap, ShieldCheck, Printer } from "lucide-react";

export function SeoContent() {
  return (
    <section className="py-16 bg-zinc-50/50 border-y border-zinc-100 dark:bg-zinc-900/20 dark:border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <h2 className="text-3xl font-serif text-foreground leading-tight lowercase">
            why flash is the best choice for quality clothing in india
          </h2>
          <p className="text-muted-foreground font-serif leading-relaxed text-[15px]">
            Discover why rebels and trendsetters choose **Flash** for premium
            quality and minimalist aesthetic.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-background p-8 rounded-none border border-foreground/5 shadow-none transition-colors hover:border-foreground/10">
            <div className="h-10 w-10 flex items-center justify-center mb-6 text-foreground/40 border border-foreground/10">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-medium uppercase tracking-[0.3em] mb-4">
              Premium Quality
            </h3>
            <p className="text-[13px] font-serif text-muted-foreground leading-relaxed">
              We don&apos;t compromise. Our fabrics are engineered for
              durability, comfort, and style, setting a new standard for luxury
              streetwear.
            </p>
          </div>

          <div className="bg-background p-8 rounded-none border border-foreground/5 shadow-none transition-colors hover:border-foreground/10">
            <div className="h-10 w-10 flex items-center justify-center mb-6 text-foreground/40 border border-foreground/10">
              <Printer className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-medium uppercase tracking-[0.3em] mb-4">
              Artistic Prints
            </h3>
            <p className="text-[13px] font-serif text-muted-foreground leading-relaxed">
              Express yourself with our exclusive prints. High-definition
              details that never fade, featuring cinematic aesthetics.
            </p>
          </div>

          <div className="bg-background p-8 rounded-none border border-foreground/5 shadow-none transition-colors hover:border-foreground/10">
            <div className="h-10 w-10 flex items-center justify-center mb-6 text-foreground/40 border border-foreground/10">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-medium uppercase tracking-[0.3em] mb-4">
              The Flash Movement
            </h3>
            <p className="text-[13px] font-serif text-muted-foreground leading-relaxed">
              More than just a label, we are a movement. Minimalist, inclusive,
              and futuristic. Experience the Flash community today.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
