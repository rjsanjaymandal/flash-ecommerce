import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sustainability | FLASH',
  description: 'Our commitment to eco-friendly fashion and ethical production.',
}

export default function SustainabilityPage() {
  return (
    <div className="min-h-screen bg-background py-20 px-4 md:px-8">
      <article className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-8">
          Our <span className="text-primary italic">Mission</span>
        </h1>
        
        <p className="lead text-muted-foreground font-medium">
          Fashion shouldn't cost the Earth. At FLASH, we believe in radical transparency and slow fashion. 
        </p>

        <section>
          <h2>Conscious Crafting</h2>
          <p>
            We are committed to reducing our environmental footprint at every stage of production. From sourcing organic cotton to using low-impact dyes, we ensure that our pieces are as kind to the planet as they are to you.
          </p>
        </section>

        <section>
          <h2>Ethical Production</h2>
          <p>
            We partner with small-scale manufacturers in India who provide fair wages and safe working conditions. We believe that the people behind your clothes deserve respect and a living wage. Our factories are audited regularly to ensure high standards of safety and ethics.
          </p>
        </section>

        <section>
          <h2>Zero-Waste Packaging</h2>
          <p>
            Say goodbye to single-use plastics. Our packaging is 100% biodegradable or recyclable. We use cornstarch-based mailers and recycled paper cards to ensure your order arrives safely without harming the environment.
          </p>
        </section>

        <section className="relative overflow-hidden p-8 rounded-3xl bg-primary/5 border border-primary/10 mt-12">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
            <h3 className="mt-0 tracking-tight italic uppercase font-black">Slow Fashion</h3>
            <p className="mb-0 text-sm md:text-base italic font-medium text-foreground/80 leading-relaxed">
                "We don't do seasons. We do timeless pieces that are meant to be worn, loved, and passed on. By focusing on quality over quantity, we encourage a more thoughtful way of consuming fashion."
            </p>
        </section>

        <section className="mt-12">
          <h2>Future Goals</h2>
          <p>
            By 2026, we aim to transition to 100% recycled materials across our entire core collection. We are continuously researching new textile innovations like mushroom leather and pineapple silk to lead the way in sustainable inclusive fashion.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-border/50 text-sm text-muted-foreground italic">
          Join us in the movement towards a more affirms and sustainable future.
        </div>
      </article>
    </div>
  )
}
