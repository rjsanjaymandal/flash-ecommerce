'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/utils'

export type AuditLog = {
  id: string
  admin_id: string
  action_type: string
  table_name: string
  record_id: string
  changes: any
  ip_address: string
  created_at: string
  admin?: {
    email: string
  }
}

export async function getRecentAuditLogs(limit = 10) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('admin_audit_logs' as any)
      .select('*, admin:profiles(email)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    // @ts-ignore: Complex Supabase type mismatch due to dynamic table name
    return (data || []) as AuditLog[]
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
    return []
  }
}

export async function getSystemHealth() {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const start = Date.now()
    const { error } = await supabase.from('profiles').select('id').limit(1)
    const latency = Date.now() - start

    return {
      database: error ? 'down' : 'operational',
      latency: `${latency}ms`,
      status: error ? 'degraded' : 'healthy'
    }
  } catch (error) {
    return {
      database: 'error',
      latency: 'N/A',
      status: 'down'
    }
  }
}
