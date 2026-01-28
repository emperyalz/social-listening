"use client";

import { Suspense, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { StatCard } from "@/components/charts/StatCard";
import { CompetitorTable } from "@/components/charts/CompetitorTable";
import {
  Users,
  TrendingUp,
  Heart,
  MessageCircle,
  Eye,
  FileText,
  Globe,
  Activity,
} from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { useFilterParams } from "@/hooks/useFilterParams";
import { usePlatformLogos, type PlatformId } from "@/hooks/usePlatformLogos";
import { Id } from "../../../convex/_generated/dataModel";

// Time period options for competitor rankings
const TIME_PERIOD_OPTIONS = [
  { value: "1", label: "Last 24 Hours" },
  { value: "3", label: "Last 3 Days" },
  { value: "7", label: "Last 7 Days" },
  { value: "14", label: "Last 2 Weeks" },
  { value: "30", label: "Last 30 Days" },
  { value: "60", label: "Last 2 Months" },
  { value: "90", label: "Last 3 Months" },
  { value: "180", label: "Last 6 Months" },
];

function DashboardContent() {
  const {
    selectedMarkets,
    setSelectedMarkets,
    selectedPlatforms,
    setSelectedPlatforms,
  } = useFilterParams();

  const [competitorDays, setCompetitorDays] = useState<string[]>(["30"]);

  const markets = useQuery(api.markets.list);
  const { getLogoUrl, getEmoji, platforms: allPlatforms } = usePlatformLogos();

  // Get the selected days value
  const daysValue = competitorDays.length > 0 ? parseInt(competitorDays[0]) : 30;

  // Pass filters to stats query - using arrays for multi-select support
  const stats = useQuery(api.insights.getDashboardStats, {
    marketIds: selectedMarkets.length > 0
      ? selectedMarkets as Id<"markets">[]
      : undefined,
    platforms: selectedPlatforms.length > 0
      ? selectedPlatforms as ("instagram" | "tiktok" | "youtube")[]
      : undefined,
  });

  // Pass filters to competitor comparison query - using arrays for multi-select support
  const competitors = useQuery(api.insights.getCompetitorComparison, {
    marketIds: selectedMarkets.length > 0
      ? selectedMarkets as Id<"markets">[]
      : undefined,
    platforms: selectedPlatforms.length > 0
      ? selectedPlatforms as ("instagram" | "tiktok" | "youtube")[]
      : undefined,
    days: daysValue,
  });

  // Get main account metrics (Portfolio Reach and Engagement Rate)
  const mainAccountMetrics = useQuery(api.insights.getMainAccountMetrics);

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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Real Estate Social Media Intelligence
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
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Accounts Tracked"
          value={stats?.accountsTracked || 0}
          icon={Users}
          description="Active competitor accounts"
        />
        <StatCard
          title="Total Followers"
          value={stats?.totalFollowers || 0}
          icon={TrendingUp}
          description="Combined audience"
        />
        <StatCard
          title="Posts (7 days)"
          value={stats?.recentPostsCount || 0}
          icon={FileText}
          description="Recent content published"
        />
        <StatCard
          title="Avg Engagement"
          value={`${(stats?.avgEngagementRate || 0).toFixed(2)}%`}
          icon={Heart}
          description="Likes + comments / followers"
        />
      </div>

      {/* Engagement Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Likes"
          value={stats?.totalLikes || 0}
          icon={Heart}
          description="Last 7 days"
        />
        <StatCard
          title="Total Comments"
          value={stats?.totalComments || 0}
          icon={MessageCircle}
          description="Last 7 days"
        />
        <StatCard
          title="Total Views"
          value={stats?.totalViews || 0}
          icon={Eye}
          description="Last 7 days"
        />
      </div>

      {/* Competitor Rankings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Competitor Rankings</h2>
          <MultiSelect
            options={TIME_PERIOD_OPTIONS}
            selected={competitorDays}
            onChange={setCompetitorDays}
            placeholder="Time Period"
          />
        </div>
        <CompetitorTable
          data={competitors || []}
          title={`Competitor Rankings (${TIME_PERIOD_OPTIONS.find(o => o.value === competitorDays[0])?.label || "Last 30 Days"})`}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
