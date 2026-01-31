import { createAdminClient } from "@/lib/supabase/admin";
import { BlogListClient } from "./blog-list-client";
import type { BlogPost } from "@/lib/services/blog-admin-service";

export const revalidate = 0;

export default async function AdminBlogPage() {
  let posts: BlogPost[] = [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await (supabase as any)
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      posts = data;
    }
  } catch (error) {
    console.error("[AdminBlogPage] Error:", error);
  }

  return <BlogListClient posts={posts} />;
}
