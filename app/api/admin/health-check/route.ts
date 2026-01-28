import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Auth Check (Admins only)
    await requireAdmin();

    const issues: string[] = [];
    const status = {
      supabase: false,
      service_role: false,
      razorpay: false,
      email: false,
      overall_score: 0,
      issues: issues,
    };

    // 2. Check Supabase & Service Role
    const supabase = createAdminClient();
    try {
        const { error } = await supabase.from('products').select('id').limit(1);
        if (!error) {
            status.supabase = true;
            status.service_role = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
        } else {
            issues.push("Supabase error: " + error.message);
        }
    } catch (e) {
        issues.push("Supabase connection failed.");
    }

    // 3. Check Razorpay
    const rzpId = !!process.env.RAZORPAY_KEY_ID;
    const rzpSecret = !!process.env.RAZORPAY_KEY_SECRET;
    const rzpWebhook = !!process.env.RAZORPAY_WEBHOOK_SECRET && process.env.RAZORPAY_WEBHOOK_SECRET !== 'your_webhook_secret_here';
    
    status.razorpay = rzpId && rzpSecret && rzpWebhook;
    if (!rzpId) issues.push("RAZORPAY_KEY_ID is missing.");
    if (!rzpSecret) issues.push("RAZORPAY_KEY_SECRET is missing.");
    if (!rzpWebhook) issues.push("RAZORPAY_WEBHOOK_SECRET is missing or using default.");

    // 4. Check Email
    status.email = !!process.env.RESEND_API_KEY;
    if (!status.email) issues.push("RESEND_API_KEY is missing.");

    // Calculate Score
    let points = 0;
    if (status.supabase) points += 40;
    if (status.service_role) points += 20;
    if (status.razorpay) points += 20;
    if (status.email) points += 20;
    status.overall_score = points;

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
