import { getGlobalSettings } from "@/app/actions/global-settings"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export async function AnnouncementBar() {
    const settings = await getGlobalSettings('announcement_bar')

    if (!settings || !(settings as any).enabled) return null

    return (
        <div className="bg-foreground text-background text-[10px] md:text-xs font-bold tracking-widest uppercase py-2.5 px-4 text-center relative z-[60]">
            <div className="container mx-auto flex items-center justify-center gap-2">
                <span>{settings.text}</span>
                {settings.href && (
                    <Link href={settings.href} className="flex items-center gap-1 hover:underline underline-offset-4 decoration-1">
                        Shop Now <ArrowRight className="h-3 w-3" />
                    </Link>
                )}
            </div>
        </div>
    )
}
