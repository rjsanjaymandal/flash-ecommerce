import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accessibility | FLASH',
  description: 'Our commitment to providing a website that is accessible to everyone.',
}

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-background py-20 px-4 md:px-8">
      <article className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-8">
          Web <span className="text-primary italic">Accessibility</span>
        </h1>
        
        <p className="lead text-muted-foreground font-medium">
          FLASH is committed to digital accessibility and ensuring that all users, regardless of ability, can enjoy our products and community.
        </p>

        <section>
          <h2>Our Commitment</h2>
          <p>
            We strive to provide a website that is accessible to the widest possible audience, regardless of circumstance and ability. We aim to adhere as closely as possible to the Web Content Accessibility Guidelines (WCAG 2.1, Level AA), published by the World Wide Web Consortium (W3C).
          </p>
        </section>

        <section>
          <h2>Accessibility Features</h2>
          <p>
            Key accessibility features on our website include:
          </p>
          <ul>
            <li>Semantic HTML for better screen reader compatibility</li>
            <li>Consistent navigation and structure</li>
            <li>High contrast ratios for readability</li>
            <li>Keyboard-navigable menus and interactive elements</li>
            <li>Alt-text for all meaningful images</li>
          </ul>
        </section>

        <section>
          <h2>Ongoing Improvements</h2>
          <p>
            We are working to integrate accessibility into our design process from the ground up. While we strive to be fully accessible, we recognize that some parts of the site may still have room for improvement as web standards evolve and technologies change.
          </p>
        </section>

        <section className="bg-muted/50 p-8 rounded-3xl mt-12 border border-border/50">
          <h3 className="mt-0 tracking-tight italic uppercase font-black">Feedback</h3>
          <p className="text-sm md:text-base leading-relaxed mb-0">
            If you experience any difficulty in accessing any part of this website, please contact us at <strong>hi@flashhfashion.in</strong>. We will work with you to provide the information, item, or transaction you seek through an alternate communication method or that is accessible for you.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-border/50 text-sm text-muted-foreground italic">
          Last updated: December 24, 2025
        </div>
      </article>
    </div>
  )
}
