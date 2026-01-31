"use client";

import { AdminBreadcrumbs } from "./admin-breadcrumbs";
import { NotificationsDropdown } from "./notifications-dropdown";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function AdminHeader() {
  return (
    <header className="hidden sm:flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 sticky top-0 z-30 w-full">
      <div className="flex items-center gap-4 flex-1">
        <AdminBreadcrumbs />
      </div>

      <div className="flex items-center gap-4">
        {/* Placeholder for Command Palette Trigger */}
        <div className="hidden md:flex relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search... (Cmd+K)"
            className="pl-9 h-9 bg-muted/30 border-muted-foreground/20 focus-visible:ring-1"
            readOnly
          />
        </div>

        <div className="h-6 w-px bg-border mx-2 hidden md:block" />

        <NotificationsDropdown />
      </div>
    </header>
  );
}
