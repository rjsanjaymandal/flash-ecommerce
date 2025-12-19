import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/client'

// Since this runs at build time or on-demand on the server, we use a slightly different approach
// For static export, we'd need to fetch data. For dynamic, this runs on request.
// We'll stick to mostly static + common dynamic for now.

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://flash-ecommerce.vercel.app'
  const supabase = createClient()

  // 1. Static Routes
  const routes = [
    '',
    '/shop',
    '/faq',
    '/contact',
    '/login',
    '/signup',
    '/shipping',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }))

  // 2. Fetch Products for Dynamic Routes
  // We limit to 500 for now to avoid massive sitemaps, user can paginate or we can split later.
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .limit(500)

  const productRoutes = products?.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(product.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || []

  // 3. Fetch Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, created_at')

    const categoryRoutes = categories?.map((cat) => ({
        url: `${baseUrl}/shop/${cat.slug}`,
        lastModified: new Date(cat.created_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })) || []

  return [...routes, ...productRoutes, ...categoryRoutes]
}
