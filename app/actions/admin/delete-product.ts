'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath, revalidateTag } from 'next/cache'
const CACHE_PROFILE = 'max'

export type DeleteProductResult = {
    success?: boolean
    error?: string
    message?: string
    deletedImagesCount?: number
}

function extractStoragePath(url: string | null): string | null {
    if (!url) return null
    try {
        // Handle full URLs like: https://[project].supabase.co/storage/v1/object/public/products/folder/image.jpg
        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split('/products/') // Split by bucket name
        if (pathParts.length > 1) {
            return pathParts[1] // Return everything after bucket name
        }
        return null
    } catch {
        // If it's relative or invalid
        return null
    }
}

export async function deleteProductAction(productId: string): Promise<DeleteProductResult> {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // 1. Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
    
    if (profile?.role !== 'admin') {
        return { error: 'Admin privileges required' }
    }

    try {
        // 2. Fetch Product Images before deleting
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('main_image_url, gallery_image_urls')
            .eq('id', productId)
            .single()
        
        if (fetchError || !product) {
            return { error: 'Product not found' }
        }

        // 3. Collect all paths to delete
        const pathsToDelete: string[] = []

        // Main Image
        const mainPath = extractStoragePath(product.main_image_url)
        if (mainPath) pathsToDelete.push(mainPath)

        // Gallery Images
        if (product.gallery_image_urls && Array.isArray(product.gallery_image_urls)) {
            product.gallery_image_urls.forEach((url: string) => {
                const path = extractStoragePath(url)
                if (path) pathsToDelete.push(path)
            })
        }

        // 4. Delete from Storage (if any)
        let deletedCount = 0
        if (pathsToDelete.length > 0) {
            // Remove duplicates
            const uniquePaths = [...new Set(pathsToDelete)]
            
            const { error: storageError, data: storageData } = await supabase
                .storage
                .from('products')
                .remove(uniquePaths)
            
            if (storageError) {
                console.error('Failed to cleanup storage for product:', productId, storageError)
                // We notify but continue to delete the row
            } else {
                deletedCount = storageData?.length || 0
            }
        }

        // 5. Delete Product Row (Using Admin Client to bypass RLS)
        const { error: deleteError } = await adminClient
            .from('products')
            .delete()
            .eq('id', productId)
        
        if (deleteError) {
             console.error('Failed to delete product row:', JSON.stringify(deleteError, null, 2))
             return { error: `Failed to delete: ${deleteError.message || deleteError.details || 'Database error'}` }
        }

        // 6. Hardened Revalidation
        try {
            revalidatePath('/admin/products')
            revalidatePath('/shop')
            revalidatePath('/')
            revalidateTag('products', CACHE_PROFILE)
            revalidateTag('featured-products', CACHE_PROFILE)
            
            // Revalidate specifically for the shop page which might be heavily cached
            revalidatePath('/shop', 'page')
            revalidatePath('/admin/products', 'page')
        } catch (err) {
            console.warn('Revalidation notice:', err)
        }

        return { 
            success: true, 
            message: `Product deleted successfully. Cleaned up ${deletedCount} images.`,
            deletedImagesCount: deletedCount
        }

    } catch (err) {
        console.error('Unexpected error deleting product:', err)
        return { error: 'An unexpected error occurred' }
    }
}
