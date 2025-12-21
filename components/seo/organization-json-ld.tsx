import { Organization, WithContext } from 'schema-dts'

export function OrganizationJsonLd() {
  const jsonLd: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FLASH',
    url: 'https://flashhfashion.in',
    logo: 'https://flashhfashion.in/icon.png',
    sameAs: [
        'https://instagram.com/flashhfashion',
        'https://twitter.com/flashhfashion'
    ],
    contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-9876543210',
        contactType: 'customer service',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi']
    }
  }

  return (
    <script
      id="org-json-ld"
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
