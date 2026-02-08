import { createAdminClient } from '@/lib/supabase/admin'
import { MetadataRoute } from 'next'
import { getStaticBlogPosts } from '@/lib/services/blog-service'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient()
  const baseUrl = 'https://flashhfashion.in'

  // Fetch all active products
  let productUrls: MetadataRoute.Sitemap = []
  try {
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)

    productUrls = (products || []).map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(product.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error('Sitemap product fetch failed:', error)
  }

  // Fetch all blog posts
  let blogUrls: MetadataRoute.Sitemap = []
  try {
    const blogPosts = await getStaticBlogPosts()
    blogUrls = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Sitemap blog fetch failed:', error)
  }

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
  // 4. Categories (Dynamic)
  let categoryUrls: MetadataRoute.Sitemap = []
  try {
    const { data: categories } = await supabase
      .from('categories') // Direct DB call to avoid cache/service layer complexity in sitemap if preferred, or use service
      .select('slug, updated_at')
      .eq('is_active', true)
    
    categoryUrls = (categories || []).map((cat) => ({
      url: `${baseUrl}/shop/${cat.slug}`,
      lastModified: new Date(cat.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  } catch (error) {
    console.error('Sitemap category fetch failed:', error)
  }

  return [
    ...staticRoutes,
    ...categoryUrls,
    ...productUrls,
    ...blogUrls,
  ]
}
