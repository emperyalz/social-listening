"use client";

import { Suspense, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { CompetitorTable } from "@/components/charts/CompetitorTable";
import { Users, TrendingUp, Heart, MessageCircle, Eye, FileText } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { useFilterParams } from "@/hooks/useFilterParams";
import { usePlatformLogos, type PlatformId } from "@/hooks/usePlatformLogos";
import { useLanguage } from "@/contexts/LanguageContext";
import { Id } from "../../../convex/_generated/dataModel";

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

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  highlight?: boolean;
}

function StatCard({ title, value, icon: Icon, description, highlight }: StatCardProps) {
  const formattedValue = typeof value === 'number' 
    ? value >= 1000000 
      ? `${(value / 1000000).toFixed(1)}M`
      : value >= 1000 
        ? `${(value / 1000).toFixed(1)}K`
        : value.toLocaleString()
    : value;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${highlight ? 'text-[#28A963]' : ''}`}>
              {formattedValue}
            </p>
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

function DashboardContent() {
  const { t } = useLanguage();
  const { selectedMarkets, setSelectedMarkets, selectedPlatforms, setSelectedPlatforms } = useFilterParams();
  const [competitorDays, setCompetitorDays] = useState<string[]>(["30"]);

  const markets = useQuery(api.markets.list);
  const { getLogoUrl, getEmoji, platforms: allPlatforms } = usePlatformLogos();

  const daysValue = competitorDays.length > 0 ? parseInt(competitorDays[0]) : 30;

  const stats = useQuery(api.insights.getDashboardStats, {
    marketIds: selectedMarkets.length > 0 ? selectedMarkets as Id<"markets">[] : undefined,
    platforms: selectedPlatforms.length > 0 ? selectedPlatforms as ("instagram" | "tiktok" | "youtube")[] : undefined,
  });

  const competitors = useQuery(api.insights.getCompetitorComparison, {
    marketIds: selectedMarkets.length > 0 ? selectedMarkets as Id<"markets">[] : undefined,
    platforms: selectedPlatforms.length > 0 ? selectedPlatforms as ("instagram" | "tiktok" | "youtube")[] : undefined,
    days: daysValue,
  });

  const marketOptions = markets?.map((m) => ({ value: m._id, label: m.name })) || [];

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex gap-4">
          <MultiSelect 
            options={marketOptions} 
            selected={selectedMarkets} 
            onChange={setSelectedMarkets} 
            placeholder={t("dashboard.allMarkets")} 
          />
          <MultiSelect 
            options={platformOptions} 
            selected={selectedPlatforms} 
            onChange={setSelectedPlatforms} 
            placeholder={t("dashboard.allPlatforms")} 
            logoOnly={true} 
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title={t("dashboard.accountsTracked")} 
          value={stats?.accountsTracked || 0} 
          icon={Users} 
          description={t("dashboard.activeCompetitors")} 
        />
        <StatCard 
          title={t("dashboard.totalFollowers")} 
          value={stats?.totalFollowers || 0} 
          icon={TrendingUp} 
          description={t("dashboard.combinedAudience")} 
          highlight 
        />
        <StatCard 
          title={t("dashboard.posts7days")} 
          value={stats?.recentPostsCount || 0} 
          icon={FileText} 
          description={t("dashboard.recentContent")} 
        />
        <StatCard 
          title={t("dashboard.avgEngagement")} 
          value={`${(stats?.avgEngagementRate || 0).toFixed(2)}%`} 
          icon={Heart} 
          description={t("dashboard.likesComments")} 
          highlight 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title={t("dashboard.totalLikes")} 
          value={stats?.totalLikes || 0} 
          icon={Heart} 
          description={t("dashboard.last7days")} 
        />
        <StatCard 
          title={t("dashboard.totalComments")} 
          value={stats?.totalComments || 0} 
          icon={MessageCircle} 
          description={t("dashboard.last7days")} 
        />
        <StatCard 
          title={t("dashboard.totalViews")} 
          value={stats?.totalViews || 0} 
          icon={Eye} 
          description={t("dashboard.last7days")} 
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t("dashboard.competitorRankings")}</h2>
          <MultiSelect 
            options={TIME_PERIOD_OPTIONS} 
            selected={competitorDays} 
            onChange={setCompetitorDays} 
            placeholder="Time Period" 
          />
        </div>
        <CompetitorTable 
          data={competitors || []} 
          title={`${t("dashboard.competitorRankings")} (${TIME_PERIOD_OPTIONS.find(o => o.value === competitorDays[0])?.label || "Last 30 Days"})`} 
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-muted-foreground">{t("common.loading")}</div>}>
      <DashboardContent />
    </Suspense>
  );
}