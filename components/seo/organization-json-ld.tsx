import { ClothingStore, WithContext } from "schema-dts";

export function OrganizationJsonLd() {
  const jsonLd: WithContext<ClothingStore> = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: "Flash Fashion",
    alternateName: [
      "FlashhFashion",
      "Flashh Fashion India",
      "FLASH - Premium Anime Streetwear & Queer Clothing India",
    ],
    url: "https://flashhfashion.in",
    logo: "https://flashhfashion.in/icon.png",
    sameAs: [
      "https://instagram.com/flashhfashion",
      "https://x.com/flashhfashion",
      "https://facebook.com/flashhfashion",
    ],
    description:
      "FLASH is India's premier minimalist luxury label. Discover premium streetwear, heavyweight essentials, and Japanese anime-inspired aesthetic crafted with high-performance fabrics.",
    slogan: "Unapologetic Style. Intelligent Fabric. Cinematic Aesthetic.",
    keywords:
      "clothing brand, printed tshirts, best quality clothing, anime streetwear, queer fashion, nano fabric",
    priceRange: "₹500 - ₹5000",
    paymentAccepted: "Cash, Credit Card, UPI",
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
