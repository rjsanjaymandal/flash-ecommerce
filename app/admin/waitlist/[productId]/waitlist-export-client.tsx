"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Entry {
  userId: string;
  email: string;
  name: string;
  joinedAt: string;
}

interface WaitlistExportClientProps {
  data: Entry[];
  productName: string;
}

export function WaitlistExportClient({
  data,
  productName,
}: WaitlistExportClientProps) {
  const handleDownloadCSV = () => {
    const headers = ["User ID,Name,Email,Joined At"];
    const rows = data.map(
      (e) => `${e.userId},"${e.name}",${e.email},${e.joinedAt}`,
    );
    const csvContent =
      "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${productName.replace(/\s+/g, "_")}_waitlist.csv`,
    );
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleDownloadCSV}>
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Joined At</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>User ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((entry) => (
              <TableRow key={entry.userId}>
                <TableCell>
                  {new Date(entry.joinedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{entry.name}</TableCell>
                <TableCell>{entry.email}</TableCell>
                <TableCell className="font-mono text-xs">
                  {entry.userId}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
