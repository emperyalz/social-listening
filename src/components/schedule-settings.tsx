"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Settings,
  ToggleLeft,
  ToggleRight,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";

// Frequency options
const FREQUENCY_OPTIONS = [
  { value: "hourly", label: "Every Hour", description: "High-frequency monitoring" },
  { value: "every_6_hours", label: "Every 6 Hours", description: "4 times daily" },
  { value: "every_12_hours", label: "Every 12 Hours", description: "Twice daily" },
  { value: "daily", label: "Daily", description: "Once per day" },
  { value: "weekly", label: "Weekly", description: "Once per week" },
];

// Hour options (UTC)
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${i.toString().padStart(2, "0")}:00 UTC`,
}));

// Day options for weekly
const DAY_OPTIONS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

type Platform = "instagram" | "tiktok" | "youtube" | "all";
type Frequency = "hourly" | "every_6_hours" | "every_12_hours" | "daily" | "weekly";

interface ScheduleState {
  isEnabled: boolean;
  frequency: Frequency;
  preferredHour: number;
  preferredDays: number[];
}

export function ScheduleSettings() {
  const scheduleSettings = useQuery(api.schedule.getAll);
  const upsertSchedule = useMutation(api.schedule.upsert);
  const initializeDefaults = useMutation(api.schedule.initializeDefaults);

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Local state for the "all" platform setting
  const [settings, setSettings] = useState<ScheduleState>({
    isEnabled: true,
    frequency: "daily",
    preferredHour: 6,
    preferredDays: [1], // Monday
  });

  // Initialize defaults on first load
  useEffect(() => {
    if (scheduleSettings !== undefined && scheduleSettings.length === 0) {
      initializeDefaults({});
    }
  }, [scheduleSettings, initializeDefaults]);

  // Load settings when data arrives
  useEffect(() => {
    if (scheduleSettings && scheduleSettings.length > 0) {
      const allSetting = scheduleSettings.find(s => s.platform === "all");
      if (allSetting) {
        setSettings({
          isEnabled: allSetting.isEnabled,
          frequency: allSetting.frequency,
          preferredHour: allSetting.preferredHour,
          preferredDays: allSetting.preferredDays || [1],
        });
      }
    }
  }, [scheduleSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await upsertSchedule({
        platform: "all",
        isEnabled: settings.isEnabled,
        frequency: settings.frequency,
        preferredHour: settings.preferredHour,
        preferredDays: settings.frequency === "weekly" ? settings.preferredDays : undefined,
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save schedule:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = (updates: Partial<ScheduleState>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const formatNextRun = () => {
    const allSetting = scheduleSettings?.find(s => s.platform === "all");
    if (!allSetting?.nextScheduledAt) return "Not scheduled";

    const date = new Date(allSetting.nextScheduledAt);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    });
  };

  const formatLastRun = () => {
    const allSetting = scheduleSettings?.find(s => s.platform === "all");
    if (!allSetting?.lastRunAt) return "Never";

    const date = new Date(allSetting.lastRunAt);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (scheduleSettings === undefined) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Schedule Settings
            </CardTitle>
            <CardDescription className="mt-1">
              Configure automated scraping schedule for all platforms
            </CardDescription>
          </div>
          <button
            onClick={() => updateSettings({ isEnabled: !settings.isEnabled })}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              settings.isEnabled
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {settings.isEnabled ? (
              <>
                <ToggleRight className="h-5 w-5" />
                <span className="font-medium">Enabled</span>
              </>
            ) : (
              <>
                <ToggleLeft className="h-5 w-5" />
                <span className="font-medium">Disabled</span>
              </>
            )}
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xs text-blue-600 font-medium">Next Scheduled Run</p>
              <p className="text-sm font-semibold text-blue-900">{formatNextRun()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <Calendar className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-xs text-gray-600 font-medium">Last Run</p>
              <p className="text-sm font-semibold text-gray-900">{formatLastRun()}</p>
            </div>
          </div>
        </div>

        {/* Frequency Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Frequency</label>
          <div className="grid gap-2 md:grid-cols-5">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateSettings({ frequency: opt.value as Frequency })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  settings.frequency === opt.value
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <p className={`text-sm font-medium ${
                  settings.frequency === opt.value ? "text-blue-700" : "text-gray-900"
                }`}>
                  {opt.label}
                </p>
                <p className={`text-xs mt-0.5 ${
                  settings.frequency === opt.value ? "text-blue-600" : "text-gray-500"
                }`}>
                  {opt.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Preferred Hour */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Preferred Time (UTC)</label>
            <select
              value={settings.preferredHour}
              onChange={(e) => updateSettings({ preferredHour: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {HOUR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Your local time: {new Date(new Date().setUTCHours(settings.preferredHour, 0, 0, 0)).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
            </p>
          </div>

          {/* Day Selection (for weekly) */}
          {settings.frequency === "weekly" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Preferred Days</label>
              <div className="flex flex-wrap gap-2">
                {DAY_OPTIONS.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => {
                      const newDays = settings.preferredDays.includes(day.value)
                        ? settings.preferredDays.filter(d => d !== day.value)
                        : [...settings.preferredDays, day.value];
                      updateSettings({ preferredDays: newDays.length > 0 ? newDays : [day.value] });
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      settings.preferredDays.includes(day.value)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {day.label.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Note about Vercel Cron</p>
            <p className="mt-1 text-amber-700">
              The actual cron job is configured in <code className="bg-amber-100 px-1 rounded">vercel.json</code>.
              These settings help you track and plan your scraping schedule. To change the Vercel cron,
              update the cron expression in your project configuration.
            </p>
          </div>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
