"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/hooks/use-notifications";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead, clearAll, markAsRead } =
    useNotifications();

  const { user } = useAuth();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Realtime Subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications-bell")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          // Play sound (optional)
          // const audio = new Audio('/sounds/notification.mp3');
          // audio.play().catch(() => {});

          // Show Toast
          toast(payload.new.title, {
            description: payload.new.message,
            action: payload.new.action_url
              ? {
                  label: "View",
                  onClick: () => router.push(payload.new.action_url),
                }
              : undefined,
          });

          // Refresh Data
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, queryClient, router]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors h-10 w-10"
        >
          <Bell
            className={cn(
              "h-5 w-5 transition-all duration-300",
              isOpen && "fill-primary text-primary"
            )}
          />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-background animate-pulse shadow-sm shadow-red-500/50" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[380px] p-0 rounded-3xl shadow-2xl border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden z-50 ring-1 ring-border/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border/50">
          <div className="flex items-center gap-2">
            <h4 className="font-black text-sm uppercase tracking-wider text-foreground">
              Transmissions
            </h4>
            {unreadCount > 0 && (
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-primary/20">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => markAllAsRead()}
                    disabled={unreadCount === 0}
                    className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-30"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark all read</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => clearAll()}
                    disabled={notifications.length === 0}
                    className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear all</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* List */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground p-6 text-center space-y-3">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-2">
                <Bell className="h-8 w-8 opacity-20" />
              </div>
              <div>
                <p className="font-bold text-foreground">All clear</p>
                <p className="text-xs font-medium opacity-70">
                  No new transmissions yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <Link
                  href={n.action_url || "#"}
                  key={n.id}
                  onClick={() => {
                    markAsRead(n.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "relative p-4 border-b border-border/40 hover:bg-muted/50 transition-all group flex gap-3 items-start",
                    !n.is_read
                      ? "bg-primary/[0.03]"
                      : "opacity-80 hover:opacity-100"
                  )}
                >
                  {!n.is_read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-transparent opacity-80" />
                  )}

                  {/* Icon Badge based on Type */}
                  <div
                    className={cn(
                      "shrink-0 mt-0.5 h-8 w-8 rounded-full flex items-center justify-center",
                      n.type === "success"
                        ? "bg-green-500/10 text-green-500"
                        : n.type === "warning"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : n.type === "error"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-primary/10 text-primary"
                    )}
                  >
                    <Bell className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h5
                        className={cn(
                          "text-sm",
                          !n.is_read
                            ? "font-black text-foreground"
                            : "font-semibold text-muted-foreground"
                        )}
                      >
                        {n.title}
                      </h5>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap font-medium">
                        {formatDistanceToNow(new Date(n.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug line-clamp-2 group-hover:text-foreground transition-colors">
                      {n.message}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
