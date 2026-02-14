import { RotateCcw, ShieldCheck, Clock, Package } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return Policy | FLASH",
  description:
    "Learn about FLASH's return and exchange policies. We offer a 14-day return window for items in original condition. Quality and satisfaction guaranteed.",
  alternates: {
    canonical: "https://flashhfashion.in/returns",
  },
};

export default function ReturnPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-20 lg:py-32 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-8">
        Return <span className="text-primary italic">Policy</span>
      </h1>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="p-6 rounded-2xl border bg-muted/20 flex flex-col items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">14-Day Return Window</h3>
            <p className="text-muted-foreground text-sm">
              Return any eligible item within 14 days of delivery for a full
              refund or exchange.
            </p>
          </div>
        </div>
        <div className="p-6 rounded-2xl border bg-muted/20 flex flex-col items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Easy Exchanges</h3>
            <p className="text-muted-foreground text-sm">
              Swap for a different size or color easily. We'll handle the
              logistics.
            </p>
          </div>
        </div>
      </div>

      <div className="prose prose-neutral dark:prose-invert text-muted-foreground max-w-none">
        <section>
          <h2 className="text-foreground text-2xl font-bold mb-4 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Our Quality Commitment
          </h2>
          <p>
            At FLASH, we stand by the quality of our premium streetwear. If you
            are not completely satisfied with your purchase, we are here to help
            with a straightforward return and exchange process.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-foreground text-2xl font-bold mb-4">
            Return Conditions
          </h2>
          <p>
            To be eligible for a return or exchange, items must meets the
            following criteria:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Items must be in their original, unworn, and unwashed condition.
            </li>
            <li>All original tags, packaging, and labels must be attached.</li>
            <li>
              No signs of wear, stains (including makeup or deodorant), or
              odors.
            </li>
            <li>
              Discounted or "Final Sale" items are not eligible for returns.
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-foreground text-2xl font-bold mb-4 flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            How to Return
          </h2>
          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <strong>Initiate:</strong> Log in to your account and go to "My
              Orders" to select the items you wish to return. Alternatively,
              contact our support team with your order number.
            </li>
            <li>
              <strong>Pack:</strong> Securely pack the items in their original
              packaging.
            </li>
            <li>
              <strong>Ship:</strong> We will provide a pre-paid return label
              (for domestic orders) or instructions for shipping the item back
              to us.
            </li>
            <li>
              <strong>Inspect & Refund:</strong> Once we receive and inspect the
              item (usually within 3-5 business days), we will process your
              refund to the original payment method.
            </li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-foreground text-2xl font-bold mb-4">Refunds</h2>
          <p>
            Approved refunds are typically processed within 5-7 business days
            after inspection. Please note that it may take an additional few
            days for the credit to appear on your bank statement depending on
            votre financial institution.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-border/50 text-sm italic">
          Last updated: February 14, 2026. For further assistance, please
          contact our support team at{" "}
          <span className="text-primary">support@flashhfashion.in</span>
        </div>
      </div>
    </div>
  );
}
