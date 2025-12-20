import { WithContext, ItemList } from 'schema-dts'

interface ItemListJsonLdProps {
    products: {
        name: string
        image: string
        url: string
        price: number
        currency?: string
    }[]
}

export function ItemListJsonLd({ products }: ItemListJsonLdProps) {
    const jsonLd: WithContext<ItemList> = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: products.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Product',
                name: product.name,
                image: product.image,
                url: product.url,
                offers: {
                    '@type': 'Offer',
                    price: product.price,
                    priceCurrency: product.currency || 'INR'
                }
            }
        }))
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}
