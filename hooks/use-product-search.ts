import { useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'

export interface SearchableProduct {
  id: string
  name: string
  slug: string | null
  price: number
  display_image: string | null
  category_name?: string | null
  description?: string | null
}

interface UseProductSearchProps<T extends SearchableProduct> {
    products: T[]
}

export function useProductSearch<T extends SearchableProduct>({ products }: UseProductSearchProps<T>) {
    
    // 1. Memoize the Fuse index
    // We only rebuild if the product list length or contents change significantly
    const fuse = useMemo(() => {
        return new Fuse(products, {
            keys: [
                { name: 'name', weight: 0.7 },
                { name: 'category_name', weight: 0.3 },
                { name: 'slug', weight: 0.1 }
            ],
            threshold: 0.3, // 0.0 = Exact match, 1.0 = Match anything. 0.3 is good for typos.
            includeScore: true,
            shouldSort: true, // Sort by relevance
        })
    }, [products])

    // 2. Search Function
    const search = useCallback((query: string): T[] => {
        if (!query || query.trim() === '') {
            return products
        }

        const results = fuse.search(query)
        return results.map(result => result.item)
    }, [fuse, products])

    return { search }
}
