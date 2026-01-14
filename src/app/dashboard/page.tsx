"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { Users, Building2, TrendingUp, Eye } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

export default function DashboardPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);

  const competitors = useQuery(api.competitors.list, {});
  const accounts = useQuery(api.accounts.list, {});
  const markets = useQuery(api.markets.getAll);

  // Filter accounts
  const filteredAccounts = accounts?.filter((acc) => {
    const platformMatch = selectedPlatforms.length === 0 || selectedPlatforms.includes(acc.platform);
    const marketMatch = selectedMarkets.length === 0 || selectedMarkets.some(m => acc.marketId === m as Id<"markets">);
    return platformMatch && marketMatch;
  }) || [];

  // Calculate stats
  const totalCompetitors = competitors?.length || 0;
  const totalAccounts = filteredAccounts.length;

  // Platform breakdown
  const platformCounts = filteredAccounts.reduce((acc, account) => {
    acc[account.platform] = (acc[account.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Market breakdown
  const marketCounts = filteredAccounts.reduce((acc, account) => {
    const market = markets?.find(m => m._id === account.marketId);
    if (market) {
      acc[market.name] = (acc[market.name] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Account type breakdown
  const typeCounts = filteredAccounts.reduce((acc, account) => {
    acc[account.accountType] = (acc[account.accountType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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

  const hasAnyFilter = selectedPlatforms.length > 0 || selectedMarkets.length > 0;

  const clearAllFilters = () => {
    setSelectedPlatforms([]);
    setSelectedMarkets([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your social media monitoring
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
            {hasAnyFilter && (
              <Button variant="ghost" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Competitors</p>
                <p className="text-3xl font-bold">{totalCompetitors}</p>
              </div>
              <Building2 className="h-10 w-10 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Social Accounts</p>
                <p className="text-3xl font-bold">{totalAccounts}</p>
              </div>
              <Users className="h-10 w-10 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Markets Tracked</p>
                <p className="text-3xl font-bold">{markets?.length || 0}</p>
              </div>
              <Eye className="h-10 w-10 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform & Market Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Accounts by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(platformCounts).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(platformCounts).map(([platform, count]) => (
                  <div key={platform} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        platform === 'instagram' ? 'bg-pink-500' :
                        platform === 'tiktok' ? 'bg-black' :
                        'bg-red-600'
                      }`} />
                      <span className="capitalize font-medium">{platform}</span>
                    </div>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No accounts match the current filters
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accounts by Market</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(marketCounts).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(marketCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([market, count]) => (
                    <div key={market} className="flex items-center justify-between">
                      <span className="font-medium">{market}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No accounts match the current filters
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Types */}
      <Card>
        <CardHeader>
          <CardTitle>Accounts by Type</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(typeCounts).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(typeCounts).map(([type, count]) => (
                <div key={type} className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground capitalize">{type}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No accounts match the current filters
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
