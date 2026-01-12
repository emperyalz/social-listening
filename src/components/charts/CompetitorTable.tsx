"use client";

import { formatNumber, getPlatformIcon } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CompetitorData {
  account: {
    id: string;
    username: string;
    displayName?: string;
    platform: string;
    avatarUrl?: string;
    companyName?: string;
    accountType: string;
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

export function CompetitorTable({
  data,
  title = "Competitor Rankings",
}: CompetitorTableProps) {
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
              {data.map((competitor, index) => (
                <tr key={competitor.account.id} className="border-b last:border-0">
                  <td className="py-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {competitor.account.avatarUrl ? (
                        <img
                          src={competitor.account.avatarUrl}
                          alt={competitor.account.username}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm">
                          {competitor.account.username[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          @{competitor.account.username}
                        </p>
                        {competitor.account.companyName && (
                          <p className="text-xs text-muted-foreground">
                            {competitor.account.companyName}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="text-lg">
                      {getPlatformIcon(competitor.account.platform)}
                    </span>
                  </td>
                  <td className="py-3 text-right font-medium">
                    {formatNumber(competitor.followers)}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={
                        competitor.followerGrowth >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {competitor.followerGrowth >= 0 ? "+" : ""}
                      {competitor.followerGrowthRate}%
                    </span>
                  </td>
                  <td className="py-3 text-right">{competitor.postsPerWeek}</td>
                  <td className="py-3 text-right">
                    {formatNumber(competitor.avgLikesPerPost)}
                  </td>
                  <td className="py-3 text-right font-medium">
                    {competitor.engagementRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No competitor data available. Add accounts to start tracking.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
