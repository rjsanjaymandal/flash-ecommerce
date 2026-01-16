-- Migration: Partial COD Schema
-- Purpose: Add support for split payments (book now, pay rest later).

-- 1. Update Order Status Enum
-- Note: PostgreSQL doesn't allow adding values to enums inside transactions easily, 
-- but Supabase migrations handle this. We add 'confirmed_partial' for Partial COD.
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'confirmed_partial' AFTER 'pending';

-- 2. Add Payment Columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'PREPAID',
ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS due_amount NUMERIC DEFAULT 0;

-- 3. Add constraint for payment_method
ALTER TABLE orders 
ADD CONSTRAINT check_payment_method 
CHECK (payment_method IN ('PREPAID', 'COD', 'PARTIAL_COD'));

-- 4. Audit Log
INSERT INTO system_logs (severity, component, message)
VALUES ('INFO', 'MIGRATION', 'Partial COD schema applied');
