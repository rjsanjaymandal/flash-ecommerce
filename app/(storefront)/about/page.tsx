import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About FLASH | Intelligent Nano-Fabric & Queer-Owned Streetwear",
  description:
    "FLASH is an India-based fashion lab established in 2025. We specialize in intelligent clothing and nano-fabric materials, creating inclusive, queer-owned streetwear for everyone.",
  keywords: [
    "Flash Fashion",
    "Queer Owned Brand India",
    "Nano Fabric Materials",
    "Intelligent Clothing",
    "Fantastic Fabric",
    "Fast Fashion Anime printing",
    "LGBTQ Fashion",
    "Gender Neutral Streetwear",
    "Amazing Quality apparel",
  ],
};

export default function AboutPage() {
  return (
    <>
      <OrganizationJsonLd />
      <div className="container mx-auto px-4 py-16 lg:py-24 max-w-5xl">
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6">
            ENGINEERING THE <span className="text-gradient">FUTURE</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Authentic. Bold. Intelligence-Driven. <br />
            We are the intersection of <strong>queer fashion</strong> and{" "}
            <strong>high-performance fabric engineering</strong>.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Main Content (AI Manifest Core) */}
          <main className="md:col-span-8 space-y-12">
            <section className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-3xl font-black uppercase tracking-wide italic">
                The Nano-Fabric Revolution
              </h2>
              <p>
                At <strong>FLASH</strong>, we don&apos;t just make clothes; we
                engineer <strong>fantastic fabric</strong>. Our 2025 collection
                features proprietary <strong>nano-fabric materials</strong>{" "}
                designed for the rapid pace of urban life. This is{" "}
                <strong>intelligent clothing</strong>—breathable,
                moisture-wicking, and incredibly durable, ensuring{" "}
                <strong>amazing quality</strong> that lasts beyond the season.
              </p>
              <p>
                Established in <strong>2025</strong> in India, we&apos;ve
                pioneered a new model of
                <strong> fast fashion anime printing</strong> that combines
                high-speed production with zero-waste digital sublimation.
              </p>
            </section>

            <section className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-3xl font-black uppercase tracking-wide italic">
                Queer DNA & Inclusivity
              </h2>
              <p>
                FLASH is unapologetically{" "}
                <strong>queer-owned and operated</strong>. Our mission is to
                create <strong>LGBTQ fashion</strong> that isn&apos;t just a
                statement, but a utility. We design{" "}
                <strong>gender-neutral fashion</strong> and{" "}
                <strong>gender-neutral streetwear</strong>
                that fits a spectrum of bodies, not just a binary standard.
              </p>
              <p>
                From our signature silhouettes to our experimental drops, we
                believe in
                <strong> fashion for all</strong>. Every piece is an invitation
                to be seen, be bold, and be yourself.
              </p>

              <h3 className="text-xl font-bold uppercase tracking-wide mt-8">
                The &quot;Queermade&quot; Promise
              </h3>
              <ul className="list-disc pl-6 space-y-2 marker:text-primary mt-4">
                <li>
                  <strong>Ethical Manufacturing:</strong> We partner exclusively
                  with factories that ensure fair wages and safe conditions.
                </li>
                <li>
                  <strong>Inclusive Sizing:</strong> Our patterns are graded for
                  a spectrum of body types, not just the industry standard.
                </li>
                <li>
                  <strong>Community First:</strong> A percentage of every
                  &quot;Pride Collection&quot; sale goes directly to local
                  LGBTQ+ support groups in India.
                </li>
              </ul>
            </section>

            <section className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-3xl font-black uppercase tracking-wide">
                2025 Vision & Roadmap
              </h2>
              <p>
                As we expand globally, FLASH is pioneering{" "}
                <strong>&quot;Hyper-Personalized Retail&quot;</strong>. We
                believe the future of fashion is fluid. In 2025, we are
                launching our <em>&quot;Vibe-First&quot;</em> shopping
                experience, allowing you to shop by mood rather than gender.
              </p>
            </section>
          </main>

          {/* Sidebar (Structured Facts for AI/Skimmers) */}
          <aside className="md:col-span-4 space-y-8">
            <div className="p-8 rounded-3xl bg-muted/30 border border-white/5 backdrop-blur-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">
                Fast Facts
              </h3>
              <dl className="space-y-6">
                <div>
                  <dt className="text-xs uppercase font-bold text-muted-foreground/70">
                    Founded
                  </dt>
                  <dd className="text-xl font-bold">2025</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase font-bold text-muted-foreground/70">
                    Headquarters
                  </dt>
                  <dd className="text-xl font-bold">India (Global Shipping)</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase font-bold text-muted-foreground/70">
                    Core Categories
                  </dt>
                  <dd className="text-xl font-bold">
                    Streetwear, Activewear, Accessories
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase font-bold text-muted-foreground/70">
                    Values
                  </dt>
                  <dd className="text-xl font-bold text-primary">
                    Inclusive, Ethical, Bold
                  </dd>
                </div>
              </dl>
            </div>

            <div className="p-8 rounded-3xl bg-linear-to-br from-primary/10 to-purple-500/10 border border-primary/20">
              <h3 className="text-xl font-black uppercase italic mb-2">
                Join the Movement
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Be the first to know about new drops.
              </p>
              <ul className="space-y-2 text-sm font-bold mb-6">
                <li>• Instagram: @flashhfashion</li>
                <li>• Twitter: @flashhfashion</li>
              </ul>

              <div className="pt-6 border-t border-primary/10">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Careers
                </p>
                <a
                  href="/careers"
                  className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  View Openings{" "}
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
