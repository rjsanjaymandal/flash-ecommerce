import { Organization, WithContext } from "schema-dts";

export function OrganizationJsonLd() {
  const jsonLd: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Flash Fashion",
    alternateName: "FLASH - Premium Anime Streetwear & Queer Clothing India",
    url: "https://flashhfashion.in",
    logo: "https://flashhfashion.in/icon.png",
    sameAs: [
      "https://instagram.com/flashhfashion",
      "https://twitter.com/flashhfashion",
    ],
    description:
      "Flash Fashion is India's premium streetwear brand at the intersection of Japanese anime aesthetic, queer fashion DNA, and intelligent nano-fabric engineering. Designed for all, regardless of gender.",
    slogan: "Unapologetic Style. Intelligent Fabric. Fashion for All.",
    keywords:
      "flash fashion, flash fashion india, anime streetwear, queer fashion, nano fabric, intelligent clothing, gender neutral fashion, harajuku aesthetic",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
  };

  return (
    <script
      id="org-json-ld"
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
