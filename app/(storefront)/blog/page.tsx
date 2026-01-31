import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getBlogPosts, getFeaturedPosts } from "@/lib/services/blog-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | Flash Fashion Style Guide & Fashion Tips",
  description:
    "Explore the Flash Fashion blog for anime streetwear style guides, fashion tips, brand stories, and the latest trends in queer and gender-neutral fashion.",
  keywords: [
    "flash fashion blog",
    "anime streetwear guide",
    "fashion tips",
    "style guide",
    "queer fashion blog",
  ],
  openGraph: {
    title: "Flash Fashion Blog | Style Guides & Fashion Tips",
    description:
      "Your source for anime streetwear style guides, fashion tips, and the latest from Flash Fashion.",
    type: "website",
  },
};

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const featuredPosts = await getFeaturedPosts();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="border-primary/50 text-primary">
              FLASH FASHION BLOG
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Style <span className="text-primary">Guide</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fashion tips, brand stories, and the inside scoop on anime
              streetwear culture.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 px-4 border-b border-border/50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <span className="text-primary">★</span> Featured Posts
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group"
                >
                  <Card className="h-full overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 bg-card/50 backdrop-blur">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <span className="text-4xl opacity-50">📝</span>
                    </div>
                    <CardHeader>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <CalendarDays className="h-3 w-3" />
                        {new Date(post.publishedAt).toLocaleDateString(
                          "en-IN",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-8">All Posts</h2>
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <article className="flex gap-6 p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all duration-300 hover:bg-card/50">
                  <div className="hidden sm:flex w-24 h-24 shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg items-center justify-center">
                    <span className="text-2xl opacity-50">📝</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <CalendarDays className="h-3 w-3" />
                      {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      <span className="mx-1">•</span>
                      <Clock className="h-3 w-3" />5 min read
                    </div>
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
