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
    <div className="bg-foreground text-background text-[10px] md:text-sm font-bold tracking-widest uppercase py-3 px-4 text-center relative z-50 overflow-hidden group">
      <div className="container mx-auto relative flex items-center justify-center gap-10 whitespace-nowrap">
        {/* Marquee Container */}
        <div className="flex animate-marquee gap-10 items-center shrink-0">
          <span className="flex items-center gap-2">
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
          {/* Duplicate for seamless effect */}
          <span className="flex items-center gap-2">
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
          <span className="hidden md:flex items-center gap-2">
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
        </div>
        {/* Duplicate for seamless effect (Second half) */}
        <div
          className="flex animate-marquee gap-10 items-center shrink-0"
          aria-hidden="true"
        >
          <span className="flex items-center gap-2">
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
          <span className="flex items-center gap-2">
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
          <span className="hidden md:flex items-center gap-2">
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
        </div>
      </div>
    </div>
  );
}
