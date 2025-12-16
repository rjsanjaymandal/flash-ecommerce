import { Hero } from "@/components/storefront/hero"
import { FeaturedGrid } from "@/components/storefront/featured-grid"
import { Button } from "@/components/ui/button"
import { Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getProducts } from "@/lib/services/product-service"
import { getRootCategories } from "@/lib/services/category-service"

export const revalidate = 60

export default async function Home() {
  const [products, categories] = await Promise.all([
    getProducts({
        is_active: true,
        limit: 4,
        sort: 'newest'
    }),
    getRootCategories(4)
  ])

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-black selection:text-white">
      
      {/* 1. NEW HERO SECTION */}
      <Hero />

      {/* 2. FEATURED GRID */}
      <FeaturedGrid products={products || []} />

      {/* 3. SHOP BY CATEGORY (Restored) */}
      <section className="py-24 bg-zinc-50 relative overflow-hidden text-zinc-900">
           {/* Blob Backgrounds */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200/50 rounded-full blur-[100px] -z-10" />
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-200/50 rounded-full blur-[100px] -z-10" />

           <div className="container mx-auto px-4">
              <div className="text-center mb-16 space-y-4">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter">PICK YOUR VIBE</h2>
                <p className="text-xl text-zinc-500 font-medium">Explore collections designed for you.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories?.length ? categories.map((cat: any, i: number) => {
                    const gradients = [
                        "from-red-500 to-pink-600",
                        "from-orange-400 to-amber-500",
                        "from-green-400 to-emerald-600",
                        "from-blue-400 to-indigo-600"
                    ]
                    const gradient = gradients[i % gradients.length]
                    
                    return (
                    <Link 
                        key={cat.id} 
                        href={`/shop?category=${cat.id}`} 
                        className="group relative h-[400px] overflow-hidden rounded-[2rem] bg-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                    >
                        {/* Image Placeholder if url exists, else Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 transition-transform duration-700 group-hover:scale-110`} />
                         
                        {cat.image_url && <img src={cat.image_url} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay hover:mix-blend-normal transition-all" alt="" />}

                        <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                            <div className="flex justify-between items-start">
                                <span className={`h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:bg-white group-hover:text-black transition-colors`}>
                                    <ArrowRight className="h-5 w-5 -rotate-45 group-hover:rotate-0 transition-transform" />
                                </span>
                            </div>
                            <div>
                                <h3 className="text-4xl font-black italic tracking-tighter mb-2">{cat.name}</h3>
                                <p className="text-white/80 font-medium text-sm">Explore Collection</p>
                            </div>
                        </div>
                    </Link>
                )}) : (
                    <div className="col-span-4 text-center text-muted-foreground p-12">
                        No categories found.
                    </div>
                )}
              </div>
          </div>
      </section>

      {/* 4. NEWSLETTER */}
      <section className="py-24 container mx-auto px-4 text-center border-t border-border">
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-linear-to-r from-red-100 via-orange-100 to-blue-100 mb-4 animate-pulse">
               <Star className="h-6 w-6 text-orange-500 fill-orange-500" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                STYLING IS <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-blue-600">
                    MY SUPERPOWER
                </span>
            </h2>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                Join our community and get exclusive access to new drops, events, and styling tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto pt-8">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full w-full bg-foreground text-background hover:bg-foreground/90">
                    Get Started
                </Button>
            </div>
        </div>
      </section>

    </div>
  )
}
