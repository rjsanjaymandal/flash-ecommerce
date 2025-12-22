/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://flashhfashion.in",
  generateRobotsTxt: true,
  exclude: [
    "/admin",
    "/admin/*",
    "/server-sitemap.xml",
    "/icon",
    "/manifest.webmanifest",
  ],

  // Generate dynamic paths
  additionalPaths: async (config) => {
    const result = [];

    // 1. Add static pages manually (since they are SSR and might be missed)
    const staticPages = ["/", "/shop", "/account", "/about", "/contact"];

    for (const page of staticPages) {
      result.push({
        loc: page,
        changefreq: "daily",
        priority: page === "/" ? 1.0 : 0.7,
        lastmod: new Date().toISOString(),
      });
    }

    // 2. Fetch Products for dynamic paths
    try {
      // Load env vars
      require("dotenv").config({ path: ".env.local" });
      const { createClient } = require("@supabase/supabase-js");

      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data: products } = await supabase
          .from("products")
          .select("slug, updated_at");

        if (products) {
          for (const product of products) {
            result.push({
              loc: `/product/${product.slug}`,
              changefreq: "daily",
              priority: 0.9,
              lastmod: product.updated_at || new Date().toISOString(),
            });
          }
        }
      }
    } catch (e) {
      console.warn("Failed to fetch dynamic products for sitemap:", e);
    }

    return result;
  },
};
