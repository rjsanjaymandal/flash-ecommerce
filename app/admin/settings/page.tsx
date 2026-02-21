import { getGlobalSettings } from "@/app/actions/global-settings";
import { SettingsForm } from "./settings-form";
import { CachePurgeButton } from "@/components/admin/cache-purge-button";

export default async function SettingsPage() {
  const announcementSettings = await getGlobalSettings("announcement_bar");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-white">
          Storefront Settings
        </h1>
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
          Configure site-wide behaviors and synchronization
        </p>
      </div>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          Announcement Bar
          <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Global
          </span>
        </h2>
        <SettingsForm
          settingsKey="announcement_bar"
          initialData={
            announcementSettings || { enabled: false, text: "", href: "" }
          }
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white uppercase tracking-tighter">
          System & Cache
        </h2>
        <CachePurgeButton />
      </section>
    </div>
  );
}
