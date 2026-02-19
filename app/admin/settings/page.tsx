import { getGlobalSettings } from "@/app/actions/global-settings";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const announcementSettings = await getGlobalSettings("announcement_bar");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-black tracking-tight text-white mb-8">
        Storefront Settings
      </h1>

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
    </div>
  );
}
