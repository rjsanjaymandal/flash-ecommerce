import { WebSite, WithContext } from "schema-dts";

export function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FLASH",
    url: "https://flashhfashion.in",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://flashhfashion.in/shop?search={search_term_string}",
      } as any,
      "query-input": "required name=search_term_string",
    } as any,
  } as WithContext<WebSite>;

  return (
    <script
      id="website-json-ld"
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
