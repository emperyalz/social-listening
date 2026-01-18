"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatNumber, getPlatformIcon } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

type PlatformId = "instagram" | "tiktok" | "youtube" | "facebook" | "linkedin" | "twitter";

interface CompetitorData {
  account: {
    id: string;
    username: string;
    displayName?: string;
    platform: string;
    avatarUrl?: string;
    companyName?: string;
    accountType: string;
    profileUrl?: string;
  };
  market?: string;
  followers: number;
  followerGrowth: number;
  followerGrowthRate: string;
  postsCount: number;
  postsPerWeek: string;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  avgLikesPerPost: number;
  avgCommentsPerPost: number;
  engagementRate: string;
}

interface CompetitorTableProps {
  data: CompetitorData[];
  title?: string;
}

function getProfileUrl(platform: string, username: string, profileUrl?: string): string {
  if (profileUrl) return profileUrl;
  switch (platform) {
    case "instagram":
      return `https://www.instagram.com/${username}`;
    case "tiktok":
      return `https://www.tiktok.com/@${username}`;
    case "youtube":
      return `https://www.youtube.com/@${username}`;
    default:
      return "#";
  }
}

function Avatar({ src, username, platform }: { src?: string; username: string; platform: string }) {
  const [hasError, setHasError] = useState(false);
  const initial = username?.[0]?.toUpperCase() || "?";
  
  const platformColors: Record<string, string> = {
    instagram: "bg-gradient-to-br from-purple-500 to-pink-500",
    tiktok: "bg-slate-900",
    youtube: "bg-red-600",
  };
  
  if (!src || hasError) {
    return (
      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white ${platformColors[platform] || "bg-muted text-foreground"}`}>
        {initial}
      </div>
    );
  }
  
  return (
    <img
      src={src}
      alt={username}
      className="h-8 w-8 rounded-full object-cover"
      onError={() => setHasError(true)}
    />
  );
}

export function CompetitorTable({ data, title = "Competitor Rankings" }: CompetitorTableProps) {
  const platforms = useQuery(api.platforms.list);

  // Get logo URL for a platform and context
  const getLogoUrl = (platformId: string, context: string): string | null => {
    const platform = platforms?.find(p => p.platformId === platformId);
    if (!platform?.selectedLogos) return null;
    const logo = (platform.selectedLogos as Record<string, { url: string | null } | null>)?.[context];
    return logo?.url || null;
  };

  // Render platform logo or emoji fallback
  const renderPlatformLogo = (platform: string) => {
    const logoUrl = getLogoUrl(platform, "dashboard");
    if (logoUrl) {
      return <img src={logoUrl} alt={platform} className="h-5 w-5 object-contain" />;
    }
    return <span className="text-lg">{getPlatformIcon(platform)}</span>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium">Rank</th>
                <th className="pb-3 font-medium">Account</th>
                <th className="pb-3 font-medium">Platform</th>
                <th className="pb-3 font-medium text-right">Followers</th>
                <th className="pb-3 font-medium text-right">Growth</th>
                <th className="pb-3 font-medium text-right">Posts/Week</th>
                <th className="pb-3 font-medium text-right">Avg Likes</th>
                <th className="pb-3 font-medium text-right">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {data.map((competitor, index) => {
                const profileUrl = getProfileUrl(competitor.account.platform, competitor.account.username, competitor.account.profileUrl);
                return (
                  <tr key={competitor.account.id} className="border-b last:border-0">
                    <td className="py-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={competitor.account.avatarUrl} username={competitor.account.username} platform={competitor.account.platform} />
                        <div>
                          <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1 font-medium hover:text-blue-600 hover:underline">
                            @{competitor.account.username}
                            <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                          </a>
                          {competitor.account.companyName && <p className="text-xs text-muted-foreground">{competitor.account.companyName}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3">{renderPlatformLogo(competitor.account.platform)}</td>
                    <td className="py-3 text-right font-medium">{formatNumber(competitor.followers)}</td>
                    <td className="py-3 text-right">
                      <span className={competitor.followerGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                        {competitor.followerGrowth >= 0 ? "+" : ""}{competitor.followerGrowthRate}%
                      </span>
                    </td>
                    <td className="py-3 text-right">{competitor.postsPerWeek}</td>
                    <td className="py-3 text-right">{formatNumber(competitor.avgLikesPerPost)}</td>
                    <td className="py-3 text-right font-medium">{competitor.engagementRate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {data.length === 0 && <div className="py-8 text-center text-muted-foreground">No competitor data available. Add accounts to start tracking.</div>}
      </CardContent>
    </Card>
  );
}
