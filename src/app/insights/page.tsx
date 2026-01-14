"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { TrendingUp, Users, Target } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

export default function InsightsPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<string[]>(["30d"]);

  const accounts = useQuery(api.accounts.list, {});
  const markets = useQuery(api.markets.getAll);
  const competitors = useQuery(api.competitors.list, {});

  // Filter accounts
  const filteredAccounts = accounts?.filter((acc) => {
    const platformMatch = selectedPlatforms.length === 0 || selectedPlatforms.includes(acc.platform);
    const marketMatch = selectedMarkets.length === 0 || selectedMarkets.some(m => acc.marketId === m as Id<"markets">);
    return platformMatch && marketMatch;
  }) || [];

  // Platform options
  const platformOptions = [
    { value: "instagram", label: "Instagram" },
    { value: "tiktok", label: "TikTok" },
    { value: "youtube", label: "YouTube" },
  ];

  // Market options
  const marketOptions = markets?.map(m => ({
    value: m._id,
    label: m.name,
  })) || [];

  // Time range options
  const timeRangeOptions = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
  ];

  const hasAnyFilter = selectedPlatforms.length > 0 || selectedMarkets.length > 0 || timeRange.length > 0;

  const clearAllFilters = () => {
    setSelectedPlatforms([]);
    setSelectedMarkets([]);
    setTimeRange([]);
  };

  // Group accounts by platform
  const accountsByPlatform = filteredAccounts.reduce((acc, account) => {
    if (!acc[account.platform]) {
      acc[account.platform] = [];
    }
    acc[account.platform].push(account);
    return acc;
  }, {} as Record<string, typeof filteredAccounts>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Insights</h1>
        <p className="text-muted-foreground">
          Analytics and trends across your competitors
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <MultiSelect
              options={platformOptions}
              selected={selectedPlatforms}
              onChange={setSelectedPlatforms}
              placeholder="Platform"
            />
            <MultiSelect
              options={marketOptions}
              selected={selectedMarkets}
              onChange={setSelectedMarkets}
              placeholder="Market"
            />
            <MultiSelect
              options={timeRangeOptions}
              selected={timeRange}
              onChange={setTimeRange}
              placeholder="Time Range"
            />
            {hasAnyFilter && (
              <Button variant="ghost" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                <p className="text-3xl font-bold">{filteredAccounts.length}</p>
              </div>
              <Users className="h-10 w-10 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Platforms</p>
                <p className="text-3xl font-bold">{Object.keys(accountsByPlatform).length}</p>
              </div>
              <Target className="h-10 w-10 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Competitors</p>
                <p className="text-3xl font-bold">{competitors?.length || 0}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(accountsByPlatform).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(accountsByPlatform).map(([platform, accounts]) => (
                <div key={platform}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{platform}</span>
                    <span className="text-sm text-muted-foreground">{accounts.length} accounts</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        platform === 'instagram' ? 'bg-pink-500' :
                        platform === 'tiktok' ? 'bg-black' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${(accounts.length / filteredAccounts.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No accounts match the current filters
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top Accounts by Platform */}
      {Object.entries(accountsByPlatform).map(([platform, accounts]) => (
        <Card key={platform}>
          <CardHeader>
            <CardTitle className="capitalize">{platform} Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accounts.slice(0, 5).map((account) => {
                const competitor = competitors?.find(c => c._id === account.competitorId);
                return (
                  <div key={account._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{competitor?.name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">@{account.username}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground capitalize">{account.accountType}</p>
                    </div>
                  </div>
                );
              })}
              {accounts.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  + {accounts.length - 5} more accounts
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Engagement metrics, growth trends, and competitive analysis coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
