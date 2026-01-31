import { ImageResponse } from "next/og";
import { createEdgeClient } from "@/lib/supabase/opengraph-client";

export const runtime = "edge";

export const alt = "Flash Fashion Blog";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const slug = (await params).slug;
  const supabase = createEdgeClient();

  // Fetch blog data
  const { data: post } = await (supabase as any)
    .from("blog_posts")
    .select("title, author, published_at")
    .eq("slug", slug)
    .single();

  const title = post?.title || "Flash Fashion Blog";
  const author = post?.author || "Flash Team";

  // Format Date
  const date = post?.published_at
    ? new Date(post.published_at).toLocaleDateString("en-IN", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(to bottom right, #09090b, #18181b)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: 80,
        fontFamily: "sans-serif",
        color: "white",
      }}
    >
      {/* Top: Brand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: "-0.05em",
          }}
        >
          FLASH
        </div>
        <div
          style={{
            height: 30,
            width: 2,
            background: "#52525b",
          }}
        />
        <div
          style={{
            fontSize: 24,
            color: "#a1a1aa",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          BLOG
        </div>
      </div>

      {/* Middle: Title */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          maxWidth: "90%",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1.1,
            background: "linear-gradient(to bottom right, #ffffff, #d4d4d8)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 15,
            marginTop: 20,
          }}
        >
          {/* Author Badge */}
          <div
            style={{
              padding: "8px 20px",
              borderRadius: 40,
              background: "rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />
            {author}
          </div>

          {/* Date Badge */}
          <div
            style={{
              fontSize: 20,
              color: "#a1a1aa",
            }}
          >
            • {date}
          </div>
        </div>
      </div>

      {/* Bottom: Read CTA */}
      <div
        style={{
          fontSize: 24,
          color: "#a1a1aa",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        Read more on flashhfashion.in
      </div>
    </div>,
    {
      ...size,
    },
  );
}
