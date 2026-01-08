"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Truck, RefreshCcw } from "lucide-react";

interface ProductDescriptionAccordionProps {
  description: string;
}

export function ProductDescriptionAccordion({
  description,
}: ProductDescriptionAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="details" className="border-border/60">
        <AccordionTrigger className="uppercase text-[11px] font-black tracking-widest text-muted-foreground hover:text-foreground">
          Product Description
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground leading-relaxed">
          <div
            className="prose prose-sm prose-stone max-w-none text-sm text-foreground/80 font-medium"
            dangerouslySetInnerHTML={{
              __html: description || "No description available.",
            }}
          />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="shipping" className="border-border/60">
        <AccordionTrigger className="uppercase text-[11px] font-black tracking-widest text-muted-foreground hover:text-foreground">
          Shipping Info
        </AccordionTrigger>
        <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            <span>Free shipping on orders over ₹2000</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4 text-primary" />
            <span>14-day easy returns policy</span>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
