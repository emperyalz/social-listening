"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function DashboardPage() {
  const [selectedMarket, setSelectedMarket] = useState<string>("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const markets = useQuery(api.markets.list);
  const stats = useQuery(api.insights.getDashboardStats, {
    marketId: selectedMarket !== "all" ? (selectedMarket as any) : undefined,
  });
  const competitors = useQuery(api.insights.getCompetitorComparison, {
    marketId: selectedMarket !== "all" ? (selectedMarket as any) : undefined,
    platform:
      selectedPlatform !== "all"
        ? (selectedPlatform as "instagram" | "tiktok" | "youtube")
        : undefined,
    days: 30,
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
          <Select value={selectedMarket} onValueChange={setSelectedMarket}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Markets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Markets</SelectItem>
              {markets?.map((market) => (
                <SelectItem key={market._id} value={market._id}>
                  {market.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">📸 Instagram</SelectItem>
              <SelectItem value="tiktok">🎵 TikTok</SelectItem>
              <SelectItem value="youtube">▶️ YouTube</SelectItem>
            </SelectContent>
          </Select>
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
