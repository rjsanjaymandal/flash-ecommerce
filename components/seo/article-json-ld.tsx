import { Article, WithContext } from "schema-dts";
import type { BlogPostMeta } from "@/lib/services/blog-service";

interface ArticleJsonLdProps {
  post: BlogPostMeta;
}

export function ArticleJsonLd({ post }: ArticleJsonLdProps) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://flashhfashion.in";

  const jsonLd: WithContext<Article> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage.startsWith("http")
      ? post.coverImage
      : `${siteUrl}${post.coverImage}`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Flash Fashion",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
