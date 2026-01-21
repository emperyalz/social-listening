"use client";

import { useState, Suspense } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/multi-select";
import { ScheduleSettings } from "@/components/schedule-settings";
import { formatDate, getPlatformIcon } from "@/lib/utils";
import { usePlatformLogos, type PlatformId } from "@/hooks/usePlatformLogos";
import {
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  X,
} from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

// Time period options for MultiSelect
const TIME_PERIOD_OPTIONS = [
  { label: "Last 24 Hours", value: "1" },
  { label: "Last 7 Days", value: "7" },
  { label: "Last 14 Days", value: "14" },
  { label: "Last 30 Days", value: "30" },
  { label: "Last 60 Days", value: "60" },
  { label: "Last 90 Days", value: "90" },
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

function JobsContent() {
  const [isRunning, setIsRunning] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [cancellingJob, setCancellingJob] = useState<string | null>(null);

  // Platform logos hook
  const { getLogoUrl, getEmoji, getColors, platforms: allPlatforms } = usePlatformLogos();

  // Active scraping platforms (Instagram, TikTok, YouTube)
  const scrapingPlatforms: ("instagram" | "tiktok" | "youtube")[] = ["instagram", "tiktok", "youtube"];

  // Generate platform options with logos for MultiSelect
  const platformOptions = scrapingPlatforms.map((p) => {
    const logoUrl = getLogoUrl(p, "dropdowns");
    const emoji = getEmoji(p);
    const platform = allPlatforms?.find(pl => pl.platformId === p);
    return {
      label: platform?.displayName || p.charAt(0).toUpperCase() + p.slice(1),
      value: p,
      icon: logoUrl || undefined,
      emoji: !logoUrl ? emoji : undefined,
    };
  });

  // Filters using MultiSelect pattern
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedTimePeriods, setSelectedTimePeriods] = useState<string[]>(["30"]);

  // Derive the filter values for the query
  const daysBack = selectedTimePeriods.length === 1
    ? parseInt(selectedTimePeriods[0])
    : 30;

  // Queries - pass platforms array for multi-select filtering
  const jobs = useQuery(api.scraping.getFilteredJobs, {
    platforms: selectedPlatforms.length > 0
      ? selectedPlatforms as ("instagram" | "tiktok" | "youtube")[]
      : undefined,
    daysBack: daysBack,
    limit: 100
  });
  const runningJobs = useQuery(api.scraping.getRunningJobs, {});

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedPlatforms([]);
    setSelectedTimePeriods(["30"]);
  };

  const hasAnyFilter = selectedPlatforms.length > 0 || (selectedTimePeriods.length > 0 && selectedTimePeriods[0] !== "30");

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
          <h1 className="text-3xl font-bold text-foreground">Scraping Jobs</h1>
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
        {scrapingPlatforms.map((platform) => {
          const logoUrl = getLogoUrl(platform, "jobs");
          const emoji = getEmoji(platform);
          const colors = getColors(platform);
          const platformData = allPlatforms?.find(p => p.platformId === platform);
          const displayName = platformData?.displayName || platform.charAt(0).toUpperCase() + platform.slice(1);

          const descriptions: Record<PlatformId, string> = {
            instagram: "Scrape all Instagram accounts for new posts and engagement data",
            tiktok: "Scrape all TikTok accounts for new videos and engagement data",
            youtube: "Scrape all YouTube channels for new videos and engagement data",
            facebook: "",
            linkedin: "",
            twitter: "",
          };

          return (
            <Card key={platform} className="bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={displayName}
                      className="h-6 w-auto object-contain"
                    />
                  ) : (
                    <span className="text-xl">{emoji}</span>
                  )}
                  {displayName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground text-center">
                  {descriptions[platform]}
                </p>
                <Button
                  onClick={() => handleScrape(platform)}
                  disabled={isRunning !== null}
                  className="w-full text-white"
                  style={{
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  }}
                >
                  {isRunning === platform ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run {displayName} Scrape
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Schedule Settings */}
      <ScheduleSettings />

      {/* Filters */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <MultiSelect
              options={platformOptions}
              selected={selectedPlatforms}
              onChange={setSelectedPlatforms}
              placeholder="All Platforms"
              logoOnly={true}
            />
            <MultiSelect
              options={TIME_PERIOD_OPTIONS}
              selected={selectedTimePeriods}
              onChange={setSelectedTimePeriods}
              placeholder="Time Period"
            />
            {hasAnyFilter && (
              <Button variant="ghost" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All Filters
              </Button>
            )}
            <span className="text-sm text-muted-foreground ml-auto">
              {jobs?.length || 0} jobs found
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Jobs History */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-foreground">
            <span>Recent Jobs</span>
            {runningCount > 0 && (
              <span className="text-sm font-normal text-blue-600 dark:text-blue-400">
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
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(job.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        // Use "recentJobs" context for the job history list (separate from scraper cards)
                        const logoUrl = getLogoUrl(job.platform as PlatformId, "recentJobs");
                        const platformData = allPlatforms?.find(p => p.platformId === job.platform);
                        const displayName = platformData?.displayName || job.platform.charAt(0).toUpperCase() + job.platform.slice(1);
                        return logoUrl ? (
                          <img src={logoUrl} alt={job.platform} className="h-5 w-auto max-w-[80px] object-contain" />
                        ) : (
                          <span className="text-lg">{getEmoji(job.platform as PlatformId)}</span>
                        );
                      })()}
                      <span className="font-medium capitalize text-foreground">
                        {(() => {
                          const platformData = allPlatforms?.find(p => p.platformId === job.platform);
                          return platformData?.displayName || job.platform;
                        })()} - {job.jobType}
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
                    <span className="text-sm text-foreground">
                      {job.itemsScraped} items scraped
                    </span>
                  )}
                  {job.error && (
                    <span className="text-sm text-red-500 dark:text-red-400 max-w-[200px] truncate" title={job.error}>
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
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
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
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : job.status === "failed"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : job.status === "running"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
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
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">About Automated Scraping</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="mb-2">
            Automated scraping collects the following data for each platform:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Profile updates (followers, following, bio)</li>
            <li>New posts and their engagement metrics</li>
            <li>Comments on recent posts</li>
            <li>Daily snapshots for trend analysis</li>
          </ul>
          <p className="mt-4">
            Use the <strong className="text-foreground">Schedule Settings</strong> above to configure your automation preferences.
            Manual scrapes can be triggered using the platform buttons at the top.
          </p>
          <p className="mt-2 text-yellow-600 dark:text-yellow-500">
            <strong>Note:</strong> Jobs running longer than 30 minutes are automatically timed out when you click &quot;Check Running Jobs&quot;.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <JobsContent />
    </Suspense>
  );
}
