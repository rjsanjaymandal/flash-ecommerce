import { useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'

export interface SearchableProduct {
    id: string
    name: string
    price: number
    category?: {
        name: string
    } | null
    [key: string]: any
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
                'name',
                'category_name', // Support flattened category
                'category.name', // Support nested category name
                'category',      // Support flat category string if used
                'description'    // Optional: Include description if available
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
