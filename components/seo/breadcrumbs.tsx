import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { BreadcrumbList, WithContext, ListItem } from "schema-dts";

interface BreadcrumbProps {
  items: {
    label: string;
    href: string;
  }[];
}

export function Breadcrumbs({ items }: BreadcrumbProps) {
  // Generate JSON-LD
  const jsonLd: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: process.env.NEXT_PUBLIC_SITE_URL || "https://flashhfashion.in",
      },
      ...items.map((item, index) => ({
        "@type": "ListItem" as const,
        position: index + 2,
        name: item.label,
        item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://flashhfashion.in"}${item.href}`,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="flex items-center text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link
          href="/"
          className="flex items-center hover:text-foreground transition-colors"
          title="Home"
        >
          <Home className="h-4 w-4" />
        </Link>

        {items.map((item, index) => (
          <div key={item.href} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-2 text-border" />
            <Link
              href={item.href as any}
              className={`hover:text-foreground transition-colors ${
                index === items.length - 1 ? "font-medium text-foreground" : ""
              }`}
            >
              {item.label}
            </Link>
          </div>
        ))}
      </nav>
    </>
  );
}
