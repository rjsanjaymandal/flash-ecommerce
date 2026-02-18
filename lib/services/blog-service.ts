import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  cover_image: string | null
  author: string
  tags: string[]
  is_published: boolean
  is_featured: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  meta_title?: string | null
  meta_description?: string | null
}

// Shorter alias for backward compatibility with file-based system
export interface BlogPostMeta {
  slug: string
  title: string
  excerpt: string
  coverImage: string
  author: string
  publishedAt: string
  tags: string[]
  featured: boolean
  content?: string
  meta_title?: string | null
  meta_description?: string | null
}

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Get all published blog posts using Admin Client (Safe for Static Generation / Sitemap)
 * Does NOT use cookies()
 */
export const getStaticBlogPosts = async (): Promise<BlogPostMeta[]> => {
  try {
    const supabase = createAdminClient()
    
    // Note: Type assertion used until types are regenerated
    const { data, error } = await (supabase as any)
      .from('blog_posts')
      .select('slug, title, excerpt, cover_image, author, published_at, created_at, is_featured')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching static blog posts:', JSON.stringify(error, null, 2))
      return []
    }
    
    return (data || []).map((post: BlogPost) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || '',
      coverImage: post.cover_image || '/blog/default-cover.jpg',
      author: post.author,
      publishedAt: post.published_at || post.created_at,
      tags: post.tags || [],
      featured: post.is_featured,
    }))
  } catch (error) {
    console.error('Error reading static blog posts:', error)
    return []
  }
}

/**
 * Get all published blog posts
 */
export const getBlogPosts = cache(async (): Promise<BlogPostMeta[]> => {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await (supabase as any)
      .from('blog_posts')
      .select('slug, title, excerpt, cover_image, author, published_at, created_at, is_featured')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching blog posts:', JSON.stringify(error, null, 2))
      return []
    }
    
    // Transform to the simpler format used by frontend
    return (data || []).map((post: BlogPost) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || '',
      coverImage: post.cover_image || '/blog/default-cover.jpg',
      author: post.author,
      publishedAt: post.published_at || post.created_at,
      tags: post.tags || [],
      featured: post.is_featured,
    }))
  } catch (error) {
    console.error('Error reading blog posts:', error)
    return []
  }
})

/**
 * Get featured blog posts
 */
export const getFeaturedPosts = cache(async (): Promise<BlogPostMeta[]> => {
  const posts = await getBlogPosts()
  return posts.filter(post => post.featured).slice(0, 3)
})

/**
 * Get a single blog post with content by slug
 */
export const getBlogPost = cache(async (slug: string): Promise<BlogPostMeta | null> => {
  try {
    const supabase = createAdminClient()
    
    const { data: post, error } = await (supabase as any)
      .from('blog_posts')
      .select('slug, title, excerpt, cover_image, author, published_at, created_at, is_featured, content, meta_title, meta_description')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    
    if (error || !post) return null
    
    return {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || '',
      coverImage: post.cover_image || '/blog/default-cover.jpg',
      author: post.author,
      publishedAt: post.published_at || post.created_at,
      tags: post.tags || [],
      featured: post.is_featured,
      content: post.content,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
    }
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error)
    return null
  }
})

/**
 * Get all blog post slugs for static generation
 */
export const getAllBlogSlugs = cache(async (): Promise<string[]> => {
  const posts = await getBlogPosts()
  return posts.map(p => p.slug)
})
