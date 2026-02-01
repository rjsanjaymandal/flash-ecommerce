import { createAdminClient } from '@/lib/supabase/admin'
import { MetadataRoute } from 'next'
import { getStaticBlogPosts } from '@/lib/services/blog-service'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient()
  const baseUrl = 'https://flashhfashion.in'

  // Fetch all active products
  // Selecting only slug and updated_at for efficiency as requested
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)

  const productUrls = (products || []).map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(product.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Fetch all blog posts
  const blogPosts = await getStaticBlogPosts()
  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // 3. Static Pages
  const staticRoutes = [
    '',
    '/shop',
    '/shop/new-arrivals',
    '/shop/best-sellers',
    '/blog',
    '/about',
    '/contact',
    '/shipping',
    '/returns',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  // 4. Categories (Hardcoded for now to ensure coverage of key SEO pages)
  const categories = [
    'anime-streetwear',
    'heavyweight-cotton',
    'oversized-tees',
    'hoodies',
    'accessories',
    'techwear'
  ]
  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/shop/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  return [
    ...staticRoutes,
    ...categoryUrls,
    ...productUrls,
    ...blogUrls,
  ]
}
