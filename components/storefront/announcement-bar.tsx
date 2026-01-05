import { getGlobalSettings } from "@/app/actions/global-settings";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AnnouncementSettings {
  enabled: boolean;
  text: string;
  href?: string;
}

export async function AnnouncementBar() {
  const settings = (await getGlobalSettings(
    "announcement_bar"
  )) as AnnouncementSettings | null;

  if (!settings || !settings.enabled) return null;

  return (
    <div className="bg-foreground text-background text-[10px] md:text-sm font-bold tracking-widest uppercase py-3 px-4 text-center relative z-50 overflow-hidden group border-b border-white/10">
      <div className="flex w-full overflow-hidden select-none">
        {/* We need a container that is wide enough to scroll. 
            The 'animate-marquee' moves -50% translateX. 
            So we need two identical children: [Content] [Content] 
            where [Content] is wide enough to fill the screen or repeats enough.
        */}
        <div
          className="flex animate-marquee shrink-0 items-center justify-around min-w-full gap-10 pr-10"
          style={{ "--duration": "30s" } as React.CSSProperties}
        >
          {/* Block 1 */}
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={`a-${i}`}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {settings.text}
              {settings.href && (
                <Link
                  href={settings.href}
                  className="inline-flex items-center gap-1 hover:underline underline-offset-4 decoration-1 font-black text-primary"
                >
                  SHOP NOW <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </span>
          ))}
        </div>

        {/* Block 2 (Duplicate for seamless loop) */}
        <div
          className="flex animate-marquee shrink-0 items-center justify-around min-w-full gap-10 pr-10"
          aria-hidden="true"
          style={{ "--duration": "30s" } as React.CSSProperties}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={`b-${i}`}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {settings.text}
              {settings.href && (
                <Link
                  href={settings.href}
                  className="inline-flex items-center gap-1 hover:underline underline-offset-4 decoration-1 font-black text-primary"
                >
                  SHOP NOW <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
