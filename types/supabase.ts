export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          phone: string
          pincode: string
          state: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          phone: string
          pincode: string
          state: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          phone?: string
          pincode?: string
          state?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      cart_items: {
        Row: {
          color: string
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          size: string
          updated_at: string | null
          user_id: string
          fit: string
        }
        Insert: {
          color: string
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          size: string
          updated_at?: string | null
          user_id: string
          fit?: string
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          size?: string
          updated_at?: string | null
          user_id?: string
          fit?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_globals: {
        Row: {
          key: string
          value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          key: string
          value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
           {
             foreignKeyName: "content_globals_updated_by_fkey"
             columns: ["updated_by"]
             isOneToOne: false
             referencedRelation: "profiles"
             referencedColumns: ["id"]
           }
         ]
       }
      coupons: {
        Row: {
          id: string
          created_at: string
          code: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          value: number
          active: boolean | null
          max_uses: number | null
          used_count: number | null
          expires_at: string | null
          min_order_amount: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          code: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          value: number
          active?: boolean | null
          max_uses?: number | null
          used_count?: number | null
          expires_at?: string | null
          min_order_amount?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          code?: string
          discount_type?: Database["public"]["Enums"]["discount_type"]
          value?: number
          active?: boolean | null
          max_uses?: number | null
          used_count?: number | null
          expires_at?: string | null
          min_order_amount?: number | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          message: string | null
          topic: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          topic?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          topic?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color: string | null
          id: string
          name_snapshot: string | null
          order_id: string | null
          product_id: string | null
          quantity: number
          size: string | null
          unit_price: number
          fit: string | null
        }
        Insert: {
          color?: string | null
          id?: string
          name_snapshot?: string | null
          order_id?: string | null
          product_id?: string | null
          quantity: number
          size?: string | null
          unit_price: number
          fit?: string | null
        }
        Update: {
          color?: string | null
          id?: string
          name_snapshot?: string | null
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          size?: string | null
          unit_price?: number
          fit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          coupon_code: string | null
          created_at: string | null
          discount_amount: number | null
          id: string
          payment_provider: string | null
          payment_reference: string | null
          phone: string | null
          pincode: string | null
          shipping_fee: number | null
          shipping_name: string | null
          state: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
          payment_method: string | null
          paid_amount: number | null
          due_amount: number | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          payment_provider?: string | null
          payment_reference?: string | null
          phone?: string | null
          pincode?: string | null
          shipping_fee?: number | null
          shipping_name?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          payment_method?: string | null
          paid_amount?: number | null
          due_amount?: number | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          payment_provider?: string | null
          payment_reference?: string | null
          phone?: string | null
          pincode?: string | null
          shipping_fee?: number | null
          shipping_name?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          payment_method?: string | null
          paid_amount?: number | null
          due_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_colors: {
        Row: {
          id: string
          name: string
          hex_code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          hex_code: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          hex_code?: string
          created_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          cover_image: string | null
          author_id: string | null
          category: string | null
          published_at: string | null
          created_at: string
          updated_at: string
          is_published: boolean
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          excerpt?: string | null
          cover_image?: string | null
          author_id?: string | null
          category?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
          is_published?: boolean
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          cover_image?: string | null
          author_id?: string | null
          category?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
          is_published?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      product_stock: {
        Row: {
          color: string
          id: string
          product_id: string | null
          quantity: number | null
          size: string
          fit: string
          sku: string | null
          cost_price: number | null
        }
        Insert: {
          color: string
          id?: string
          product_id?: string | null
          quantity?: number | null
          size: string
          fit?: string
          sku?: string | null
          cost_price?: number | null
        }
        Update: {
          color?: string
          id?: string
          product_id?: string | null
          quantity?: number | null
          size?: string
          fit?: string
          sku?: string | null
          barcode?: string | null
          cost_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          color_options: string[] | null
          created_at: string | null
          description: string | null
          expression_tags: string[] | null
          gallery_image_urls: string[] | null
          id: string
          is_active: boolean | null
          is_carousel_featured: boolean | null
          main_image_url: string | null
          name: string
          price: number
          total_stock: number | null
          original_price: number | null
          size_options: string[] | null
          fit_options: string[] | null
          slug: string
          updated_at: string | null
          status: "draft" | "active" | "archived" | null
          seo_title: string | null
          seo_description: string | null
          sku: string | null
          cost_price: number | null
        }
        Insert: {
          category_id?: string | null
          color_options?: string[] | null
          created_at?: string | null
          description?: string | null
          expression_tags?: string[] | null
          gallery_image_urls?: string[] | null
          id?: string
          is_active?: boolean | null
          is_carousel_featured?: boolean | null
          main_image_url?: string | null
          name: string
          price: number
          total_stock?: number | null
          original_price?: number | null
          size_options?: string[] | null
          fit_options?: string[] | null
          slug: string
          updated_at?: string | null
          status?: "draft" | "active" | "archived" | null
          seo_title?: string | null
          seo_description?: string | null
          sku?: string | null
          cost_price?: number | null
        }
        Update: {
          category_id?: string | null
          color_options?: string[] | null
          created_at?: string | null
          description?: string | null
          expression_tags?: string[] | null
          gallery_image_urls?: string[] | null
          id?: string
          is_active?: boolean | null
          is_carousel_featured?: boolean | null
          main_image_url?: string | null
          name?: string
          price?: number
          total_stock?: number | null
          original_price?: number | null
          size_options?: string[] | null
          slug?: string
          updated_at?: string | null
          status?: "draft" | "active" | "archived" | null
          seo_title?: string | null
          seo_description?: string | null
          sku?: string | null
          cost_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      concepts: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          image_url: string
          vote_count: number
          vote_goal: number
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          image_url: string
          vote_count?: number
          vote_goal?: number
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          image_url?: string
          vote_count?: number
          vote_goal?: number
          status?: string
        }
        Relationships: []
      }
      concept_votes: {
        Row: {
          user_id: string
          concept_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          concept_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          concept_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "concept_votes_concept_id_fkey"
            columns: ["concept_id"]
            isOneToOne: false
            referencedRelation: "concepts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concept_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          fit_preference:
            | Database["public"]["Enums"]["fit_preference_type"]
            | null
          id: string
          loyalty_points: number | null
          name: string | null
          pronouns: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fit_preference?:
            | Database["public"]["Enums"]["fit_preference_type"]
            | null
          id: string
          loyalty_points?: number | null
          name?: string | null
          pronouns?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fit_preference?:
            | Database["public"]["Enums"]["fit_preference_type"]
            | null
          id?: string
          loyalty_points?: number | null
          name?: string | null
          pronouns?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
          Row: {
            id: string
            created_at: string
            product_id: string
            user_id: string | null
            rating: number
            comment: string | null
            user_name: string | null
            is_featured: boolean
            reply_text: string | null
            media_urls: string[] | null
            is_approved: boolean
            is_verified: boolean
          }
          Insert: {
            id?: string
            created_at?: string
            product_id: string
            user_id?: string | null
            rating: number
            comment?: string | null
            user_name?: string | null
            is_featured?: boolean
            reply_text?: string | null
            media_urls?: string[] | null
            is_approved?: boolean
            is_verified?: boolean
          }
          Update: {
            id?: string
            created_at?: string
            product_id?: string
            user_id?: string | null
            rating?: number
            comment?: string | null
            user_name?: string | null
            is_featured?: boolean
            reply_text?: string | null
            media_urls?: string[] | null
            is_approved?: boolean
            is_verified?: boolean
          }
          Relationships: [
            {
              foreignKeyName: "reviews_product_id_fkey"
              columns: ["product_id"]
              isOneToOne: false
              referencedRelation: "products"
              referencedColumns: ["id"]
            },
            {
              foreignKeyName: "reviews_user_id_fkey"
              columns: ["user_id"]
              isOneToOne: false
              referencedRelation: "profiles"
              referencedColumns: ["id"]
            }
          ]
      }
      newsletter_subscribers: {
          Row: {
            id: string
            created_at: string
            email: string
          }
          Insert: {
            id?: string
            created_at?: string
            email: string
          }
          Update: {
            id?: string
            created_at?: string
            email?: string
          }
          Relationships: []
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          message: string
          is_read: boolean
          action_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          message: string
          is_read?: boolean
          action_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          message?: string
          is_read?: boolean
          action_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      preorders: {
        Row: {
          id: string
          created_at: string
          user_id: string
          product_id: string
          email: string
          user_name: string | null
          notified_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          product_id: string
          email: string
          user_name?: string | null
          notified_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          product_id?: string
          email?: string
          user_name?: string | null
          notified_at?: string | null
        }
        Relationships: [
            {
                foreignKeyName: "preorders_product_id_fkey"
                columns: ["product_id"]
                isOneToOne: false
                referencedRelation: "products"
                referencedColumns: ["id"]
            },
            {
                foreignKeyName: "preorders_user_id_fkey"
                columns: ["user_id"]
                isOneToOne: false
                referencedRelation: "profiles"
                referencedColumns: ["id"]
            }
        ]
      }
      webhook_events: {
        Row: {
            id: string
            created_at: string
            event_id: string
            event_type: string
            processed: boolean
            processing_error?: string | null
            payload: Json
        }
        Insert: {
            id?: string
            created_at?: string
            event_id: string
            event_type: string
            processed?: boolean
            processing_error?: string | null
            payload: Json
        }
        Update: {
            id?: string
            created_at?: string
            event_id?: string
            event_type?: string
            processed?: boolean
            processing_error?: string | null
            payload?: Json
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          id: string
          created_at: string
          severity: string
          component: string
          message: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          severity: string
          component: string
          message: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          severity?: string
          component?: string
          message?: string
          metadata?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      products_with_stats: {
        Row: Database["public"]["Tables"]["products"]["Row"] & {
          average_rating_calculated: number | null
          review_count_calculated: number | null
        }
        Insert: never
        Update: never
        Relationships: []
      }
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      search_products_v2: {
        Args: {
          query_text: string
          limit_val?: number
        }
        Returns: {
          id: string
          name: string
          price: number
          main_image_url: string | null
          slug: string
          rank: number
        }[]
      }
      get_trending_products: {
        Args: {
          limit_val?: number
        }
        Returns: Database["public"]["Tables"]["products"]["Row"][]
      }
      reserve_stock: {
        Args: {
          p_order_id: string
        }
        Returns: Json
      }
      finalize_payment_v3: {
        Args: {
          p_order_id: string
          p_payment_id: string
          p_amount_paid: number
        }
        Returns: Json
      }
      finalize_payment_v5: {
        Args: {
          p_order_id: string
          p_payment_id: string
          p_amount_paid_paise: number
          p_method: string
        }
        Returns: Json
      }
      process_payment: {
        Args: {
          p_order_id: string
          p_payment_id: string
        }
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          p_key: string
          p_limit: number
          p_window_seconds: number
        }
        Returns: Json
      }
      get_analytics_summary: {
        Args: {
          start_date: string
          end_date: string
        }
        Returns: {
          total_revenue: number
          total_orders: number
          average_order_value: number
          returning_customer_percentage: number
        }[]
      }
      get_sales_over_time: {
        Args: {
          start_date: string
          end_date: string
          interval_val?: string
        }
        Returns: {
          date_bucket: string
          total_sales: number
          order_count: number
        }[]
      }
      get_top_products_by_revenue: {
        Args: {
          start_date: string
          end_date: string
          limit_val?: number
        }
        Returns: {
          product_id: string
          name: string
          revenue: number
          units_sold: number
        }[]
      }
    }
    Enums: {
      fit_preference_type: "oversized" | "regular" | "fitted"
      order_status: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "confirmed_partial"
      user_role: "user" | "admin"
      discount_type: "percentage" | "fixed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      fit_preference_type: ["oversized", "regular", "fitted"],

      order_status: ["pending", "paid", "shipped", "delivered", "cancelled", "confirmed_partial"],
      user_role: ["user", "admin"],
      discount_type: ["percentage", "fixed"],
    },
  },
} as const
