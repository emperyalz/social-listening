"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Clock, CheckCircle, AlertCircle, Instagram, Youtube } from "lucide-react";

// Demo job data
const DEMO_JOBS = [
  {
    id: "1",
    type: "Instagram Profile Scrape",
    target: "@grupohorizonte",
    status: "completed",
    platform: "instagram",
    startedAt: "2024-01-20 14:30",
    completedAt: "2024-01-20 14:32",
    postsScraped: 150,
  },
  {
    id: "2",
    type: "YouTube Channel Scrape",
    target: "Grupo Horizonte",
    status: "running",
    platform: "youtube",
    startedAt: "2024-01-20 15:00",
    progress: 65,
  },
  {
    id: "3",
    type: "Competitor Analysis",
    target: "Constructora Colpatria",
    status: "queued",
    platform: "instagram",
    scheduledFor: "2024-01-20 16:00",
  },
  {
    id: "4",
    type: "TikTok Profile Scrape",
    target: "@grupohorizonte",
    status: "failed",
    platform: "tiktok",
    startedAt: "2024-01-20 13:00",
    error: "Rate limit exceeded",
  },
];

const statusColors = {
  completed: "bg-green-100 text-green-700",
  running: "bg-blue-100 text-blue-700",
  queued: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
};

const statusIcons = {
  completed: CheckCircle,
  running: Clock,
  queued: Clock,
  failed: AlertCircle,
};

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scraping Jobs</h1>
          <p className="text-muted-foreground">
            Monitor and manage social media data collection tasks
          </p>
        </div>
        <Button className="bg-[#28A963] hover:bg-[#229954]">
          <Play className="h-4 w-4 mr-2" />
          New Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">24</p>
            <p className="text-sm text-muted-foreground">Completed Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">3</p>
            <p className="text-sm text-muted-foreground">Running</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">8</p>
            <p className="text-sm text-muted-foreground">Queued</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-600">2</p>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {DEMO_JOBS.map((job) => {
            const StatusIcon = statusIcons[job.status as keyof typeof statusIcons];
            return (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    {job.platform === "instagram" && <Instagram className="h-5 w-5 text-pink-500" />}
                    {job.platform === "youtube" && <Youtube className="h-5 w-5 text-red-500" />}
                    {job.platform === "tiktok" && <span className="text-xl">🎵</span>}
                  </div>
                  <div>
                    <p className="font-medium">{job.type}</p>
                    <p className="text-sm text-muted-foreground">{job.target}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {job.status === "running" && job.progress && (
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  )}
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[job.status as keyof typeof statusColors]}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}