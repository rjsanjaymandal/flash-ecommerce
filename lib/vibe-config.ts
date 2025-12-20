import { ProductFilter } from "./services/product-service"

export type VibeConfig = {
    title: string
    description: string
    keywords: string[]
    filter: ProductFilter
    heroImage?: string
}

export const VIBES: Record<string, VibeConfig> = {
    'techno-bunker': {
        title: 'Underground Club & Rave Wear',
        description: 'Dark, industrial, and designed for the dancefloor. Shop specific techno aesthetics.',
        keywords: ['techno clothing', 'rave outfits', 'industrial fashion', 'black streetwear'],
        filter: { search: 'black' }
    },
    'sunday-reset': {
        title: 'Chill Sunday Reset',
        description: 'Premium comfort for recovery days. Oversized hoodies, soft joggers, and breathable fabrics.',
        keywords: ['comfy streetwear', 'loungewear sets', 'oversized hoodies'],
        filter: { sort: 'price_desc' } // Proxy for "Premium"
    },
    'statement-piece': {
        title: 'Bold Statement Pieces',
        description: 'Turn heads with our loudest prints and most unique silhouettes.',
        keywords: ['unique streetwear', 'designer fashion india', 'bold prints'],
        filter: { sort: 'trending' }
    },
    'work-from-anywhere': {
        title: 'Work From Anywhere Fits',
        description: 'Zoom-ready tops with comfort-first bottoms. The new smart casual.',
        keywords: ['smart casual streetwear', 'wfh outfits'],
        filter: { search: 'shirt' }
    }
}

export function getVibe(slug: string) {
    return VIBES[slug] || null
}

export function getAllVibes() {
    return Object.keys(VIBES)
}
