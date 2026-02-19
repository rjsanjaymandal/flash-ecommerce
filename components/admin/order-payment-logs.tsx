"use client";

import { useEffect, useState } from "react";
import { getPaymentLogs, syncOrderPayment } from "@/app/admin/orders/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function OrderPaymentLogs({ orderId }: { orderId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchLogs = async () => {
    const data = await getPaymentLogs(orderId);
    setLogs(data);
  };

  useEffect(() => {
    fetchLogs();
  }, [orderId, fetchLogs]);

  const handleSync = async () => {
    setIsSyncing(true);
    toast.info("Syncing with Razorpay...");
    try {
      const result = await syncOrderPayment(orderId);
      if (result.success) {
        toast.success(result.message);
        fetchLogs(); // Refresh logs
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to fetch payment logs");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="border-indigo-100 dark:border-indigo-900/20 shadow-sm">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-500" />
              Payment Intelligence
            </CardTitle>
            <CardDescription className="text-xs">
              Real-time audit trail and control
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            className="h-8 gap-2 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-indigo-800 dark:hover:bg-indigo-950"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")}
            />
            {isSyncing ? "Syncing..." : "Sync Status"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[250px]">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center text-muted-foreground gap-2">
              <Activity className="h-8 w-8 opacity-20" />
              <p className="text-sm">No payment logs found.</p>
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((log) => (
                <div key={log.id} className="p-4 flex gap-3 text-sm">
                  <div className="mt-0.5">
                    {log.severity === "ERROR" && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    {log.severity === "WARN" && (
                      <ShieldAlert className="h-4 w-4 text-orange-500" />
                    )}
                    {log.severity === "INFO" && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                      <span
                        className={cn(
                          "font-medium",
                          log.severity === "ERROR"
                            ? "text-red-700 dark:text-red-400"
                            : "text-foreground",
                        )}
                      >
                        {log.message}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      [{log.component}]
                    </p>
                    {log.metadata && (
                      <pre className="text-[10px] bg-muted/50 p-1.5 rounded-md overflow-x-auto mt-1 max-w-[300px] text-muted-foreground">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
