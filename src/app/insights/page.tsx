"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiSelect } from "@/components/ui/multi-select";
import { usePlatformLogos } from "@/hooks/usePlatformLogos";

export default function InsightsPage() {
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  // Platform logos hook
  const { getLogoUrl, getEmoji, platforms: allPlatforms } = usePlatformLogos();
  const [days, setDays] = useState<string>("30");

  const markets = useQuery(api.markets.list);
  
  // Use first selected for API query
  const firstMarketId = selectedMarkets.length > 0 ? selectedMarkets[0] : undefined;
  const firstPlatform = selectedPlatforms.length > 0 ? selectedPlatforms[0] : undefined;
  
  const patterns = useQuery(api.insights.getContentPatterns, {
    marketId: firstMarketId as any,
    platform: firstPlatform as "instagram" | "tiktok" | "youtube" | undefined,
    days: parseInt(days),
  });

  // Build options for MultiSelect
  const marketOptions = markets?.map((m) => ({
    value: m._id,
    label: m.name,
  })) || [];

  // Platform options with logos for dropdown
  const scrapingPlatforms: ("instagram" | "tiktok" | "youtube")[] = ["instagram", "tiktok", "youtube"];
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Insights</h1>
          <p className="text-muted-foreground">
            Content patterns and performance analysis
          </p>
        </div>
        <div className="flex gap-4">
          <MultiSelect
            options={marketOptions}
            selected={selectedMarkets}
            onChange={setSelectedMarkets}
            placeholder="All Markets"
          />
          <MultiSelect
            options={platformOptions}
            selected={selectedPlatforms}
            onChange={setSelectedPlatforms}
            placeholder="All Platforms"
            logoOnly={true}
          />
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="hashtags">
        <TabsList>
          <TabsTrigger value="hashtags">Top Hashtags</TabsTrigger>
          <TabsTrigger value="timing">Best Posting Times</TabsTrigger>
          <TabsTrigger value="content">Content Types</TabsTrigger>
        </TabsList>

        <TabsContent value="hashtags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Top Performing Hashtags ({patterns?.totalPosts || 0} posts analyzed)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patterns?.topHashtags.map((tag, index) => (
                  <div
                    key={tag.hashtag}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="font-medium">#{tag.hashtag}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-muted-foreground">
                        Used {tag.count}x
                      </div>
                      <div className="font-medium">
                        {tag.avgEngagement.toLocaleString()} avg engagement
                      </div>
                    </div>
                  </div>
                ))}
                {(!patterns?.topHashtags || patterns.topHashtags.length === 0) && (
                  <div className="py-8 text-center text-muted-foreground">
                    No hashtag data available yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Best Days to Post</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patterns?.bestDays.map((day, index) => (
                    <div
                      key={day.day}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                            index < 3
                              ? "bg-green-100 text-green-700"
                              : "bg-muted"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="font-medium">{day.day}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {day.count} posts
                        </span>
                        <span className="font-medium">
                          {day.avgEngagement.toLocaleString()} avg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Hours to Post</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patterns?.bestHours.slice(0, 7).map((hour, index) => (
                    <div
                      key={hour.hour}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                            index < 3
                              ? "bg-green-100 text-green-700"
                              : "bg-muted"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="font-medium">
                          {hour.hour === 0
                            ? "12 AM"
                            : hour.hour < 12
                              ? `${hour.hour} AM`
                              : hour.hour === 12
                                ? "12 PM"
                                : `${hour.hour - 12} PM`}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {hour.count} posts
                        </span>
                        <span className="font-medium">
                          {hour.avgEngagement.toLocaleString()} avg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Type Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patterns?.typePerformance.map((type) => (
                  <div
                    key={type.type}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {type.type === "video"
                          ? "🎬"
                          : type.type === "image"
                            ? "🖼️"
                            : type.type === "carousel"
                              ? "📑"
                              : type.type === "reel"
                                ? "📱"
                                : type.type === "short"
                                  ? "⚡"
                                  : "📄"}
                      </span>
                      <span className="font-medium capitalize">{type.type}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-muted-foreground">
                        {type.count} posts
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg likes:</span>{" "}
                        <span className="font-medium">
                          {type.avgLikes.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg comments:</span>{" "}
                        <span className="font-medium">
                          {type.avgComments.toLocaleString()}
                        </span>
                      </div>
                      {type.avgViews > 0 && (
                        <div>
                          <span className="text-muted-foreground">Avg views:</span>{" "}
                          <span className="font-medium">
                            {type.avgViews.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {(!patterns?.typePerformance ||
                  patterns.typePerformance.length === 0) && (
                  <div className="py-8 text-center text-muted-foreground">
                    No content type data available yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
