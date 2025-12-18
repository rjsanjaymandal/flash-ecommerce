import type { Tables } from '@/types/supabase'

export type Category = Tables<'categories'> & {
  children?: Category[]
}
