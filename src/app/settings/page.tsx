"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your social listening platform
        </p>
      </div>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
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
            <p className="mt-1 text-xs text-green-600">✓ Configured in environment</p>
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
            <p className="mt-1 text-xs text-green-600">✓ Configured in environment</p>
          </div>
        </CardContent>
      </Card>

      {/* Scraping Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Scraping Schedule</CardTitle>
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
          <CardTitle>Data Retention</CardTitle>
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
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
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
