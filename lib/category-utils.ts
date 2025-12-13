export type Category = {
    id: string
    name: string
    slug: string
    parent_id: string | null
    image_url: string | null
    children?: Category[]
}

/**
 * Converts a flat list of categories into a recursive tree structure.
 * @param categories Flat array of categories
 * @returns Array of root categories with nested children
 */
export function buildCategoryTree(categories: any[]): Category[] {
    const categoryMap = new Map<string, Category>()
    
    // 1. Initialize map
    categories.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, children: [] })
    })

    const rootCategories: Category[] = []

    // 2. Build tree
    categories.forEach(cat => {
        const category = categoryMap.get(cat.id)!
        if (cat.parent_id) {
            const parent = categoryMap.get(cat.parent_id)
            if (parent) {
                parent.children?.push(category)
            } else {
                // If parent not found (e.g. inactive or deleted), treat as root or handle gracefully
                rootCategories.push(category)
            }
        } else {
            rootCategories.push(category)
        }
    })

    return rootCategories
}
