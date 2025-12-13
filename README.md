# FLASH E-commerce (Next.js + Supabase)

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Database Setup

1.  Go to your Supabase Dashboard > **SQL Editor**.
2.  Run the contents of `supabase/schema.sql`.
    - This will create all tables (profiles, categories, products, stock, orders, order_items, feedback).
    - It will also set up Row Level Security (RLS) policies.

### 3. Admin Account Setup

To access the `/admin` panel, you need a user with `role='admin'`.

1.  **Sign Up** a new user through the app (e.g., at `/login` or use Supabase Auth UI).
2.  Go to Supabase Dashboard > **Table Editor** > **profiles**.
3.  Find your user ID and change the `role` column from `user` to `admin`.
4.  Refresh the app. You can now access `/admin`.

### 4. Storage Setup

For product image uploads:

1.  Go to Supabase Dashboard > **Storage**.
2.  Create a new public bucket named `products`.
3.  Add the following policies to the bucket:
    - **SELECT**: Enable for Public.
    - **INSERT**: Enable for Authenticated users with `role='admin'`.

### 5. Running Locally

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Features

- **Storefront**: Responsive UI with Tailwind v4 + Premium dark/light themes.
- **Admin Panel**:
  - Secure `AdminGuard` protection.
  - Dashboard Overview.
  - Category Management (CRUD).
  - Product Management (Search, Image Upload, Variants).
  - Stock Management (Size/Color Quantity).
  - Order Management (Status Updates).
  - Feedback Viewer.
