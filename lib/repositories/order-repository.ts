import { BaseRepository } from './base-repository'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database, Tables } from '@/types/supabase'
import { Result, ok, err } from '@/lib/utils/result'

type OrderRow = Database['public']['Tables']['orders']['Row']

export class OrderRepository extends BaseRepository<'orders'> {
  constructor(client: SupabaseClient<Database>) {
    super(client, 'orders')
  }

  /**
   * Fetch all orders for a specific user
   */
  async findByUserId(userId: string): Promise<Result<OrderRow[], string>> {
     try {
         const { data, error } = await this.supabase
             .from('orders')
             .select('*')
             .eq('user_id', userId)
             .order('created_at', { ascending: false })
         
         if (error) return err(error.message)
         return ok(data)
     } catch (e: unknown) {
         return err(String(e))
     }
  }

  /**
   * Find order by ID with its items
   */
  async findWithItems(orderId: string): Promise<Result<OrderRow & { order_items: Tables<'order_items'>[] }, string>> {
      try {
          const { data, error } = await this.supabase
              .from('orders')
              .select('*, order_items(*)')
              .eq('id', orderId)
              .single()
          
          if (error) return err(error.message)
          return ok(data as OrderRow & { order_items: Tables<'order_items'>[] })
      } catch (e: unknown) {
          return err(String(e))
      }
  }
}
