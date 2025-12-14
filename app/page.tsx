import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, Heart } from "lucide-react"
import { getProducts } from "@/lib/services/product-service"
import { getLinearCategories } from "@/lib/services/category-service"
import { ProductCard } from "@/components/storefront/product-card"

export const revalidate = 60 // Revalidate every minute

export default async function Home() {
  const allCategories = await getLinearCategories() || []
  const categories = allCategories.filter((c: any) => !c.parent_id).slice(0, 3)

  const featuredProducts = await getProducts({
      is_active: true,
      limit: 4,
      sort: 'newest'
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-slow-zoom"
                style={{ backgroundImage: `url('/hero-banner.png')` }}
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-black/40" /> 
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center space-y-8 pt-20">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-1000">
                 <Sparkles className="mr-2 h-4 w-4 text-yellow-300" /> 
                 <span className="text-shadow-sm">New Collection Drop</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter text-white drop-shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-100">
                WEAR YOUR <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-purple-400 to-accent animate-gradient-x">
                    TRUE COLORS
                </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl md:text-2xl text-gray-200 font-medium drop-shadow-md animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                Bold, inclusive, and unapologetic fashion for everyone. 
                <span className="opacity-80 block mt-2 text-base font-normal">Explore the latest gender-neutral streetwear collection.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                <Button size="lg" className="h-16 px-10 text-xl rounded-full bg-white text-black hover:bg-gray-100 shadow-xl hover:scale-105 transition-all duration-300" asChild>
                    <Link href="/shop">
                        Shop Collection <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-16 px-10 text-xl rounded-full border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300" asChild>
                    <Link href="/about">
                        Our Story
                    </Link>
                </Button>
            </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
                <h2 className="text-4xl font-black tracking-tighter mb-2">New Drops</h2>
                <p className="text-muted-foreground text-lg">Fresh styles just landed in the store.</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex group">
                <Link href="/shop" className="text-lg">
                    View All <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {featuredProducts?.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
              ))}
          </div>
          
          <div className="mt-12 text-center sm:hidden">
            <Button size="lg" variant="outline" className="w-full" asChild>
                <Link href="/shop">View All Products</Link>
            </Button>
          </div>
      </section>

      {/* Categories Parallax/Grid */}
      <section className="py-24 bg-zinc-950 text-white relative overflow-hidden">
           {/* Decorative Blobs */}
           <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
           <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />

          <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-16 space-y-4">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Shop by Category</h2>
                <p className="text-xl text-gray-400">Find your perfect fit across our collections.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {categories?.length ? categories.map((cat: any, i: number) => (
                    <Link 
                        key={cat.id} 
                        href={`/shop?category=${cat.id}`} 
                        className={`group relative h-[450px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 ${i === 1 ? 'md:-translate-y-12' : ''}`}
                    >
                        <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/80 z-10" />
                        
                        {/* Placeholder gradient/image for category */}
                        <div className={`absolute inset-0 opacity-60 transition-transform duration-700 group-hover:scale-110 bg-linear-to-br ${i === 0 ? 'from-purple-600 to-blue-600' : i === 1 ? 'from-pink-600 to-rose-600' : 'from-yellow-500 to-orange-600'}`} />
                        
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-12 p-6 text-center">
                            <h3 className="text-5xl font-black italic tracking-tighter mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                {cat.name.toUpperCase()}
                            </h3>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 delay-75">
                                <span className="inline-flex items-center text-sm font-bold uppercase tracking-widest border border-white/30 px-4 py-2 rounded-full hover:bg-white hover:text-black transition-colors">
                                    Explore <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            </div>
                        </div>
                    </Link>
                )) : null}
              </div>
          </div>
      </section>

       {/* Values Banner */}
       <section className="py-24 border-t border-border">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-border">
                    <div className="space-y-4 px-4">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 rotate-3 hover:rotate-6 transition-transform">
                            <Sparkles className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-bold">Inclusive Design</h3>
                        <p className="text-muted-foreground leading-relaxed">Fashion that breaks boundaries. Gender-neutral sizing and cuts designed to celebrate every body type.</p>
                    </div>
                    <div className="space-y-4 px-4 pt-12 md:pt-0">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6 -rotate-3 hover:-rotate-6 transition-transform">
                             <Zap className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-bold">Premium Quality</h3>
                        <p className="text-muted-foreground leading-relaxed">Built to last. We use high-gsm fabrics, durable prints, and ensure attention to detail in every stitch.</p>
                    </div>
                    <div className="space-y-4 px-4 pt-12 md:pt-0">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary/30 flex items-center justify-center text-secondary-foreground mb-6 rotate-3 hover:rotate-6 transition-transform">
                            <Heart className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-bold">Community First</h3>
                        <p className="text-muted-foreground leading-relaxed">More than a brand. A portion of every sale goes directly to supporting LGBTQ+ youth charities.</p>
                    </div>
                </div>
            </div>
       </section>
    </div>
  )
}
