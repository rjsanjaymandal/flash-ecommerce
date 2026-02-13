import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getBlogPost,
  getAllBlogSlugs,
  getBlogPosts,
} from "@/lib/services/blog-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays, Clock, Share2 } from "lucide-react";
import { ArticleJsonLd } from "@/components/seo/article-json-ld";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: ["flash fashion", ...post.tags],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getBlogPosts();
  const relatedPosts = allPosts
    .filter((p) => p.slug !== post.slug)
    .filter((p) => p.tags.some((tag) => post.tags.includes(tag)))
    .slice(0, 2);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          {
            name: "Home",
            item:
              process.env.NEXT_PUBLIC_SITE_URL || "https://flashhfashion.in",
          },
          {
            name: "Blog",
            item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://flashhfashion.in"}/blog`,
          },
          {
            name: post.title,
            item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://flashhfashion.in"}/blog/${post.slug}`,
          },
        ]}
      />
      <ArticleJsonLd post={post} />

      <article className="min-h-screen">
        {/* Header */}
        <header className="relative py-16 px-4 bg-linear-to-br from-zinc-900 via-black to-zinc-900">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="container mx-auto max-w-4xl relative z-10">
            <Link href="/blog">
              <Button
                variant="ghost"
                size="sm"
                className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-primary/50 text-primary"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                {post.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />5 min read
                </div>
                <span className="text-foreground font-medium">
                  {post.author}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="prose prose-lg prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-strong:text-foreground max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: renderContent(post.content || ""),
                }}
              />
            </div>

            {/* Share */}
            <div className="mt-12 pt-8 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-12 px-4 border-t border-border/50 bg-card/30">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-xl font-bold mb-6">Related Posts</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group"
                  >
                    <div className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all">
                      <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {related.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}

// Render content - detects if content is HTML or markdown
function renderContent(content: string): string {
  // If content starts with HTML tags, assume it's from the rich text editor
  if (
    content.trim().startsWith("<") ||
    content.includes("<p>") ||
    content.includes("<h1>")
  ) {
    return content;
  }

  // Otherwise, parse as markdown
  return parseMarkdown(content);
}

// Simple markdown parser (basic implementation)
function parseMarkdown(content: string): string {
  return (
    content
      // Headers
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      // Links
      .replace(
        /\[(.*?)\]\((.*?)\)/gim,
        '<a href="$2" target="_blank" rel="noopener">$1</a>',
      )
      // Horizontal rule
      .replace(/^---$/gim, "<hr />")
      // Lists
      .replace(/^\- (.*$)/gim, "<li>$1</li>")
      // Tables (basic)
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match
          .split("|")
          .filter(Boolean)
          .map((cell) => cell.trim());
        if (cells.every((cell) => cell.match(/^-+$/))) return "";
        return (
          "<tr>" + cells.map((cell) => `<td>${cell}</td>`).join("") + "</tr>"
        );
      })
      // Paragraphs
      .replace(/\n\n/g, "</p><p>")
      .replace(/^(?!<)(.+)$/gim, "<p>$1</p>")
      // Clean up
      .replace(/<p><\/p>/g, "")
      .replace(/<p>(<h[1-6]>)/g, "$1")
      .replace(/(<\/h[1-6]>)<\/p>/g, "$1")
      .replace(/<p>(<li>)/g, "<ul>$1")
      .replace(/(<\/li>)<\/p>/g, "$1</ul>")
  );
}
