"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateGlobalSettings } from "@/app/actions/global-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface SettingsFormProps {
  settingsKey: string;
  initialData: any;
}

export function SettingsForm({ settingsKey, initialData }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: initialData,
  });

  const isEnabled = watch("enabled");

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const result = await updateGlobalSettings(settingsKey, data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Settings updated successfully");
      }
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <div className="space-y-0.5">
          <Label className="text-base font-bold text-slate-200">
            Enable Bar
          </Label>
          <p className="text-xs text-slate-500">
            Show this bar at the top of the storefront
          </p>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={(checked) => setValue("enabled", checked)}
          className="data-[state=checked]:bg-indigo-500"
        />
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label className="text-slate-300 font-medium">Message Text</Label>
          <Input
            {...register("text", { required: true })}
            placeholder="e.g. Free Shipping on all orders!"
            disabled={!isEnabled}
            className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300 font-medium">
            Link URL (Optional)
          </Label>
          <Input
            {...register("href")}
            placeholder="e.g. /shop or https://..."
            disabled={!isEnabled}
            className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-indigo-900/20"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </>
        )}
      </Button>
    </form>
  );
}
