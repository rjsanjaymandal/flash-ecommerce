-- Rate Limiting Table
-- Uses Supabase as a store for rate limits (since we don't have Redis)
-- Cleanup policy: Rows expire after 1 hour (cron job or lazy delete)

CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY, -- e.g. 'checkout:user_id' or 'ip:127.0.0.1'
    points INTEGER DEFAULT 0,
    reset_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Service role only
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.rate_limits TO service_role;

-- Function to check and increment rate limit atomically
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_record RECORD;
  v_now TIMESTAMPTZ := NOW();
  v_reset_time TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_record FROM public.rate_limits WHERE key = p_key;

  IF v_record IS NULL OR v_record.reset_at < v_now THEN
    -- New window or first time
    INSERT INTO public.rate_limits (key, points, reset_at)
    VALUES (p_key, 1, v_now + (p_window_seconds || ' seconds')::INTERVAL)
    ON CONFLICT (key) DO UPDATE
    SET points = 1, reset_at = EXCLUDED.reset_at;
    
    RETURN jsonb_build_object('success', true, 'remaining', p_limit - 1);
  ELSE
    -- Inside window
    IF v_record.points >= p_limit THEN
      RETURN jsonb_build_object('success', false, 'remaining', 0);
    ELSE
      UPDATE public.rate_limits 
      SET points = points + 1 
      WHERE key = p_key;
      RETURN jsonb_build_object('success', true, 'remaining', p_limit - v_record.points - 1);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;
