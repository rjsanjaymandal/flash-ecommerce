import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | FLASH",
  description: "How we protect and manage your data at FLASH.",
  alternates: {
    canonical: "https://flashhfashion.in/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-20 px-4 md:px-8">
      <article className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-8">
          Privacy <span className="text-primary italic">& Cookies</span>
        </h1>

        <p className="lead text-muted-foreground">
          At FLASH, we are committed to protecting your privacy. This policy
          explains how we collect, use, and safeguard your information.
        </p>

        <section>
          <h2>1. Data Collection</h2>
          <p>
            We collect information from you when you register on our site, place
            an order, subscribe to our newsletter, or fill out a form. This
            includes your name, email address, mailing address, and phone
            number.
          </p>
        </section>

        <section>
          <h2>2. Use of Information</h2>
          <p>The information we collect from you may be used to:</p>
          <ul>
            <li>Personalize your experience and respond to individual needs</li>
            <li>Improve our website and customer service</li>
            <li>Process transactions efficiently</li>
            <li>Send periodic emails regarding your order or brand updates</li>
          </ul>
        </section>

        <section>
          <h2>3. Cookies</h2>
          <p>
            Yes, we use cookies. These are small files that a site or its
            service provider transfers to your computer&apos;s hard drive
            through your web browser (if you allow) that enables the site&apos;s
            or service provider&apos;s systems to recognize your browser and
            capture and remember certain information.
          </p>
          <p>
            We use cookies to help us remember and process the items in your
            shopping cart and understand your preferences for future visits.
          </p>
        </section>

        <section>
          <h2>4. Data Security</h2>
          <p>
            We implement a variety of security measures to maintain the safety
            of your personal information. Your personal information is contained
            behind secured networks and is only accessible by a limited number
            of persons who have special access rights to such systems.
          </p>
        </section>

        <section>
          <h2>5. Third-Party Disclosure</h2>
          <p>
            We do not sell, trade, or otherwise transfer to outside parties your
            personally identifiable information. This does not include trusted
            third parties who assist us in operating our website, conducting our
            business, or servicing you, so long as those parties agree to keep
            this information confidential.
          </p>
        </section>

        <section>
          <h2>6. Consent</h2>
          <p>By using our site, you consent to our privacy policy.</p>
        </section>

        <div className="mt-12 pt-8 border-t border-border/50 text-sm text-muted-foreground italic">
          Last updated: December 24, 2025
        </div>
      </article>
    </div>
  );
}
