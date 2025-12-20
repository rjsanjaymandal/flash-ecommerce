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
          updated_at: string | null
          user_id: string | null
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
          updated_at?: string | null
          user_id?: string | null
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
          updated_at?: string | null
          user_id?: string | null
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
      product_stock: {
        Row: {
          color: string
          id: string
          product_id: string | null
          quantity: number | null
          size: string
        }
        Insert: {
          color: string
          id?: string
          product_id?: string | null
          quantity?: number | null
          size: string
        }
        Update: {
          color?: string
          id?: string
          product_id?: string | null
          quantity?: number | null
          size?: string
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
          main_image_url: string | null
          name: string
          price: number
          size_options: string[] | null
          slug: string
          updated_at: string | null
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
          main_image_url?: string | null
          name: string
          price: number
          size_options?: string[] | null
          slug: string
          updated_at?: string | null
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
          main_image_url?: string | null
          name?: string
          price?: number
          size_options?: string[] | null
          slug?: string
          updated_at?: string | null
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
          }
          Insert: {
            id?: string
            created_at?: string
            product_id: string
            user_id?: string | null
            rating: number
            comment?: string | null
            user_name?: string | null
          }
          Update: {
            id?: string
            created_at?: string
            product_id?: string
            user_id?: string | null
            rating?: number
            comment?: string | null
            user_name?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      fit_preference_type: "oversized" | "regular" | "fitted"
      order_status: "pending" | "paid" | "shipped" | "delivered" | "cancelled"
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

      order_status: ["pending", "paid", "shipped", "delivered", "cancelled"],
      user_role: ["user", "admin"],
      discount_type: ["percentage", "fixed"],
    },
  },
} as const
