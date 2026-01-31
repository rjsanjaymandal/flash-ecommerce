"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { slugify } from "@/lib/slugify";
import {
  blogPostSchema,
  type BlogPostFormValues,
  type BlogPost,
  createBlogPost,
  updateBlogPost,
} from "@/lib/services/blog-admin-service";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface BlogPostFormProps {
  initialData?: BlogPost;
}

export function BlogPostForm({ initialData }: BlogPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tagInput, setTagInput] = useState("");

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          slug: initialData.slug,
          excerpt: initialData.excerpt || "",
          content: initialData.content,
          cover_image: initialData.cover_image || "",
          author: initialData.author,
          tags: initialData.tags,
          is_published: initialData.is_published,
          is_featured: initialData.is_featured,
        }
      : {
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          cover_image: "",
          author: "Flash Fashion Team",
          tags: [],
          is_published: false,
          is_featured: false,
        },
  });

  const { watch, setValue } = form;
  const title = watch("title");
  const tags = watch("tags");

  // Auto-generate slug from title
  const handleTitleBlur = () => {
    const currentSlug = form.getValues("slug");
    if (!currentSlug && title) {
      setValue("slug", slugify(title), { shouldValidate: true });
    }
  };

  // Handle tag input
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const newTag = tagInput.trim().toLowerCase();
    if (!tags.includes(newTag)) {
      setValue("tags", [...tags, newTag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      tags.filter((t) => t !== tagToRemove),
    );
  };

  const onSubmit = (data: BlogPostFormValues) => {
    startTransition(async () => {
      try {
        const result = initialData
          ? await updateBlogPost(initialData.id, data)
          : await createBlogPost(data);

        if (result.success) {
          toast.success(initialData ? "Post updated!" : "Post created!");
          router.push("/admin/blog");
        } else {
          toast.error("Error: " + result.error);
        }
      } catch (err: any) {
        toast.error("System error: " + err.message);
      }
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 py-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {initialData ? "Edit Post" : "New Post"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {initialData
              ? "Update your blog post."
              : "Create a new blog post for your audience."}
          </p>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
          <Save className="h-4 w-4 mr-2" />
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>
                  The main content of your blog post.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="How to Style Anime Streetwear in 2026"
                          {...field}
                          onBlur={handleTitleBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                            /blog/
                          </span>
                          <Input
                            {...field}
                            className="rounded-l-none font-mono text-sm"
                            placeholder="how-to-style-anime-streetwear"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A short summary that appears in listings and search results..."
                          className="resize-none"
                          rows={2}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        SEO-friendly summary (150-160 characters recommended)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Write your blog post content here..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Publishing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_published"
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Published
                        </FormLabel>
                        <FormDescription>Make visible on site</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border p-3 bg-primary/5 border-primary/20">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Featured
                        </FormLabel>
                        <FormDescription>Show in highlights</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                  )}
                />
              </CardContent>
            </Card>

            {/* Meta */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cover_image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      placeholder="Add tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
