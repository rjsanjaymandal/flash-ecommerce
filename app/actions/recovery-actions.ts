"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { AbandonedCartEmail } from "@/components/emails/abandoned-cart-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function findAndRecoverAbandonedCarts() {
  const supabase = createAdminClient();

  // 1. Find cart items updated between 1h and 24h ago
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Fetch unique user_ids from stale cart items
  const { data: staleItems, error } = await supabase
    .from("cart_items")
    .select("user_id")
    .lt("updated_at", oneHourAgo)
    .gt("updated_at", twentyFourHoursAgo);

  if (error) {
    console.error("Error fetching stale carts:", error);
    return { error: "Failed to scan database." };
  }

  if (!staleItems || staleItems.length === 0) {
    return { count: 0, message: "No abandoned carts found in the last 24h." };
  }

  // Deduplicate user IDs
  const uniqueUserIds = Array.from(new Set(staleItems.map((item) => item.user_id)));
  let emailedCount = 0;

  // 2. For each user, fetch email and send notification
  for (const userId of uniqueUserIds) {
    // Get user email from profiles or auth (assuming profiles has email for simplicity, or we use admin.auth)
    // In our schema, profiles doesn't strictly enforce email presence, but usually data is there.
    // Better: Helper to get email from Auth API since profiles might not have it synced perfectly?
    // Actually, `profiles` usually doesn't store email in Supabase defaults, only `auth.users`.
    // We will try `admin.auth.admin.getUser(userId)`
    
    // NOTE: This runs sequentially, which is fine for a manual admin trigger on a small scale.
    // For large scale, use a queue.
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      if (userError || !user || !user.email) {
        console.warn(`Could not find email for user ${userId}`);
        continue;
      }

      const email = user.email;

      // Send Email
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: "Flash Fashion <hello@flashhfashion.in>",
          to: email,
          subject: "You forgot something... 🛒",
          react: AbandonedCartEmail({ userFirstname: user.user_metadata?.first_name || 'Trendsetter' }),
        });
        emailedCount++;
      }
      
    } catch (err) {
      console.error(`Failed to process user ${userId}`, err);
    }
  }

  return { 
    count: emailedCount, 
    message: `Recovery run complete. Sent ${emailedCount} emails.` 
  };
}
