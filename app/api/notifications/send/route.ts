import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import webPush from "@/lib/web-push";

interface PushSubscriptionRow {
  id: string;
  user_id: string;
  subscription_json: any;
  created_at: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { title, message, url } = await request.json();

  // 1. Verify Admin Status
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  // 2. Fetch all subscriptions
  const { data, error } = await supabase
    .from("push_subscriptions" as any)
    .select("*");

  const subscriptions = data as PushSubscriptionRow[] | null;

  if (error || !subscriptions) {
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }

  // 3. Sync with In-App Notification Bell (Transmissions)
  // Fetch all profiles to broadcast to everyone's in-app bell
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id");

  if (profiles && profiles.length > 0) {
    const notificationsToInsert = profiles.map((p) => ({
      user_id: p.id,
      title,
      message,
      type: "info",
      action_url: url || null,
    }));

    // Batch insert notifications
    await supabase.from("notifications").insert(notificationsToInsert);
  }

  // 4. Send Web Push notifications
  const results = await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification(
          sub.subscription_json,
          JSON.stringify({ title, message, url })
        );
        return { id: sub.id, success: true };
      } catch (err: any) {
        console.error(`Error sending to ${sub.id}:`, err);
        // Delete if subscription is no longer valid (410 Gone or 404 Not Found)
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase.from("push_subscriptions" as any).delete().eq("id", sub.id);
          return { id: sub.id, success: false, deleted: true };
        }
        return { id: sub.id, success: false, error: err.message };
      }
    })
  );

  const sentCount = results.filter(r => r.success).length;
  const deletedCount = results.filter(r => r.deleted).length;

  return NextResponse.json({
    message: `Sent to ${sentCount} users. Deleted ${deletedCount} stale subscriptions.`,
    sentCount,
    deletedCount
  });
}
