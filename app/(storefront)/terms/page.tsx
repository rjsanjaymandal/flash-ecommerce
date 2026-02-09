import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | FLASH",
  description: "Operating guidelines and legal terms for shopping at FLASH.",
  alternates: {
    canonical: "https://flashhfashion.in/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-20 px-4 md:px-8">
      <article className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-8">
          Terms & <span className="text-primary italic">Conditions</span>
        </h1>

        <p className="lead text-muted-foreground">
          Welcome to FLASH. These terms and conditions outline the rules and
          regulations for the use of our website and services.
        </p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            By accessing this website, we assume you accept these terms and
            conditions in full. Do not continue to use FLASH&apos;s website if
            you do not accept all of the terms and conditions stated on this
            page.
          </p>
        </section>

        <section>
          <h2>2. Intellectual Property Rights</h2>
          <p>
            Unless otherwise stated, FLASH and/or its licensors own the
            intellectual property rights for all material on FLASH. All
            intellectual property rights are reserved. You may view and/or print
            pages from https://flashhfashion.in for your own personal use
            subject to restrictions set in these terms and conditions.
          </p>
          <p>You must not:</p>
          <ul>
            <li>Republish material from our website</li>
            <li>Sell, rent or sub-license material from the website</li>
            <li>Reproduce, duplicate or copy material from FLASH</li>
          </ul>
        </section>

        <section>
          <h2>3. Shipping & Delivery</h2>
          <p>
            We strive to deliver our products across India within 5-7 business
            days. Delivery times may vary based on your location and external
            factors. FLASH is not responsible for delays caused by third-party
            courier services.
          </p>
        </section>

        <section>
          <h2>4. Returns & Refunds</h2>
          <p>
            We want you to love your FLASH pieces. If you are not satisfied, you
            may return the product within 14 days of delivery, provided it is in
            its original condition with tags intact. Please refer to our returns
            portal for more details.
          </p>
        </section>

        <section>
          <h2>5. Limitation of Liability</h2>
          <p>
            In no event shall FLASH, nor any of its officers, directors and
            employees, be liable to you for anything arising out of or in any
            way connected with your use of this website, whether such liability
            is under contract, tort or otherwise.
          </p>
        </section>

        <section>
          <h2>6. Governing Law</h2>
          <p>
            These terms will be governed by and construed in accordance with the
            laws of India, and you submit to the non-exclusive jurisdiction of
            the state and federal courts located in India for the resolution of
            any disputes.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-border/50 text-sm text-muted-foreground italic">
          Last updated: December 24, 2025
        </div>
      </article>
    </div>
  );
}
