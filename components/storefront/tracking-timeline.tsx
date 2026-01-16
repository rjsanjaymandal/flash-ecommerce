"use client";

import { useEffect, useState } from "react";
import { Package, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackingEvent {
  DateandTime: string;
  Status: string;
  Remark: string;
  Location: string;
}

interface TrackingData {
  status: boolean;
  error: boolean;
  response: string;
  summary?: {
    waybill: string;
    orderid: string;
    tracking: TrackingEvent[];
  };
}

interface TrackingTimelineProps {
  awb: string;
  className?: string;
}

export function TrackingTimeline({ awb, className }: TrackingTimelineProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);

  useEffect(() => {
    async function fetchTracking() {
      if (!awb) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/ship/track?awb=${encodeURIComponent(awb)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch tracking data");
        }

        if (!data.status) {
          throw new Error(data.response || "No tracking information found");
        }

        setTrackingData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTracking();
  }, [awb]);

  if (loading) {
    return (
      <div className={cn("p-6 space-y-4 animate-pulse", className)}>
        <div className="h-4 bg-zinc-100 rounded-full w-1/4"></div>
        <div className="space-y-3">
          <div className="h-8 bg-zinc-50 rounded-xl"></div>
          <div className="h-8 bg-zinc-50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "p-6 text-center border-2 border-dashed border-zinc-100 rounded-3xl",
          className
        )}
      >
        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
          {error}
        </p>
        <p className="text-zinc-300 text-[10px] mt-1 font-mono uppercase">
          AWB: {awb}
        </p>
      </div>
    );
  }

  if (
    !trackingData ||
    !trackingData.summary ||
    trackingData.summary.tracking.length === 0
  ) {
    return (
      <div className={cn("p-8 text-center", className)}>
        <Package className="h-10 w-10 text-zinc-100 mx-auto mb-3" />
        <p className="text-zinc-400 text-xs font-black uppercase tracking-widest italic">
          No detailed tracking available
        </p>
      </div>
    );
  }

  return (
    <div className={cn("p-6 md:p-8", className)}>
      <div className="relative pl-8">
        {/* Vertical line connector */}
        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-zinc-100"></div>

        <div className="space-y-8">
          {trackingData.summary.tracking
            .slice()
            .reverse()
            .map((event, index) => {
              const isFirst = index === 0;
              return (
                <div key={index} className="relative">
                  {/* Timeline Node */}
                  <div
                    className={cn(
                      "absolute -left-[25px] mt-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ring-2",
                      isFirst
                        ? "bg-zinc-950 ring-zinc-100"
                        : "bg-zinc-300 ring-zinc-50"
                    )}
                  ></div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <h4
                        className={cn(
                          "text-sm font-black uppercase tracking-tight",
                          isFirst ? "text-zinc-950" : "text-zinc-400"
                        )}
                      >
                        {event.Status}
                      </h4>
                      {isFirst && (
                        <span className="px-2 py-0.5 bg-zinc-950 text-white text-[8px] font-black uppercase rounded tracking-widest">
                          Latest Entry
                        </span>
                      )}
                    </div>

                    <p className="text-zinc-500 text-[10px] font-medium leading-relaxed max-w-md italic">
                      {event.Remark}
                    </p>

                    <div className="flex flex-wrap gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <MapPin className="h-3 w-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          {event.Location}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Clock className="h-3 w-3" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">
                          {event.DateandTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
