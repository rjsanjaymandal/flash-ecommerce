import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BrandGlow } from "@/components/storefront/brand-glow";

const faqData = [
  {
    question: "What is Flashh?",
    answer:
      "Flashh fashion is a gender-neutral clothing platform that promotes inclusivity, diversity & basically LETS YOU, BE YOU.",
  },
  {
    question: "What do you sell here?",
    answer: "What fits your vibe, gives you comfort, love & style.",
  },
  {
    question: "What is your poll and create session thingy?",
    answer:
      "We upload designs of a few products & let the community answer. Their vote means love and dislike means doing good but we can be more better.",
  },
  {
    question: "Why only prepaid and no COD?",
    answer:
      "We prioritize security to avoid scams. We are NOT talking about our lovely community (they are FAB) but keeping the platform safe for everyone.",
  },
  {
    question: "What about your delivery period?",
    answer:
      "We try to be quick like sonic. But due to uncertainty, standard delivery is 7-14 days.",
  },
  {
    question: "What are your return policies?",
    answer:
      "Record a video before opening the parcel. If you are not sure about size and fit, then record another video of packing the parcel properly with our product. Once the product reaches us, we do our inspection and very soon refund your amount.",
  },
];

import { FAQJsonLd } from "@/components/seo/faq-json-ld";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | FLASH | Everything You Need to Know",
  description:
    "Questions about your FLASH order, shipping, returns, or our mission? Find all the answers in our comprehensive FAQ.",
  alternates: {
    canonical: "https://flashhfashion.in/faq",
  },
};

export default function FAQPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 relative overflow-hidden">
      <BreadcrumbJsonLd
        items={[
          {
            name: "Home",
            item:
              process.env.NEXT_PUBLIC_SITE_URL || "https://flashhfashion.in",
          },
          {
            name: "FAQ",
            item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://flashhfashion.in"}/faq`,
          },
        ]}
      />
      <FAQJsonLd questions={faqData} />
      <BrandGlow className="top-20 opacity-30" />

      <div className="container mx-auto px-4 relative z-10 max-w-3xl">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-linear-to-r from-zinc-900 via-zinc-600 to-zinc-900">
            The Lowdown
          </h1>
          <p className="text-lg md:text-xl font-medium text-zinc-500 max-w-xl mx-auto">
            Everything you need to know about the Flash vibe.
          </p>
        </div>

        <div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-2xl p-6 md:p-10">
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger className="hover:no-underline hover:bg-zinc-50 px-6 rounded-2xl data-[state=open]:bg-zinc-50 transition-colors [&[data-state=open]>div]:text-primary">
                <div className="text-left font-black text-lg md:text-xl uppercase tracking-tight italic">
                  What is Flashh?
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 text-base md:text-lg text-zinc-600 font-medium leading-relaxed">
                Flashh fashion is a gender-neutral clothing platform that
                promotes inclusivity, diversity & basically{" "}
                <span className="text-zinc-900 font-black italic">
                  LETS YOU, BE YOU
                </span>
                .
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-b-0">
              <AccordionTrigger className="hover:no-underline hover:bg-zinc-50 px-6 rounded-2xl data-[state=open]:bg-zinc-50 transition-colors [&[data-state=open]>div]:text-primary">
                <div className="text-left font-black text-lg md:text-xl uppercase tracking-tight italic">
                  What do you sell here?
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 text-base md:text-lg text-zinc-600 font-medium leading-relaxed">
                What fits your vibe, gives you comfort, love & style.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-b-0">
              <AccordionTrigger className="hover:no-underline hover:bg-zinc-50 px-6 rounded-2xl data-[state=open]:bg-zinc-50 transition-colors [&[data-state=open]>div]:text-primary">
                <div className="text-left font-black text-lg md:text-xl uppercase tracking-tight italic">
                  What is your poll and create session thingy?
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 text-base md:text-lg text-zinc-600 font-medium leading-relaxed">
                Umm, we upload designs of a few products & let the community
                answer. Their vote means love and dislike means doing good but
                we can be <span className="italic">more better</span>.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-b-0">
              <AccordionTrigger className="hover:no-underline hover:bg-zinc-50 px-6 rounded-2xl data-[state=open]:bg-zinc-50 transition-colors [&[data-state=open]>div]:text-primary">
                <div className="text-left font-black text-lg md:text-xl uppercase tracking-tight italic">
                  Why only prepaid and no COD?
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 text-base md:text-lg text-zinc-600 font-medium leading-relaxed">
                Ab kya btau yarrr, you know about scamsters right?{" "}
                <span className="font-bold text-red-500">NO NO NO</span> we are
                NOT talking about our lovely community (they are FAB) but
                scamsters ki fitrat 😤
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-b-0">
              <AccordionTrigger className="hover:no-underline hover:bg-zinc-50 px-6 rounded-2xl data-[state=open]:bg-zinc-50 transition-colors [&[data-state=open]>div]:text-primary">
                <div className="text-left font-black text-lg md:text-xl uppercase tracking-tight italic">
                  What about your delivery period?
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 text-base md:text-lg text-zinc-600 font-medium leading-relaxed">
                Will try to be quick with the delivery like{" "}
                <span className="text-yellow-500 font-black italic">
                  sssoooniiccc⚡️
                </span>
                . But uncertainty ke chalte 7-14 days.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border-b-0">
              <AccordionTrigger className="hover:no-underline hover:bg-zinc-50 px-6 rounded-2xl data-[state=open]:bg-zinc-50 transition-colors [&[data-state=open]>div]:text-primary">
                <div className="text-left font-black text-lg md:text-xl uppercase tracking-tight italic">
                  What are your return policies?
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 text-base md:text-lg text-zinc-600 font-medium leading-relaxed">
                Very simple: record a video before opening the parcel. If you
                are not sure about size and fit, then record another video of
                packing the parcel properly with our product. Once the product
                reaches us, we do our inspection and very soon refund your
                amount.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
