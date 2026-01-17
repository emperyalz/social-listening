"use client";

import { useState } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, getPlatformIcon } from "@/lib/utils";
import {
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  X,
  Calendar,
  Filter
} from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

// Time period options
const TIME_PERIODS = [
  { label: "1 Day", value: 1 },
  { label: "7 Days", value: 7 },
  { label: "14 Days", value: 14 },
  { label: "30 Days", value: 30 },
  { label: "60 Days", value: 60 },
  { label: "90 Days", value: 90 },
];

// Platform options
const PLATFORMS = [
  { label: "All Platforms", value: "all" },
  { label: "Instagram", value: "instagram" },
  { label: "TikTok", value: "tiktok" },
  { label: "YouTube", value: "youtube" },
];

// Format relative time with actual timestamp
function formatTimeWithTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  let relative = "";
  if (minutes < 60) relative = `${minutes}m ago`;
  else if (hours < 24) relative = `${hours}h ago`;
  else if (days < 30) relative = `${days}d ago`;
  else relative = formatDate(timestamp);

  const actualDate = new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${relative} (${actualDate})`;
}

export default function JobsPage() {
  const [isRunning, setIsRunning] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [cancellingJob, setCancellingJob] = useState<string | null>(null);

  // Filters
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | "instagram" | "tiktok" | "youtube">("all");
  const [selectedDays, setSelectedDays] = useState(30);

  // Queries
  const jobs = useQuery(api.scraping.getFilteredJobs, {
    platform: selectedPlatform,
    daysBack: selectedDays,
    limit: 100
  });
  const runningJobs = useQuery(api.scraping.getRunningJobs, {});

  // Actions and mutations
  const scrapeAllAccounts = useAction(api.scraping.scrapeAllAccounts);
  const pollAllRunningJobs = useAction(api.scrapingProcessor.pollAllRunningJobs);
  const cancelJob = useMutation(api.scraping.cancelJob);
  const timeoutStuckJobs = useMutation(api.scraping.timeoutStuckJobs);

  const handleScrape = async (platform: "instagram" | "tiktok" | "youtube") => {
    setIsRunning(platform);
    try {
      await scrapeAllAccounts({ platform });
    } catch (error) {
      console.error("Scrape error:", error);
    } finally {
      setIsRunning(null);
    }
  };

  const handlePollJobs = async () => {
    setIsPolling(true);
    try {
      // First timeout any stuck jobs
      await timeoutStuckJobs({});
      // Then poll remaining running jobs
      const results = await pollAllRunningJobs({});
      console.log("Poll results:", results);
    } catch (error) {
      console.error("Poll error:", error);
    } finally {
      setIsPolling(false);
    }
  };

  const handleCancelJob = async (jobId: Id<"scrapingJobs">) => {
    setCancellingJob(jobId);
    try {
      await cancelJob({ jobId });
    } catch (error) {
      console.error("Cancel error:", error);
    } finally {
      setCancellingJob(null);
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

  const runningCount = runningJobs?.length || 0;

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
        {runningCount > 0 && (
          <Button
            onClick={handlePollJobs}
            disabled={isPolling}
            variant="outline"
          >
            {isPolling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Check {runningCount} Running Job{runningCount > 1 ? "s" : ""}
              </>
            )}
          </Button>
        )}
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

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        {/* Platform Filter */}
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value as typeof selectedPlatform)}
          className="px-3 py-2 border rounded-md bg-background text-sm"
        >
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        {/* Time Period Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(Number(e.target.value))}
            className="px-3 py-2 border rounded-md bg-background text-sm"
          >
            {TIME_PERIODS.map((t) => (
              <option key={t.value} value={t.value}>
                Last {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <span className="text-sm text-muted-foreground ml-auto">
          {jobs?.length || 0} jobs found
        </span>
      </div>

      {/* Jobs History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Jobs</span>
            {runningCount > 0 && (
              <span className="text-sm font-normal text-blue-600">
                {runningCount} job{runningCount > 1 ? "s" : ""} running
              </span>
            )}
          </CardTitle>
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
                      <div>Started {formatTimeWithTimestamp(job.startedAt)}</div>
                      {job.completedAt && (
                        <div>Completed {formatTimeWithTimestamp(job.completedAt)}</div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {job.itemsScraped !== undefined && (
                    <span className="text-sm">
                      {job.itemsScraped} items scraped
                    </span>
                  )}
                  {job.error && (
                    <span className="text-sm text-red-500 max-w-[200px] truncate" title={job.error}>
                      {job.error}
                    </span>
                  )}

                  {/* Cancel button for running/pending jobs */}
                  {(job.status === "running" || job.status === "pending") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelJob(job._id)}
                      disabled={cancellingJob === job._id}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      {cancellingJob === job._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
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
                No scraping jobs found for the selected filters.
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
          <p className="mt-2 text-yellow-600">
            <strong>Note:</strong> Jobs running longer than 30 minutes are automatically timed out when you click &quot;Check Running Jobs&quot;.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
