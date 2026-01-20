"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Globe, Sun, Moon, Monitor, Key, Clock, Database, AlertTriangle } from "lucide-react";

const languages = [
  { code: "en" as Language, name: "English", flag: "🇺🇸" },
  { code: "es" as Language, name: "Español", flag: "🇪🇸" },
  { code: "pt" as Language, name: "Português", flag: "🇧🇷" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
        <p className="text-muted-foreground">
          {t("settings.subtitle")}
        </p>
      </div>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#28A963]/10">
              <Globe className="h-5 w-5 text-[#28A963]" />
            </div>
            <div>
              <CardTitle>{t("settings.language")}</CardTitle>
              <CardDescription>{t("settings.languageDescription")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center gap-3 rounded-lg border p-4 transition-all ${
                  language === lang.code
                    ? "border-[#28A963] bg-[#28A963]/10 ring-2 ring-[#28A963]/20"
                    : "border-border hover:border-[#28A963]/50 hover:bg-muted/50"
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
                {language === lang.code && (
                  <span className="ml-auto text-[#28A963]">✓</span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#28A963]/10">
              <Monitor className="h-5 w-5 text-[#28A963]" />
            </div>
            <div>
              <CardTitle>{t("settings.theme")}</CardTitle>
              <CardDescription>{t("settings.themeDescription")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-3 rounded-lg border p-4 transition-all ${
                theme === "light"
                  ? "border-[#28A963] bg-[#28A963]/10 ring-2 ring-[#28A963]/20"
                  : "border-border hover:border-[#28A963]/50 hover:bg-muted/50"
              }`}
            >
              <Sun className="h-5 w-5" />
              <span className="font-medium">{t("settings.lightMode")}</span>
              {theme === "light" && (
                <span className="ml-auto text-[#28A963]">✓</span>
              )}
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-3 rounded-lg border p-4 transition-all ${
                theme === "dark"
                  ? "border-[#28A963] bg-[#28A963]/10 ring-2 ring-[#28A963]/20"
                  : "border-border hover:border-[#28A963]/50 hover:bg-muted/50"
              }`}
            >
              <Moon className="h-5 w-5" />
              <span className="font-medium">{t("settings.darkMode")}</span>
              {theme === "dark" && (
                <span className="ml-auto text-[#28A963]">✓</span>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#28A963]/10">
              <Key className="h-5 w-5 text-[#28A963]" />
            </div>
            <div>
              <CardTitle>{t("settings.apiConfiguration")}</CardTitle>
              <CardDescription>API keys and external service connections</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Apify API Token</label>
            <p className="text-xs text-muted-foreground mb-2">
              Used for Instagram and TikTok scraping
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value="••••••••••••••••"
                disabled
                className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm"
              />
              <Button variant="outline" disabled>
                Update
              </Button>
            </div>
            <p className="mt-1 text-xs text-[#28A963]">✓ Configured in environment</p>
          </div>

          <div>
            <label className="text-sm font-medium">YouTube API Key</label>
            <p className="text-xs text-muted-foreground mb-2">
              Used for YouTube Data API v3
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value="••••••••••••••••"
                disabled
                className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm"
              />
              <Button variant="outline" disabled>
                Update
              </Button>
            </div>
            <p className="mt-1 text-xs text-[#28A963]">✓ Configured in environment</p>
          </div>
        </CardContent>
      </Card>

      {/* Scraping Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#28A963]/10">
              <Clock className="h-5 w-5 text-[#28A963]" />
            </div>
            <div>
              <CardTitle>{t("settings.scrapingSchedule")}</CardTitle>
              <CardDescription>Automated data collection timing</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Daily Scrape Time</label>
            <p className="text-xs text-muted-foreground mb-2">
              When automated scraping runs
            </p>
            <input
              type="text"
              value="6:00 AM UTC"
              disabled
              className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Configured in vercel.json cron settings
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Scrape Frequency</label>
            <p className="text-xs text-muted-foreground mb-2">
              How often to collect new data
            </p>
            <input
              type="text"
              value="Every 24 hours"
              disabled
              className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#28A963]/10">
              <Database className="h-5 w-5 text-[#28A963]" />
            </div>
            <div>
              <CardTitle>{t("settings.dataRetention")}</CardTitle>
              <CardDescription>Data storage and cleanup policies</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Snapshot History</label>
            <p className="text-xs text-muted-foreground mb-2">
              How long to keep daily snapshots
            </p>
            <input
              type="text"
              value="90 days"
              disabled
              className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Post History</label>
            <p className="text-xs text-muted-foreground mb-2">
              How long to keep post data
            </p>
            <input
              type="text"
              value="Unlimited"
              disabled
              className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-red-600 dark:text-red-400">{t("settings.dangerZone")}</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Clear All Data</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete all scraped data and insights
              </p>
            </div>
            <Button variant="destructive" disabled>
              Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
