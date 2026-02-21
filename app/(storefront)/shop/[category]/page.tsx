import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/storefront/product-card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CollectionJsonLd } from "@/components/seo/collection-json-ld";
import type { Tables } from "@/types/supabase";
import type { Product } from "@/lib/services/product-service";

type Category = Tables<"categories">;

const CATEGORY_FIELDS =
  "id, name, slug, parent_id, is_active, description, image_url, created_at, updated_at";
const PRODUCT_CARD_FIELDS =
  "id, name, slug, price, original_price, main_image_url, gallery_image_urls, status, is_active, category_id, created_at, is_carousel_featured, size_options, color_options, fit_options, expression_tags, categories(name), product_stock(*)";

export const revalidate = 900;
// export const dynamic = "auto";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;

  if (slug === "all") {
    return {
      title: "Shop All | Flash Store",
      description:
        "Browse our entire collection of premium streetwear and accessories.",
    };
  }

  if (slug === "new-arrivals") {
    return {
      title: "New Arrivals | Flash Store",
      description:
        "The latest drops and freshest fits. Limited edition releases available now.",
    };
  }

  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!category) {
    return {
      title: "Category Not Found | Flash Store",
    };
  }

  return {
    title: `${category.name} | Anime Streetwear & Japanese Aesthetic | FLASH`,
    description:
      category.description ||
      `Shop the latest ${category.name} drops. Premium anime-inspired apparel, Harajuku style hoodies, and urban graphic tees. Fast shipping on all orders.`,
    alternates: {
      canonical: `https://flashhfashion.in/shop/${slug}`,
    },
  };
}

export default async function ShopPage(props: {
  params: Promise<{ category: string }>;
}) {
  const params = await props.params;
  const { category: slug } = params;
  const supabase = await createClient();

  // 1. Fetch ALL categories to build the tree/lookup
  const { data: allCategories } = await supabase
    .from("categories")
    .select(CATEGORY_FIELDS)
    .eq("is_active", true);

  if (!allCategories) {
    notFound();
  }

  let products: Product[] = [];
  let categoryData: Category | { name: string; description: string } | null =
    null;
  let subCategories: Category[] = [];
  let targetCategoryIds: string[] = [];

  // 2. Determine Scope
  if (slug === "all") {
    categoryData = {
      name: "All Products",
      description: "Browse our entire collection.",
    };
    const { data } = await supabase
      .from("products")
      .select(PRODUCT_CARD_FIELDS)
      .eq("status", "active")
      .order("created_at", { ascending: false });
    products = (data as Product[]) || [];
  } else if (slug === "new-arrivals") {
    categoryData = {
      name: "New Arrivals",
      description: "The latest drops and freshest fits.",
    };
    const { data } = await supabase
      .from("products")
      .select(PRODUCT_CARD_FIELDS)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(20);
    products = (data as Product[]) || [];
  } else {
    // Find the specific category
    const cat = allCategories.find((c) => c.slug === slug);

    if (!cat) notFound();
    categoryData = cat;

    // Recursive Logic: Find all descendants
    const getDescendants = (parentId: string): string[] => {
      const children = allCategories.filter((c) => c.parent_id === parentId);
      let ids = children.map((c) => c.id);
      children.forEach((child) => {
        ids = [...ids, ...getDescendants(child.id)];
      });
      return ids;
    };

    const descendantIds = getDescendants(cat.id);
    targetCategoryIds = [cat.id, ...descendantIds];

    // Get immediate children for navigation
    subCategories = allCategories.filter((c) => c.parent_id === cat.id);

    // Fetch Products matching ANY of these IDs
    const { data: prods } = await supabase
      .from("products")
      .select(PRODUCT_CARD_FIELDS)
      .in("category_id", targetCategoryIds)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    products = (prods as Product[]) || [];
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <CollectionJsonLd
        name={
          categoryData && "name" in categoryData
            ? categoryData.name
            : slug.replace("-", " ")
        }
        description={
          categoryData &&
          "description" in categoryData &&
          categoryData.description
            ? categoryData.description
            : ""
        }
        url={`${process.env.NEXT_PUBLIC_SITE_URL || "https://flashhfashion.in"}/shop/${slug}`}
      />
      <div className="container mx-auto px-4 lg:px-8">
        {/* Breadcrumb / Back */}
        <div className="mb-8">
          <Link
            href="/shop"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
          </Link>
        </div>

        {/* Hero Header */}
        <div className="flex flex-col items-center text-center space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <h1 className="text-4xl md:text-6xl font-light tracking-tight text-foreground capitalize">
            {categoryData ? categoryData.name : slug.replace("-", " ")}
          </h1>
          {categoryData?.description && (
            <p className="text-muted-foreground max-w-2xl text-lg font-light leading-relaxed">
              {categoryData.description}
            </p>
          )}

          {/* Subcategories Nav (Pill Style) */}
          {subCategories.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center pt-4">
              {subCategories.map((sub) => (
                <Link key={sub.id} href={`/shop/${sub.slug}`}>
                  <Button
                    variant="outline"
                    className="rounded-full px-6 border-muted-foreground/20 hover:border-foreground transition-all"
                  >
                    {sub.name}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center border-b border-border/40 pb-4 mb-8">
          <p className="text-sm font-medium text-muted-foreground">
            Showing {products.length}{" "}
            {products.length === 1 ? "Result" : "Results"}
          </p>
        </div>

        {/* Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center border px-4 rounded-xl border-dashed">
              <p className="text-xl font-medium mb-2">
                No products found here yet.
              </p>
              <p className="text-muted-foreground mb-6">
                Check back soon for new drops.
              </p>
              <Button asChild variant="outline">
                <Link href="/shop">Browse All Products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
