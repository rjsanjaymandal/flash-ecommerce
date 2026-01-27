import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 86400 // Daily

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'https://flashhfashion.in'

  // Fetch all products & categories in parallel
  const [productsRes, categoriesRes] = await Promise.all([
    supabase.from('products').select('slug, updated_at'),
    supabase.from('categories').select('id, slug, updated_at')
  ])

  const products = productsRes.data || []
  const categories = categoriesRes.data || []

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categoryUrls = categories.map((category) => ({
    url: `${baseUrl}/shop?category=${category.id}`,
    lastModified: category.updated_at ? new Date(category.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const staticRoutes = [
    '',
    '/shop',
    '/lab',
    '/about',
    '/contact',
    '/faq',
    '/size-guide',
    '/shipping',
    '/sustainability'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.6,
  }))

  return [
    ...staticRoutes,
    ...productUrls,
    ...categoryUrls,
  ]
}
