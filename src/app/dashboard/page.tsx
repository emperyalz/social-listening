"use client";

import { Suspense, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, Heart, MessageCircle, Eye, FileText } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

// Demo data for Grupo Horizonte
const DEMO_STATS = {
  accountsTracked: 12,
  totalFollowers: 485000,
  recentPostsCount: 47,
  avgEngagementRate: 4.28,
  totalLikes: 125400,
  totalComments: 8920,
  totalViews: 2450000,
};

const DEMO_COMPETITORS = [
  { name: "Grupo Horizonte", platform: "instagram", username: "grupo_horizonte", followers: 185000, followerGrowth: 12500, followerGrowthRate: 7.2, engagementRate: 5.8, postsCount: 24 },
  { name: "Constructora Colpatria", platform: "instagram", username: "constructora_colpatria", followers: 142000, followerGrowth: 8900, followerGrowthRate: 6.7, engagementRate: 4.5, postsCount: 18 },
  { name: "Amarilo", platform: "instagram", username: "amarilo_oficial", followers: 128000, followerGrowth: 7200, followerGrowthRate: 5.9, engagementRate: 5.2, postsCount: 22 },
  { name: "Cusezar", platform: "instagram", username: "cusezar_colombia", followers: 95000, followerGrowth: 4100, followerGrowthRate: 4.5, engagementRate: 3.8, postsCount: 15 },
  { name: "Marval", platform: "instagram", username: "marval_colombia", followers: 78000, followerGrowth: 3800, followerGrowthRate: 5.1, engagementRate: 4.2, postsCount: 12 },
  { name: "Grupo Horizonte", platform: "tiktok", username: "grupohorizonte", followers: 95000, followerGrowth: 15200, followerGrowthRate: 19.0, engagementRate: 8.1, postsCount: 32 },
  { name: "Amarilo", platform: "tiktok", username: "amarilo_co", followers: 67000, followerGrowth: 9800, followerGrowthRate: 17.1, engagementRate: 7.2, postsCount: 28 },
  { name: "Grupo Horizonte", platform: "youtube", username: "GrupoHorizonteTV", followers: 45000, followerGrowth: 3200, followerGrowthRate: 7.6, engagementRate: 6.2, postsCount: 8 },
];

const PLATFORM_EMOJI: Record<string, string> = { instagram: "📸", tiktok: "🎵", youtube: "📺" };

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  highlight?: boolean;
}

function StatCard({ title, value, icon: Icon, description, highlight }: StatCardProps) {
  const formattedValue = typeof value === 'number' 
    ? value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString()
    : value;

  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${highlight ? 'text-[#28A963]' : 'text-foreground'}`}>{formattedValue}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${highlight ? 'bg-[#28A963]/10' : 'bg-muted'}`}>
            <Icon className={`h-6 w-6 ${highlight ? 'text-[#28A963]' : 'text-muted-foreground'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompetitorTable({ data }: { data: typeof DEMO_COMPETITORS }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-muted-foreground font-medium">Account</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Platform</th>
                <th className="text-right p-4 text-muted-foreground font-medium">Followers</th>
                <th className="text-right p-4 text-muted-foreground font-medium">Growth</th>
                <th className="text-right p-4 text-muted-foreground font-medium">Engagement</th>
                <th className="text-right p-4 text-muted-foreground font-medium">Posts</th>
              </tr>
            </thead>
            <tbody>
              {data.map((competitor, i) => (
                <tr key={`${competitor.username}-${competitor.platform}`} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-lg">{competitor.name.charAt(0)}</div>
                      <div>
                        <p className="font-medium text-foreground">{competitor.name}</p>
                        <p className="text-sm text-muted-foreground">@{competitor.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><span className="text-xl">{PLATFORM_EMOJI[competitor.platform]}</span></td>
                  <td className="p-4 text-right text-foreground font-medium">{(competitor.followers / 1000).toFixed(1)}K</td>
                  <td className="p-4 text-right"><span className="text-emerald-500 font-medium">+{competitor.followerGrowthRate.toFixed(1)}%</span></td>
                  <td className="p-4 text-right text-foreground">{competitor.engagementRate.toFixed(1)}%</td>
                  <td className="p-4 text-right text-muted-foreground">{competitor.postsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardContent() {
  const { theme } = useTheme();
  const stats = DEMO_STATS;
  const competitors = DEMO_COMPETITORS;

  return (
    <div className="space-y-8 bg-background text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Social media analytics for Grupo Horizonte</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-sm">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Demo Mode
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Accounts Tracked" value={stats.accountsTracked} icon={Users} description="Active competitors" />
        <StatCard title="Total Followers" value={stats.totalFollowers} icon={TrendingUp} description="Combined audience" highlight />
        <StatCard title="Posts (7 days)" value={stats.recentPostsCount} icon={FileText} description="Recent content" />
        <StatCard title="Avg Engagement" value={`${stats.avgEngagementRate.toFixed(2)}%`} icon={Heart} description="Likes & comments" highlight />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Likes" value={stats.totalLikes} icon={Heart} description="Last 7 days" />
        <StatCard title="Total Comments" value={stats.totalComments} icon={MessageCircle} description="Last 7 days" />
        <StatCard title="Total Views" value={stats.totalViews} icon={Eye} description="Last 7 days" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Competitor Rankings</h2>
          <span className="text-sm text-muted-foreground">Last 30 Days</span>
        </div>
        <CompetitorTable data={competitors} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}