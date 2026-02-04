import { Metadata } from "next";
import { WithContext, Article } from "schema-dts";

export const metadata: Metadata = {
  title: "What is FlashhFashion? | The Meaning Behind the Double H",
  description:
    "Discover the story of FlashhFashion (Flash Fashion). Why the double H? It stands for Heavyweight & Heritage. The ultimate guide to India's premier anime streetwear brand.",
  keywords: [
    "what is flashhfashion",
    "flashhfashion meaning",
    "flashh fashion vs flash fashion",
    "flashhfashion clothing brand",
    "flashhfashion india",
  ],
  openGraph: {
    title: "What is FlashhFashion? The Story Behind the Brand",
    description:
      "It's not a typo. It's a statement. FlashhFashion = Heavyweight + Heritage.",
    type: "article",
  },
};

export default function FlashhFashionDefinitionPage() {
  const jsonLd: WithContext<Article> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "What is FlashhFashion?",
    description:
      "The definitive guide to the brand name FlashhFashion and its roots in Indian Streetwear culture.",
    author: {
      "@type": "Organization",
      name: "FlashhFashion Team",
    },
    publisher: {
      "@type": "Organization",
      name: "Flash Fashion",
      logo: {
        "@type": "ImageObject",
        url: "https://flashhfashion.in/icon.png",
      },
    },
    mainEntityOfPage: "https://flashhfashion.in/flashh-fashion",
    datePublished: "2026-02-01",
    dateModified: new Date().toISOString(),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen pt-32 pb-20 container mx-auto px-4 max-w-3xl">
        <article className="prose prose-zinc dark:prose-invert lg:prose-xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-8">
            What is <span className="text-primary">FlashhFashion</span>?
          </h1>

          <p className="lead text-xl md:text-2xl font-medium text-muted-foreground mb-12">
            You might have seen it written as <strong>Flash Fashion</strong> or{" "}
            <strong>FlashhFashion</strong>. Is it a typo? No. It&apos;s a code.
          </p>

          <hr className="my-12 border-zinc-200 dark:border-zinc-800" />

          <h2 className="text-3xl font-bold uppercase tracking-tight">
            The Double &apos;H&apos; Meaning
          </h2>
          <p>
            <strong>FlashhFashion</strong> (pronounced <em>Flash-Fashion</em>)
            is the official identity of India&apos;s fastest-growing Anime
            Streetwear ecosystem. The extra &apos;H&apos; isn&apos;t improper
            grammar—it stands for our two core pillars:
          </p>

          <div className="grid md:grid-cols-2 gap-6 my-12 not-prose">
            <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-2xl font-black uppercase mb-2 text-emerald-600">
                01. Heavyweight
              </h3>
              <p className="text-muted-foreground">
                We don&apos;t do cheap fabric. Every{" "}
                <strong>FlashhFashion</strong> tee is crafted directly from
                240-280 GSM French Terry Cotton. It falls heavy, sits right, and
                lasts forever.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-2xl font-black uppercase mb-2 text-violet-600">
                02. Heritage
              </h3>
              <p className="text-muted-foreground">
                We are building a legacy. <strong>FlashhFashion</strong>{" "}
                combines Japanese Anime culture with Indian manufacturing
                excellence.
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-bold uppercase tracking-tight">
            Why &quot;Flashh&quot; Matters
          </h2>
          <p>
            In a world of fast fashion, <strong>FlashhFashion</strong> slows
            things down. When you search for <em>Flash Fashion</em>, you find
            clothes. When you search for <strong>FlashhFashion</strong>, you
            find a community of rebels, otaku, and trendsetters.
          </p>

          <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 italic text-xl">
            &quot;FlashhFashion is not just a brand name. It is a promise of
            quality that weighs heavy on the body and light on the
            conscience.&quot;
          </blockquote>

          <h3 className="text-2xl font-bold uppercase mt-12">
            Official Designations
          </h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Official Name</strong>: FlashhFashion
            </li>
            <li>
              <strong>Common Name</strong>: Flash Fashion
            </li>
            <li>
              <strong>Industry Category</strong>: Premium Anime Streetwear
            </li>
            <li>
              <strong>Origin</strong>: India (2025)
            </li>
          </ul>
        </article>
      </div>
    </>
  );
}
