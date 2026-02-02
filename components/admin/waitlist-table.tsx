"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface WaitlistTableProps {
  data: {
    productId: string;
    productName: string;
    thumbnail: string;
    waitlistCount: number;
    lastActivity: string;
  }[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function WaitlistTable({ data, meta }: WaitlistTableProps) {
  const router = useRouter();

  // Helper to trigger CSV download for a specific product
  const handleExport = async (productId: string, productName: string) => {
    // In a real app, this would call an API route that streams the CSV
    // For now, we'll navigate to the detail page which will handle it
    router.push(`/admin/waitlist/${productId}`);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Total Waiting</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No active waitlists found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {item.thumbnail && (
                        <Image
                          src={item.thumbnail}
                          alt={item.productName}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      )}
                      <span>{item.productName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.waitlistCount}</TableCell>
                  <TableCell>
                    {new Date(item.lastActivity).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleExport(item.productId, item.productName)
                      }
                    >
                      <Download className="mr-2 h-4 w-4" />
                      View & Export
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls would go here (omitted for brevity in audit) */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/waitlist?page=${meta.page - 1}`)}
          disabled={meta.page <= 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/waitlist?page=${meta.page + 1}`)}
          disabled={meta.page >= meta.totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
