'use server'

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT'

export async function logAdminAction(
  tableName: string,
  recordId: string,
  action: ActionType,
  changes?: Record<string, any>
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return // Should not happen in admin actions

    // Get IP address (best effort)
    const headerList = await headers()
    const ip = headerList.get("x-forwarded-for") || "unknown"

    // @ts-ignore: Table exists in DB but types are not regenerated
    await supabase.from('admin_audit_logs' as any).insert({
      admin_id: user.id,
      action_type: action,
      table_name: tableName,
      record_id: recordId,
      changes: changes, // JSONB
      ip_address: ip
    })
  } catch (error) {
    // Audit logging should not break the main transaction, but we log the failure to system logs
    console.error('Failed to log admin action:', error)
  }
}
