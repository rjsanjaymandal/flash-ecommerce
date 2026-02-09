import { getProducts } from "@/lib/services/product-service";
import { getVibe, getAllVibes } from "@/lib/vibe-config";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/storefront/product-card";
import { Metadata } from "next";

export const revalidate = 3600; // Hourly

type Props = {
  params: Promise<{ vibe: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vibe } = await params;
  const config = getVibe(vibe);

  if (!config) return { title: "Vibe Not Found" };

  return {
    title: `${config.title} | Shop the Vibe | FLASH`,
    description: config.description,
    keywords: config.keywords,
    openGraph: {
      title: config.title,
      description: config.description,
    },
    alternates: {
      canonical: `https://flashhfashion.in/shop/vibes/${vibe}`,
    },
  };
}

export async function generateStaticParams() {
  const vibes = getAllVibes();
  return vibes.map((vibe) => ({ vibe }));
}

export default async function VibePage({ params }: Props) {
  const { vibe } = await params;
  const config = getVibe(vibe);

  if (!config) notFound();

  const { data: products } = await getProducts({
    ...config.filter,
    limit: 12,
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="w-full bg-neutral-900 text-white py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-black/80 z-0 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-block py-1 px-3 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4 bg-white/5 backdrop-blur-md">
            Curated Collection
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            {config.title}
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            {config.description}
          </p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4 lg:px-8 py-12">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              No products match this vibe currently. Check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
