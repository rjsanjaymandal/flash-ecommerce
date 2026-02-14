"use client";

import { AdminBreadcrumbs } from "./admin-breadcrumbs";
import { NotificationsDropdown } from "./notifications-dropdown";
import { AdminCommandPalette } from "./command-palette";

export function AdminHeader() {
  return (
    <header className="hidden sm:flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 sticky top-0 z-30 w-full">
      <div className="flex items-center gap-4 flex-1">
        <AdminBreadcrumbs />
      </div>

      <div className="flex items-center gap-4">
        <AdminCommandPalette />

        <div className="h-6 w-px bg-border mx-2 hidden md:block" />

        <NotificationsDropdown />
      </div>
    </header>
  );
}
