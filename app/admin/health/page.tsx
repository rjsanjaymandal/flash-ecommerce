"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  ShieldCheck,
  Database,
  Mail,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function HealthPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);

  const checkHealth = async () => {
    setLoading(true);
    try {
      // We'll call an API route or a server action to check status
      const res = await fetch("/api/admin/health-check");
      const data = await res.json();
      setResults(data);
    } catch {
      toast.error("Failed to refresh health status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const StatusItem = ({ title, status, desc, icon: Icon }: any) => (
    <Card className="border-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-black uppercase tracking-widest">
          {title}
        </CardTitle>
        <div
          className={`p-2 rounded-md ${status ? "bg-emerald-500/10" : "bg-red-500/10"}`}
        >
          <Icon
            className={`h-4 w-4 ${status ? "text-emerald-500" : "text-red-500"}`}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-1">
          {status ? (
            <Badge className="bg-emerald-500">OPERATIONAL</Badge>
          ) : (
            <Badge variant="destructive">ERROR / MISSING</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-medium">{desc}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 min-h-screen bg-zinc-50/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight italic">
            System Diagnostics
          </h2>
          <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest">
            Production environment verification for Hostinger.
          </p>
        </div>
        <Button
          onClick={checkHealth}
          disabled={loading}
          className="gap-2 font-black uppercase tracking-tighter italic"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          Run Full Scan
        </Button>
      </div>

      {loading && !results ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-bold uppercase text-xs tracking-widest animate-pulse">
            Scanning infrastructure...
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <StatusItem
            title="Database (Supabase)"
            status={results?.supabase}
            desc={
              results?.supabase
                ? "Connection verified and RLS active."
                : "Failed to connect to Supabase."
            }
            icon={Database}
          />
          <StatusItem
            title="Service Role"
            status={results?.service_role}
            desc={
              results?.service_role
                ? "Admin privileges verified."
                : "SERVICE_ROLE_KEY is missing/invalid."
            }
            icon={ShieldCheck}
          />
          <StatusItem
            title="Razorpay"
            status={results?.razorpay}
            desc={
              results?.razorpay
                ? "API Keys verified and secret set."
                : "Razorpay keys or webhook secret missing."
            }
            icon={CreditCard}
          />
          <StatusItem
            title="Email (Resend)"
            status={results?.email}
            desc={
              results?.email
                ? "Email gateway ready."
                : "RESEND_API_KEY is missing."
            }
            icon={Mail}
          />

          <Card className="col-span-full border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="font-black uppercase italic">
                Hostinger Health Score
              </CardTitle>
              <CardDescription>
                Overall deployment stability analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-bold text-sm uppercase">
                  <span>Stability Index</span>
                  <span>{results?.overall_score || 0}%</span>
                </div>
                <div className="h-3 w-full bg-zinc-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000"
                    style={{ width: `${results?.overall_score || 0}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-2 text-xs font-medium">
                {results?.issues?.map((issue: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    {issue}
                  </div>
                ))}
                {results?.issues?.length === 0 && (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Everything looks perfect! Your app is optimized for
                    Hostinger.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
