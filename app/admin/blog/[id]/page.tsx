import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { BlogPostForm } from "../blog-post-form";
import type { BlogPost } from "@/lib/services/blog-admin-service";

export const revalidate = 0;

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({
  params,
}: EditBlogPostPageProps) {
  const { id } = await params;

  let post: BlogPost | null = null;
  try {
    const supabase = createAdminClient();
    const { data, error } = await (supabase as any)
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      post = data;
    }
  } catch (error) {
    console.error("[EditBlogPostPage] Error:", error);
  }

  if (!post) {
    notFound();
  }

  return <BlogPostForm initialData={post} />;
}
