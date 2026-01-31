"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, ShoppingCart, User, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Mock data - replace with real real-time subscription later
const initialNotifications = [
  {
    id: "1",
    type: "order",
    title: "New Order #1024",
    message: "₹4,500 - John Doe",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "user",
    title: "New Customer Signup",
    message: "sarah.mk@gmail.com joined",
    time: "15 min ago",
    read: false,
  },
  {
    id: "3",
    type: "alert",
    title: "Low Stock Warning",
    message: "Black Hoodie (L) is below 5 units",
    time: "1 hour ago",
    read: true,
  },
];

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 border-2 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-3 p-4 hover:bg-muted/50 transition-colors cursor-default",
                    !notification.read && "bg-blue-50/50 dark:bg-blue-900/10",
                  )}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                      notification.type === "order" &&
                        "bg-green-100 text-green-600 border-green-200",
                      notification.type === "user" &&
                        "bg-blue-100 text-blue-600 border-blue-200",
                      notification.type === "alert" &&
                        "bg-amber-100 text-amber-600 border-amber-200",
                    )}
                  >
                    {notification.type === "order" && (
                      <ShoppingCart className="h-4 w-4" />
                    )}
                    {notification.type === "user" && (
                      <User className="h-4 w-4" />
                    )}
                    {notification.type === "alert" && (
                      <AlertCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
