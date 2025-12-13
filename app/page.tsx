import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, Heart } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-background">
            <div className="absolute inset-0 bg-linear-to-tr from-primary/20 via-background to-accent/20 animate-pulse-slow" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center space-y-6">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-xl">
                 <Sparkles className="mr-2 h-4 w-4" /> New Collection Drop
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter shadow-xl">
                WEAR YOUR <br />
                <span className="bg-linear-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
                    TRUE COLORS
                </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground">
                Bold, inclusive, and unapologetic fashion for everyone. 
                Explore the latest gender-neutral streetwear collection designed to make you shine.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25" asChild>
                    <Link href="/shop/all">
                        Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2" asChild>
                    <Link href="/about">Our Story</Link>
                </Button>
            </div>
        </div>
      </section>

      {/* Featured Categories (Mock Data for now, could fetch from DB) */}
      <section className="py-24 container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
            <Link href="/shop/all" className="text-primary hover:underline underline-offset-4 font-medium flex items-center">
                View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { name: 'Hoodies', slug: 'hoodies', color: 'from-pink-500/20 to-purple-500/20' },
                { name: 'T-Shirts', slug: 't-shirts', color: 'from-cyan-500/20 to-blue-500/20' },
                { name: 'Accessories', slug: 'accessories', color: 'from-yellow-500/20 to-orange-500/20' },
            ].map((cat) => (
                <Link 
                    key={cat.slug} 
                    href={`/shop/${cat.slug}`}
                    className="group relative h-96 overflow-hidden rounded-2xl border border-border bg-card transition-all hover:scale-[1.02] hover:shadow-xl"
                >
                    <div className={`absolute inset-0 bg-linear-to-br ${cat.color} opacity-50 transition-opacity group-hover:opacity-100`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-4xl font-black italic tracking-tighter text-foreground group-hover:scale-110 transition-transform duration-300">
                            {cat.name.toUpperCase()}
                        </h3>
                    </div>
                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div className="bg-background/80 backdrop-blur-md p-3 rounded-full">
                            <ArrowRight className="h-6 w-6 text-foreground" />
                        </div>
                    </div>
                </Link>
            ))}
          </div>
      </section>

       {/* Values Banner */}
       <section className="py-24 bg-muted/30 border-y border-border">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="space-y-4 p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">Inclusive Design</h3>
                    <p className="text-muted-foreground">Fits for every body type. Gender-neutral sizing and cuts that celebrate you.</p>
                </div>
                <div className="space-y-4 p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50">
                    <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                         <Zap className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">Premium Quality</h3>
                    <p className="text-muted-foreground">High-gsm fabrics, durable prints, and attention to detail in every stitch.</p>
                </div>
                <div className="space-y-4 p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50">
                    <div className="mx-auto w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center text-secondary-foreground">
                        <Heart className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">Community First</h3>
                    <p className="text-muted-foreground">Proceeds support LGBTQ+ charities. Fashion that gives back.</p>
                </div>
            </div>
       </section>
    </div>
  )
}
