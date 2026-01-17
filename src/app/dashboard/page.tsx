"use client";

import { Suspense } from "react";
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
} from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { useFilterParams } from "@/hooks/useFilterParams";
import { Id } from "../../../convex/_generated/dataModel";

function DashboardContent() {
  const {
    selectedMarkets,
    setSelectedMarkets,
    selectedPlatforms,
    setSelectedPlatforms,
  } = useFilterParams();

  const markets = useQuery(api.markets.list);

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
    days: 30,
  });

  // Build options for MultiSelect
  const marketOptions = markets?.map((m) => ({
    value: m._id,
    label: m.name,
  })) || [];

  const platformOptions = [
    { value: "instagram", label: "📸 Instagram" },
    { value: "tiktok", label: "🎵 TikTok" },
    { value: "youtube", label: "▶️ YouTube" },
  ];

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
      <CompetitorTable
        data={competitors || []}
        title="Competitor Rankings (Last 30 Days)"
      />
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
