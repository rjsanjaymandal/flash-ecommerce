import { CollectionPage, WithContext } from "schema-dts";

interface CollectionJsonLdProps {
  name: string;
  description: string;
  url: string;
}

export function CollectionJsonLd({
  name,
  description,
  url,
}: CollectionJsonLdProps) {
  const jsonLd: WithContext<CollectionPage> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
