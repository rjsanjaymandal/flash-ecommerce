import { ImageResponse } from "next/og";
import { createEdgeClient } from "@/lib/supabase/opengraph-client";

export const runtime = "edge";

export const alt = "Flash Fashion Product";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const slug = (await params).slug;
  const supabase = createEdgeClient();

  // Fetch product data
  const { data: product } = await supabase
    .from("products")
    .select("name, price, main_image_url")
    .eq("slug", slug)
    .single();

  // Fallback if no product found
  const title = product?.name || "Flash Fashion Premium";
  const price = product?.price
    ? `₹${product.price.toLocaleString("en-IN")}`
    : "";
  const imageUrl = product?.main_image_url || null;

  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(to bottom right, #09090b, #18181b)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row", // Side by side layout
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      {/* Left Side: Product Image or Logo */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: 20,
            }}
          />
        ) : (
          <div style={{ fontSize: 80, fontWeight: 900 }}>FLASH</div>
        )}
      </div>

      {/* Right Side: Details */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingRight: 60,
        }}
      >
        {/* Brand Label */}
        <div
          style={{
            fontSize: 24,
            color: "#a1a1aa",
            fontWeight: 700,
            textTransform: "uppercase",
            marginBottom: 20,
            letterSpacing: "0.1em",
          }}
        >
          Flash Fashion
        </div>

        {/* Product Title */}
        <div
          style={{
            fontSize: 60,
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: 30,
            background: "linear-gradient(to right, #ffffff, #a1a1aa)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {title}
        </div>

        {/* Price Badge */}
        {price && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: "white",
              }}
            >
              {price}
            </div>
            <div
              style={{
                padding: "10px 20px",
                background: "white",
                color: "black",
                fontSize: 18,
                fontWeight: 800,
                borderRadius: 50,
                textTransform: "uppercase",
              }}
            >
              In Stock
            </div>
          </div>
        )}
      </div>
    </div>,
    {
      ...size,
    },
  );
}
