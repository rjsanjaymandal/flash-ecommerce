"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeToNewsletter } from "@/app/actions/marketing-actions";
import { toast } from "sonner";
import { Send } from "lucide-react";
import FlashImage from "@/components/ui/flash-image";

export function NewsletterSection() {
  async function action(formData: FormData) {
    const res = await subscribeToNewsletter(formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      if (res?.message) {
        toast.info(res.message);
      } else {
        toast.success("Subscribed successfully!");
      }
    }
  }

  return (
    <section className="relative overflow-hidden bg-muted/20 py-16 sm:py-24 border-t border-border/40">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-background border border-foreground/5 rounded-none shadow-sm overflow-hidden md:grid md:grid-cols-2 md:items-center relative group">
          <div className="p-8 sm:p-12 lg:p-16 relative z-10">
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-2xl sm:text-4xl font-serif text-foreground leading-tight">
                Join the <br />
                <span className="opacity-50 italic">Inner Circle</span>
              </h2>

              <p className="mt-4 text-muted-foreground leading-relaxed font-serif text-[15px]">
                Join our community to get early access to new collections,
                secret sales, and style tips.
              </p>

              <form action={action} className="mt-8">
                <div className="relative flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <label htmlFor="email" className="sr-only">
                      {" "}
                      Email Address{" "}
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="email"
                      placeholder="EMAIL ADDRESS"
                      required
                      className="h-14 w-full rounded-none border-foreground/10 bg-transparent px-6 text-[11px] tracking-widest transition-colors focus:border-foreground/30 focus:ring-0"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-14 group rounded-none bg-foreground text-background px-8 text-[10px] font-medium uppercase tracking-[0.3em] transition hover:opacity-90 shadow-none"
                  >
                    <span className="mr-2">Join The List</span>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/2 bg-muted overflow-hidden">
            <FlashImage
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Newsletter exclusive"
              fill
              className="object-cover opacity-90 transition hover:opacity-100 duration-700 mix-blend-overlay grayscale group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-card via-card/20 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
