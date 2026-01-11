import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { Result, ok, err } from '@/lib/utils/result'

type TableName = keyof Database['public']['Tables']
type Row<T extends TableName> = Database['public']['Tables'][T]['Row']
type InsertDto<T extends TableName> = Database['public']['Tables'][T]['Insert']
type UpdateDto<T extends TableName> = Database['public']['Tables'][T]['Update']

export abstract class BaseRepository<T extends TableName> {
  constructor(
    protected readonly supabase: SupabaseClient<Database>,
    protected readonly tableName: T
  ) {}

  /**
   * Find a single record by ID
   */
  async findById(id: string): Promise<Result<Row<T>, string>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('id' as any, id)
        .single()

      if (error) return err(error.message)
      return ok(data as unknown as Row<T>)
    } catch (e: unknown) {
      return err(String(e))
    }
  }

  /**
   * Create a new record
   */
  async create(payload: InsertDto<T>): Promise<Result<Row<T>, string>> {
    try {
        const { data, error } = await this.supabase
            .from(this.tableName)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .insert(payload as any) // Supabase types can be tricky with generics
            .select()
            .single()

        if (error) return err(error.message)
        return ok(data as unknown as Row<T>)
    } catch (e: unknown) {
        return err(String(e))
    }
  }

  /**
   * Update a record by ID
   */
  async update(id: string, payload: UpdateDto<T>): Promise<Result<Row<T>, string>> {
    try {
        const { data, error } = await this.supabase
            .from(this.tableName)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .update(payload as any)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .eq('id' as any, id)
            .select()
            .single()

        if (error) return err(error.message)
        return ok(data as unknown as Row<T>)
    } catch (e: unknown) {
        return err(String(e))
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<Result<boolean, string>> {
      try {
          const { error } = await this.supabase
              .from(this.tableName)
              .delete()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .eq('id' as any, id)
          
          if (error) return err(error.message)
          return ok(true)
      } catch (e: unknown) {
          return err(String(e))
      }
  }
}
