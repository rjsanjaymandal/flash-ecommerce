-- Phase 3: Deep Performance Optimization Indexes
-- Target: Speed up review loading, concept voting checks, and sales analytics.

-- 1. Optimize product review loading (Product detail pages)
-- This facilitates fast lookup of approved reviews for specific products.
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved ON public.reviews (product_id, is_approved) WHERE is_approved = true;

-- 2. Optimize concept voting (Lab/Voting checks)
-- Accelerates "has this user already voted for this concept" checks.
CREATE INDEX IF NOT EXISTS idx_concept_votes_lookup ON public.concept_votes (user_id, concept_id);

-- 3. Optimize verified purchase lookups and sales analytics
-- Speeds up joins and filters in order_items (common in analytics and review verification).
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items (order_id);

-- 4. Standardize timestamps for sorting across tables
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts (published_at DESC) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews (created_at DESC);
