import React from "react";
import { Zap, ShieldCheck, Printer } from "lucide-react";

export function SeoContent() {
  return (
    <section className="py-16 bg-zinc-50/50 border-y border-zinc-100 dark:bg-zinc-900/20 dark:border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">
            Why Flash Fashion is the Best Clothing Brand in India
          </h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            Discover why thousands of rebels and trendsetters choose Flash
            Fashion as their go-to destination for the **best quality clothing**
            and **printed t-shirts**.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-background p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4 text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight mb-2">
              Best Quality Clothing
            </h3>
            <p className="text-sm text-muted-foreground">
              We don't compromise. Our intelligent nano-fabrics are engineered
              for durability, comfort, and style, setting a new standard for a
              **premium clothing brand**.
            </p>
          </div>

          <div className="bg-background p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center mb-4 text-violet-600">
              <Printer className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight mb-2">
              Premium Printed T-Shirts
            </h3>
            <p className="text-sm text-muted-foreground">
              Express yourself with our exclusive **printed t-shirts**.
              High-definition prints that never fade, featuring cyberpunk and
              anime aesthetics you won't find anywhere else.
            </p>
          </div>

          <div className="bg-background p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight mb-2">
              Flash Fashion Revolution
            </h3>
            <p className="text-sm text-muted-foreground">
              More than just a **clothing brand**, we are a movement.
              Gender-neutral, inclusive, and futuristic. Join the **Flash
              Fashion** community today.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
