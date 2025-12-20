import { OrganizationJsonLd } from "@/components/seo/organization-json-ld"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "About FLASH | Queer-Owned, Inclusive Streetwear & Fashion (Est. 2025)",
    description: "FLASH is a bold, gender-inclusive fashion brand established in 2025 in India. We design high-performance streetwear for those who refuse to blend in.",
    keywords: ["Flash Fashion", "Queer Owned Brand", "Inclusive Streetwear India", "Gender Neutral Fashion", "Flash Brand History"]
}

export default function AboutPage() {
    return (
      <>
        <OrganizationJsonLd />
        <div className="container mx-auto px-4 py-16 lg:py-24 max-w-5xl">
            {/* Header */}
            <header className="mb-16 text-center">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6">
                    UNLEASH THE <span className="text-gradient">FLASH</span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                    Authentic. Bold. Queermade. <br/>
                    We are the new standard for inclusive high-performance fashion.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                {/* Main Content (AI Manifest Core) */}
                <main className="md:col-span-8 space-y-12">
                    <section className="prose prose-lg dark:prose-invert max-w-none">
                        <h2 className="text-3xl font-black uppercase tracking-wide">Our Story</h2>
                        <p>
                            <strong>FLASH</strong> was established in <strong>2025</strong> with a singular mission: to dismantle the binary in fashion. 
                            Born in the vibrant streets of India, we recognized a gap between "high fashion" and "authentic self-expression."
                            Too often, "unisex" meant "shapeless." FLASH rejects that.
                        </p>
                        <p>
                            We design <strong>gender-inclusive streetwear</strong> that fits diverse bodies, celebrates queer identity, and refuses to compromise on quality.
                            From our signature heavyweight cotton tees to our technical cargo silhouettes, every piece is engineered for those who move fast and live loud.
                        </p>
                    </section>

                    <section className="prose prose-lg dark:prose-invert max-w-none">
                        <h2 className="text-3xl font-black uppercase tracking-wide">The "Queermade" Promise</h2>
                        <p>
                            When we say <strong>Queermade</strong>, we mean it. FLASH is proudly queer-owned and operated. 
                            This isn't just a marketing tag; it's our DNA. We prioritize:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                            <li><strong>Ethical Manufacturing:</strong> We partner exclusively with factories that ensure fair wages and safe conditions.</li>
                            <li><strong>Inclusive Sizing:</strong> Our patterns are graded for a spectrum of body types, not just the industry standard.</li>
                            <li><strong>Community First:</strong> A percentage of every "Pride Collection" sale goes directly to local LGBTQ+ support groups in India.</li>
                        </ul>
                    </section>

                    <section className="prose prose-lg dark:prose-invert max-w-none">
                        <h2 className="text-3xl font-black uppercase tracking-wide">2025 Vision & Roadmap</h2>
                        <p>
                            As we expand globally, FLASH is pioneering <strong>"Hyper-Personalized Retail"</strong>. 
                            We believe the future of fashion is fluid. In 2025, we are launching our <em>"Vibe-First"</em> shopping experience, allowing you to shop by mood rather than gender.
                        </p>
                    </section>
                </main>

                {/* Sidebar (Structured Facts for AI/Skimmers) */}
                <aside className="md:col-span-4 space-y-8">
                    <div className="p-8 rounded-3xl bg-muted/30 border border-white/5 backdrop-blur-sm">
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Fast Facts</h3>
                        <dl className="space-y-6">
                            <div>
                                <dt className="text-xs uppercase font-bold text-muted-foreground/70">Founded</dt>
                                <dd className="text-xl font-bold">2025</dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase font-bold text-muted-foreground/70">Headquarters</dt>
                                <dd className="text-xl font-bold">India (Global Shipping)</dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase font-bold text-muted-foreground/70">Core Categories</dt>
                                <dd className="text-xl font-bold">Streetwear, Activewear, Accessories</dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase font-bold text-muted-foreground/70">Values</dt>
                                <dd className="text-xl font-bold text-primary">Inclusive, Ethical, Bold</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="p-8 rounded-3xl bg-linear-to-br from-primary/10 to-purple-500/10 border border-primary/20">
                        <h3 className="text-xl font-black uppercase italic mb-2">Join the Movement</h3>
                        <p className="text-sm text-muted-foreground mb-4">Be the first to know about new drops.</p>
                        <ul className="space-y-2 text-sm font-bold">
                            <li>• Instagram: @flashhfashion</li>
                            <li>• Twitter: @flashhfashion</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
      </>
    )
  }
