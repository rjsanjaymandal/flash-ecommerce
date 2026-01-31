"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useQueryState, parseAsInteger } from "nuqs";

interface DataTablePaginationProps {
  totalItems: number;
  itemsPerPage?: number;
}

export function DataTablePagination({
  totalItems,
  itemsPerPage = 10,
}: DataTablePaginationProps) {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({
      shallow: false,
      history: "push",
    }),
  );

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // If no pages or just 1, logic depends on preference.
  // Usually we show it but disable buttons, or hide. Let's show disabled.

  return (
    <div className="flex items-center justify-between px-2">
      <div className="hidden sm:flex w-[100px] text-sm font-medium text-muted-foreground">
        Total {totalItems}
      </div>
      <div className="flex items-center sm:space-x-6 lg:space-x-8">
        <div className="text-sm font-medium">
          Page {page} of {totalPages || 1}
        </div>
        <Pagination className="w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className="cursor-pointer"
                onClick={() => setPage(Math.max(1, page - 1))}
                aria-disabled={page <= 1}
                // Shadcn PaginationPrevious is an <a> tag style, so we prevent default if needed
                // but since we are handling onClick with nuqs, it works fine as a button-like interaction
                // We might want to style it as disabled if page <= 1
                style={page <= 1 ? { pointerEvents: "none", opacity: 0.5 } : {}}
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                className="cursor-pointer"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                aria-disabled={page >= totalPages}
                style={
                  page >= totalPages
                    ? { pointerEvents: "none", opacity: 0.5 }
                    : {}
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
