
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQPage() {
    return (
        <div className="container mx-auto px-4 py-20 lg:py-32 max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight mb-4 text-center">Frequently Asked Questions</h1>
            <p className="text-muted-foreground text-center mb-12">
                Everything you need to know about shopping with Flash.
            </p>

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>How long does shipping take?</AccordionTrigger>
                    <AccordionContent>
                        We process orders within 24 hours. Domestic shipping typically takes 3-5 business days.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>What is your return policy?</AccordionTrigger>
                    <AccordionContent>
                        We accept returns within 14 days of delivery. Items must be unworn and in original packaging.
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-3">
                    <AccordionTrigger>Do you ship internationally?</AccordionTrigger>
                    <AccordionContent>
                        Yes, we ship to select countries worldwide. Shipping rates are calculated at checkout.
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-4">
                    <AccordionTrigger>How can I track my order?</AccordionTrigger>
                    <AccordionContent>
                        Once your order ships, you will receive a tracking link via email.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
