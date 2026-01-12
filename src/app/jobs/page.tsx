"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRelativeTime, getPlatformIcon } from "@/lib/utils";
import { Play, RefreshCw, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

export default function JobsPage() {
  const [isRunning, setIsRunning] = useState<string | null>(null);
  const jobs = useQuery(api.scraping.getRecentJobs, { limit: 50 });
  
  const scrapeInstagram = useAction(api.scraping.scrapeAllAccounts);
  const scrapeTikTok = useAction(api.scraping.scrapeAllAccounts);
  const scrapeYouTube = useAction(api.scraping.scrapeAllAccounts);

  const handleScrape = async (platform: "instagram" | "tiktok" | "youtube") => {
    setIsRunning(platform);
    try {
      if (platform === "instagram") {
        await scrapeInstagram({ platform: "instagram" });
      } else if (platform === "tiktok") {
        await scrapeTikTok({ platform: "tiktok" });
      } else {
        await scrapeYouTube({ platform: "youtube" });
      }
    } catch (error) {
      console.error("Scrape error:", error);
    } finally {
      setIsRunning(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scraping Jobs</h1>
          <p className="text-muted-foreground">
            Manage and monitor data collection jobs
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              📸 Instagram
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Scrape all Instagram accounts for new posts and engagement data
            </p>
            <Button
              onClick={() => handleScrape("instagram")}
              disabled={isRunning !== null}
              className="w-full"
            >
              {isRunning === "instagram" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Instagram Scrape
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              🎵 TikTok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Scrape all TikTok accounts for new videos and engagement data
            </p>
            <Button
              onClick={() => handleScrape("tiktok")}
              disabled={isRunning !== null}
              className="w-full"
            >
              {isRunning === "tiktok" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run TikTok Scrape
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              ▶️ YouTube
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Scrape all YouTube channels for new videos and engagement data
            </p>
            <Button
              onClick={() => handleScrape("youtube")}
              disabled={isRunning !== null}
              className="w-full"
            >
              {isRunning === "youtube" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run YouTube Scrape
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Jobs History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {jobs?.map((job) => (
              <div
                key={job._id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(job.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getPlatformIcon(job.platform)}
                      </span>
                      <span className="font-medium capitalize">
                        {job.platform} - {job.jobType}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Started {formatRelativeTime(job.startedAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {job.itemsScraped !== undefined && (
                    <span className="text-sm">
                      {job.itemsScraped} items scraped
                    </span>
                  )}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      job.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : job.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : job.status === "running"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
            {(!jobs || jobs.length === 0) && (
              <div className="py-8 text-center text-muted-foreground">
                No scraping jobs yet. Run a scrape to start collecting data.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Automated Scraping</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="mb-2">
            Daily scraping is configured to run automatically via Vercel Cron at
            6:00 AM UTC. This collects:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Profile updates (followers, following, bio)</li>
            <li>New posts and their engagement metrics</li>
            <li>Comments on recent posts</li>
            <li>Daily snapshots for trend analysis</li>
          </ul>
          <p className="mt-4">
            You can also trigger manual scrapes using the buttons above for
            immediate data refresh.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
