import { createAdminClient } from "@/lib/supabase/admin";

export async function checkRateLimit(key: string, limit: number, windowSeconds: number) {
  const supabase = createAdminClient();
  
  try {
    const { data: result, error } = await supabase.rpc('check_rate_limit', {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds
    }) as { data: { success: boolean, remaining: number } | null, error: any };

    if (error) {
      console.error('Rate limit check failed:', error);
      // Fail open (allow request) if DB fails, to avoid outage
      return { success: true, remaining: 1 };
    }

    return {
      success: !!result?.success,
      remaining: typeof result?.remaining === 'number' ? result.remaining : 1
    };
  } catch (e) {
    console.error('Rate limit exception:', e);
    return { success: true, remaining: 1 };
  }
}
