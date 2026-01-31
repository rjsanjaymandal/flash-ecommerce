"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter((segment) => segment !== "");

  // Remove "admin" from the segments if it is the first one, as we handle it separately
  const displaySegments =
    segments[0] === "admin" ? segments.slice(1) : segments;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center space-x-2 text-sm text-muted-foreground mb-4 sm:mb-0"
    >
      <Link
        href="/admin"
        className="flex items-center gap-1 hover:text-primary transition-colors font-medium"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Dashboard</span>
      </Link>

      {displaySegments.length > 0 && (
        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
      )}

      {displaySegments.map((segment, index) => {
        const isLast = index === displaySegments.length - 1;
        const href = `/admin/${displaySegments.slice(0, index + 1).join("/")}`;

        // Format segment: "admin-coupons" -> "Admin Coupons"
        const label = segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        return (
          <Fragment key={href}>
            {isLast ? (
              <span className="font-semibold text-foreground">{label}</span>
            ) : (
              <Link
                href={href}
                className="hover:text-primary transition-colors font-medium"
              >
                {label}
              </Link>
            )}
            {!isLast && (
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
