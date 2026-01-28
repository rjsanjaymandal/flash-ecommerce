
import { createAdminClient } from "@/lib/supabase/admin";

export class NotificationService {
  /**
   * Broadcasts a notification to all administrators.
   * Useful for high-value events like New Orders, Low Stock, etc.
   */
  static async notifyAdmins(
    title: string,
    message: string,
    type: "info" | "success" | "warning" | "error" = "info",
    actionUrl?: string
  ) {
    try {
      const supabase = createAdminClient();

      const { data: admins, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin')

      if (error || !admins || admins.length === 0) {
          console.warn('No admins found to notify or error:', error);
          return;
      }

      const notifications = admins.map(admin => ({
          user_id: admin.id,
          title,
          message,
          type,
          action_url: actionUrl,
          is_read: false
      }));

      const { error: insertError } = await supabase
          .from('notifications')
          .insert(notifications);

      if (insertError) {
          console.error('Failed to notify admins:', insertError);
      } else {
          console.log(`[NotificationService] Notified ${admins.length} admins: ${title}`);
      }
    } catch (err) {
      console.error('[NotificationService] notifyAdmins failed (Suppressed):', err);
    }
  }

  /**
   * Notify a specific user.
   */
  static async notifyUser(
    userId: string,
    title: string,
    message: string,
    type: "info" | "success" | "warning" | "error" = "info",
    actionUrl?: string
  ) {
      try {
        const supabase = createAdminClient();
        await supabase.from('notifications').insert({
            user_id: userId,
            title,
            message,
            type,
            action_url: actionUrl
        });
      } catch (err) {
        console.error('[NotificationService] notifyUser failed (Suppressed):', err);
      }
  }
}
