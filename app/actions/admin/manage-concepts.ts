'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { uploadOptimizedImage } from '../upload-images'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { isAdmin: false, error: 'Unauthorized' }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (profile?.role !== 'admin') return { isAdmin: false, error: 'Unauthorized' }
  
  return { isAdmin: true, user, supabase }
}

export async function createConcept(formData: FormData) {
  const adminAuth = await verifyAdmin()
  if (!adminAuth.isAdmin) return { error: adminAuth.error }
  
  const { supabase } = adminAuth
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const voteGoal = Number(formData.get('voteGoal'))
  const file = formData.get('image') as File
  
  if (!file || file.size === 0) {
    return { error: 'Image is required' }
  }
  
  try {
    // 1. Upload Image
    const uploadFormData = new FormData()
    uploadFormData.set('file', file)
    const images = await uploadOptimizedImage(uploadFormData, 'concepts')
    
    // 2. Insert into DB
    const { error: insertError } = await supabase
      .from('concepts')
      .insert({
        title,
        description,
        vote_goal: voteGoal,
        image_url: images.desktop, // Use desktop variant as main image
        status: 'voting'
      })
      
    if (insertError) {
      console.error('Error creating concept:', insertError)
      return { error: 'Failed to create concept' }
    }
    
    revalidatePath('/admin/concepts')
    revalidatePath('/lab')
    return { success: true }
    
  } catch (err) {
    console.error('Concept creation failed:', err)
    return { error: 'An unexpected error occurred' }
  }
}

export async function updateConceptStatus(id: string, status: 'voting' | 'approved' | 'launched') {
  const adminAuth = await verifyAdmin()
  if (!adminAuth.isAdmin) return { error: adminAuth.error }
  
  const { supabase } = adminAuth
  
  const { error } = await supabase
    .from('concepts')
    .update({ status })
    .eq('id', id)
    
  if (error) {
    console.error('Error updating status:', error)
    return { error: 'Failed to update status' }
  }
  
  revalidatePath('/admin/concepts')
  revalidatePath('/lab')
  return { success: true }
}

export async function deleteConcept(id: string) {
  const adminAuth = await verifyAdmin()
  if (!adminAuth.isAdmin) return { error: adminAuth.error }
  
  const { supabase } = adminAuth
  
  // 1. Get image URL to delete from storage
  const { data: concept } = await supabase
    .from('concepts')
    .select('image_url')
    .eq('id', id)
    .single()
    
  if (concept?.image_url) {
    // Extract file name from URL
    // Public URL format: .../storage/v1/object/public/concepts/filename-variant.webp
    const parts = concept.image_url.split('/')
    const fileName = parts[parts.length - 1]
    
    // Since we upload 3 variants, we should ideally delete all 3.
    // The fileName has -desktop.webp, -mobile.webp, -thumbnail.webp
    const baseName = fileName.replace('-desktop.webp', '')
    
    await supabase.storage.from('concepts').remove([
      `${baseName}-desktop.webp`,
      `${baseName}-mobile.webp`,
      `${baseName}-thumbnail.webp`
    ])
  }
  
  // 2. Delete from DB
  const { error: deleteError } = await supabase
    .from('concepts')
    .delete()
    .eq('id', id)
    
  if (deleteError) {
    console.error('Error deleting concept:', deleteError)
    return { error: 'Failed to delete concept' }
  }
  
  revalidatePath('/admin/concepts')
  revalidatePath('/lab')
  return { success: true }
}
