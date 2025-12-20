import { Product, WithContext } from 'schema-dts'

interface ProductJsonLdProps {
  product: any
  reviews?: any[]
}

export function ProductJsonLd({ product, reviews = [] }: ProductJsonLdProps) {
  const customJsonLd: WithContext<Product> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.desktop || product.main_image_url,
    sku: product.id,
    mpn: product.id,
    brand: {
        '@type': 'Brand',
        name: 'FLASH'
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`,
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'IN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn'
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
            '@type': 'MonetaryAmount',
            value: 0,
            currency: 'INR'
        },
        shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'IN'
        },
        deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
                '@type': 'QuantitativeValue',
                minValue: 1,
                maxValue: 2,
                unitCode: 'd'
            },
            transitTime: {
                '@type': 'QuantitativeValue',
                minValue: 3,
                maxValue: 5,
                unitCode: 'd'
            }
        }
      }
    },
  }

  if (reviews.length > 0) {
      const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      
      customJsonLd.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: avgRating.toFixed(1),
          reviewCount: reviews.length
      }

      customJsonLd.review = reviews.slice(0, 5).map(r => ({
          '@type': 'Review',
          reviewRating: {
              '@type': 'Rating',
              ratingValue: r.rating,
              bestRating: 5
          },
          author: {
              '@type': 'Person',
              name: r.profiles?.full_name || 'Anonymous'
          },
          datePublished: r.created_at
      }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(customJsonLd) }}
    />
  )
}
