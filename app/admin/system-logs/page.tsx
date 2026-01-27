"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Terminal, Info, AlertTriangle, Bug } from "lucide-react";

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("system_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (data) setLogs(data);
      setIsLoading(false);
    };
    fetchLogs();
  }, [supabase]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "ERROR":
        return <Bug className="h-4 w-4 text-destructive" />;
      case "WARN":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "INFO":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Terminal className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityVariant = (
    severity: string,
  ): "destructive" | "secondary" | "outline" | "default" => {
    switch (severity) {
      case "CRITICAL":
      case "ERROR":
        return "destructive";
      case "WARN":
        return "secondary";
      case "INFO":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase tracking-tighter">
          System <span className="text-muted-foreground">Logs</span>
        </h1>
        <Badge variant="outline" className="font-mono">
          Last 100 entries
        </Badge>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead className="w-[120px]">Severity</TableHead>
              <TableHead className="w-[150px]">Component</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Accessing Logs...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-20 text-muted-foreground italic"
                >
                  No system logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow
                  key={log.id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="whitespace-nowrap font-mono text-[10px] text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(log.severity)}
                      <Badge
                        variant={getSeverityVariant(log.severity)}
                        className="text-[10px] font-black tracking-tighter"
                      >
                        {log.severity}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-[11px] font-bold px-2 py-0.5 bg-muted rounded border border-border">
                      {log.component}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p
                      className="text-sm font-medium line-clamp-1"
                      title={log.message}
                    >
                      {log.message}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    {log.metadata && (
                      <button
                        onClick={() => console.log(log.metadata)}
                        className="text-[10px] font-black uppercase text-primary hover:underline"
                      >
                        Log Meta
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
