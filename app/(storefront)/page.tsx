import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, Heart, TrendingUp, Star } from "lucide-react"
import { getProducts } from "@/lib/services/product-service"
import { getRootCategories } from "@/lib/services/category-service"
import { ProductCard } from "@/components/storefront/product-card"
import { HeroCarousel } from "@/components/storefront/hero-carousel"

export const revalidate = 60 // Revalidate every minute

export default async function Home() {
  const [categories, featuredProducts] = await Promise.all([
    getRootCategories(4),
    getProducts({
      is_active: true,
      limit: 4,
      sort: 'newest'
    })
  ])

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-black selection:text-white">
      
      {/* 1. HERO CAROUSEL */}
      <HeroCarousel />

      {/* 2. VALUES BANNER (Reimagined as 'Pills') */}
      <section className="py-20 container mx-auto px-4 relative z-10 -mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-8 flex items-center gap-6 hover:translate-y-[-5px] transition-transform duration-300">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                    <Sparkles className="h-8 w-8" />
                </div>
                <div>
                   <h3 className="text-xl font-black italic tracking-tighter">INCLUSIVE</h3>
                   <p className="text-sm text-zinc-500 font-medium">For every body type.</p>
                </div>
            </div>
            <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-8 flex items-center gap-6 hover:translate-y-[-5px] transition-transform duration-300">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                    <Zap className="h-8 w-8" />
                </div>
                <div>
                   <h3 className="text-xl font-black italic tracking-tighter">PREMIUM</h3>
                   <p className="text-sm text-zinc-500 font-medium">Quality that lasts.</p>
                </div>
            </div>
            <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-8 flex items-center gap-6 hover:translate-y-[-5px] transition-transform duration-300">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                    <Heart className="h-8 w-8" />
                </div>
                <div>
                   <h3 className="text-xl font-black italic tracking-tighter">COMMUNITY</h3>
                   <p className="text-sm text-zinc-500 font-medium">Giving back always.</p>
                </div>
            </div>
        </div>
      </section>

      {/* 3. NEW DROPS */}
      <section className="py-12 container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div className="relative">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900">
                    NEW <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">DROPS</span>
                </h2>
                <div className="h-2 w-24 bg-black mt-2 rounded-full" />
            </div>
            <Button variant="outline" asChild className="hidden sm:flex rounded-full border-2 border-black hover:bg-black hover:text-white font-bold px-8 h-12">
                <Link href="/shop">
                    View All <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts?.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
              ))}
          </div>
      </section>

      {/* 4. SHOP BY CATEGORY */}
      <section className="py-24 bg-zinc-50 relative overflow-hidden">
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
                )}) : null}
              </div>
          </div>
      </section>

      {/* 5. NEWSLETTER / SUPERPOWER */}
      <section className="py-32 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-linear-to-r from-red-100 via-orange-100 to-blue-100 mb-4 animate-pulse">
               <Star className="h-6 w-6 text-orange-500 fill-orange-500" />
            </div>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                STYLING IS <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-blue-600">
                    MY SUPERPOWER
                </span>
            </h2>
            <p className="text-xl text-zinc-500 font-medium max-w-2xl mx-auto">
                Join our community and get exclusive access to new drops, events, and styling tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto pt-8">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full w-full bg-black text-white hover:bg-zinc-800">
                    Get Started
                </Button>
            </div>
        </div>
      </section>

    </div>
  )
}
