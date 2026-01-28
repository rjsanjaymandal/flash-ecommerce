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

    // 5. Check Push Notifications (VAPID)
    const hasVapid = !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && !!process.env.VAPID_PRIVATE_KEY;
    if (!hasVapid) issues.push("VAPID keys (Push Notifications) are missing.");

    // 6. Check Shipping (Fship)
    const hasFship = !!process.env.FSHIP_CLIENT_ID && !!process.env.FSHIP_SECRET_KEY;
    if (!hasFship) issues.push("Fship (Shipping) keys are missing.");

    // 7. Check Site URL (for Auth Redirects)
    const hasSiteUrl = !!process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.startsWith('http');
    if (!hasSiteUrl) issues.push("NEXT_PUBLIC_SITE_URL is missing or invalid (needed for Auth).");

    // Calculate Score (Recalculated for more keys)
    let points = 0;
    if (status.supabase) points += 25;
    if (status.service_role) points += 15;
    if (status.razorpay) points += 20;
    if (status.email) points += 10;
    if (hasVapid) points += 10;
    if (hasFship) points += 10;
    if (hasSiteUrl) points += 10;
    status.overall_score = Math.min(points, 100);

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
