import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { subscription } = await request.json();

  if (!subscription) {
    return NextResponse.json({ error: "Subscription missing" }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("push_subscriptions" as any).upsert(
    {
      user_id: user.id,
      subscription_json: subscription,
    },
    { onConflict: "user_id" } // Update if already exists for this user
  );

  if (error) {
    console.error("Error saving subscription:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ message: "Subscribed successfully" }, { status: 200 });
}
