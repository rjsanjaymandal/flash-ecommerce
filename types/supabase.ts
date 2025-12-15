export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          pronouns: string | null
          fit_preference: 'oversized' | 'regular' | 'fitted' | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          pronouns?: string | null
          fit_preference?: 'oversized' | 'regular' | 'fitted' | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          pronouns?: string | null
          fit_preference?: 'oversized' | 'regular' | 'fitted' | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_id: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          parent_id?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          parent_id?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string | null
          name: string
          slug: string
          description: string | null
          price: number
          expression_tags: string[] | null
          size_options: string[] | null
          color_options: string[] | null
          main_image_url: string | null
          gallery_image_urls: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          slug: string
          description?: string | null
          price: number
          expression_tags?: string[] | null
          size_options?: string[] | null
          color_options?: string[] | null
          main_image_url?: string | null
          gallery_image_urls?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          price?: number
          expression_tags?: string[] | null
          size_options?: string[] | null
          color_options?: string[] | null
          main_image_url?: string | null
          gallery_image_urls?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      product_stock: {
        Row: {
          id: string
          product_id: string | null
          size: string
          color: string
          quantity: number
        }
        Insert: {
          id?: string
          product_id?: string | null
          size: string
          color: string
          quantity?: number
        }
        Update: {
          id?: string
          product_id?: string | null
          size?: string
          color?: string
          quantity?: number
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          subtotal: number
          shipping_fee: number
          total: number
          payment_provider: string | null
          payment_reference: string | null
          shipping_name: string | null
          phone: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          state: string | null
          pincode: string | null
          country: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          subtotal: number
          shipping_fee?: number
          total: number
          payment_provider?: string | null
          payment_reference?: string | null
          shipping_name?: string | null
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          subtotal?: number
          shipping_fee?: number
          total?: number
          payment_provider?: string | null
          payment_reference?: string | null
          shipping_name?: string | null
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
