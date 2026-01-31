import { createClient } from '@/lib/supabase/server'
import { MetadataRoute } from 'next'
import { getBlogPosts } from '@/lib/services/blog-service'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
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
  const blogPosts = await getBlogPosts()
  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...productUrls,
    ...blogUrls,
  ]
}
