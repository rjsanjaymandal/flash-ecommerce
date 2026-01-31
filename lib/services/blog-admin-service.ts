'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/utils'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'

// Types
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
}

// Validation Schema
export const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(1, 'Content is required'),
  cover_image: z.string().optional().nullable(),
  author: z.string().default('Flash Fashion Team'),
  tags: z.array(z.string()).default([]),
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
})

export type BlogPostFormValues = z.infer<typeof blogPostSchema>

// Fetch all blog posts (admin view - includes drafts)
export async function getAdminBlogPosts(): Promise<BlogPost[]> {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    
    // Note: blog_posts table is created via migration - type assertion needed until types are regenerated
    const { data, error } = await (supabase as any)
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('[getAdminBlogPosts] DB Error:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('[getAdminBlogPosts] Error:', error)
    return []
  }
}

// Fetch single blog post by ID (admin)
export async function getAdminBlogPost(id: string): Promise<BlogPost | null> {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    
    const { data, error } = await (supabase as any)
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return null
    return data
  } catch (error) {
    console.error('[getAdminBlogPost] Error:', error)
    return null
  }
}

// Create blog post
export async function createBlogPost(formData: BlogPostFormValues) {
  try {
    await requireAdmin()
    
    const validated = blogPostSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }
    
    const supabase = createAdminClient()
    const { data: { user } } = await (await createClient()).auth.getUser()
    
    const insertData = {
      ...validated.data,
      published_at: validated.data.is_published ? new Date().toISOString() : null,
      created_by: user?.id,
      updated_by: user?.id,
    }
    
    const { data, error } = await (supabase as any)
      .from('blog_posts')
      .insert(insertData)
      .select('id')
      .single()
    
    if (error) {
      console.error('[createBlogPost] Error:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/admin/blog')
    revalidatePath('/blog')
    // @ts-expect-error: Next.js types incorrectly require a second argument
    revalidateTag('blog-posts')
    
    return { success: true, id: data.id }
  } catch (err: any) {
    console.error('[createBlogPost] Crash:', err)
    return { success: false, error: err.message || 'Unknown error' }
  }
}

// Update blog post
export async function updateBlogPost(id: string, formData: BlogPostFormValues) {
  try {
    await requireAdmin()
    
    const validated = blogPostSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }
    
    const supabase = createAdminClient()
    const { data: { user } } = await (await createClient()).auth.getUser()
    
    // Fetch existing to check publish state change
    const { data: existing } = await (supabase as any)
      .from('blog_posts')
      .select('is_published, published_at')
      .eq('id', id)
      .single()
    
    const updateData: any = {
      ...validated.data,
      updated_by: user?.id,
    }
    
    // Set published_at if publishing for the first time
    if (validated.data.is_published && !existing?.published_at) {
      updateData.published_at = new Date().toISOString()
    }
    
    const { error } = await (supabase as any)
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
    
    if (error) {
      console.error('[updateBlogPost] Error:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/admin/blog')
    revalidatePath('/blog')
    revalidatePath(`/blog/${validated.data.slug}`)
    // @ts-expect-error: Next.js types incorrectly require a second argument
    revalidateTag('blog-posts')
    
    return { success: true }
  } catch (err: any) {
    console.error('[updateBlogPost] Crash:', err)
    return { success: false, error: err.message || 'Unknown error' }
  }
}

// Delete blog post
export async function deleteBlogPost(id: string) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    
    const { error } = await (supabase as any)
      .from('blog_posts')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('[deleteBlogPost] Error:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/admin/blog')
    revalidatePath('/blog')
    // @ts-expect-error: Next.js types incorrectly require a second argument
    revalidateTag('blog-posts')
    
    return { success: true }
  } catch (err: any) {
    console.error('[deleteBlogPost] Crash:', err)
    return { success: false, error: err.message || 'Unknown error' }
  }
}

// Toggle publish status
export async function toggleBlogPostPublish(id: string, publish: boolean) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    
    const updateData: any = { is_published: publish }
    if (publish) {
      // Only set published_at if not already set
      const { data: existing } = await (supabase as any)
        .from('blog_posts')
        .select('published_at')
        .eq('id', id)
        .single()
      
      if (!existing?.published_at) {
        updateData.published_at = new Date().toISOString()
      }
    }
    
    const { error } = await (supabase as any)
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    revalidatePath('/admin/blog')
    revalidatePath('/blog')
    // @ts-expect-error: Next.js types incorrectly require a second argument
    revalidateTag('blog-posts')
    
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown error' }
  }
}
