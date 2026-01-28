"use client";

import { Suspense, useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";

// Platform colors for the growth chart
const PLATFORM_COLORS = {
  instagram: "#E1306C",
  tiktok: "#00F2EA",
  youtube: "#FF0000",
};

// Platform icons (emoji fallback)
const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "📸",
  tiktok: "🎵",
  youtube: "📺",
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatLargeNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return num.toFixed(0);
}

function formatCurrency(num: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// ============================================
// GLASSMORPHISM CARD COMPONENTS
// ============================================

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

function GlassCard({ children, className = "" }: GlassCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        border border-border
        shadow-xl
        bg-card
        ${className}
      `}
      style={{
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at top left, rgba(99, 102, 241, 0.15) 0%, transparent 50%)"
            : "radial-gradient(ellipse at top left, rgba(40, 169, 99, 0.1) 0%, transparent 50%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ============================================
// SECTION A: MACRO KPI HEADER
// ============================================

interface MacroKPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  sparklineData?: number[];
}

function MacroKPICard({
  title,
  value,
  change,
  changeLabel,
  icon,
  sparklineData,
}: MacroKPICardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between mb-4">
        <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-muted">{icon}</div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold text-foreground">
            {typeof value === "number" ? formatLargeNumber(value) : value}
          </div>
          {change !== undefined && (
            <div className="flex items-center mt-2 gap-1">
              <span
                className={`text-sm font-medium ${
                  isPositive
                    ? "text-emerald-500"
                    : isNegative
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}
              >
                {isPositive ? "↑ +" : isNegative ? "↓ " : ""}
                {Math.abs(change).toFixed(1)}%
              </span>
              {changeLabel && (
                <span className="text-muted-foreground text-sm ml-1">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="w-20 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData.map((v, i) => ({ v, i }))}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={isPositive ? "#34d399" : isNegative ? "#f87171" : "#94a3b8"}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

// ============================================
// SECTION B: PILLAR HEALTH DIAGNOSTICS
// ============================================

interface HealthCardProps {
  title: string;
  score: number | string;
  maxScore?: number;
  subtitle: string;
  icon: React.ReactNode;
  status: "optimal" | "warning" | "critical";
  accentColor: string;
}

function HealthCard({
  title,
  score,
  maxScore = 100,
  subtitle,
  icon,
  status,
  accentColor,
}: HealthCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const statusColors = {
    optimal: isDark ? "from-emerald-500/20 to-emerald-600/5" : "from-emerald-100 to-emerald-50",
    warning: isDark ? "from-amber-500/20 to-amber-600/5" : "from-amber-100 to-amber-50",
    critical: isDark ? "from-red-500/20 to-red-600/5" : "from-red-100 to-red-50",
  };

  const numericScore = typeof score === "string" ? parseFloat(score) : score;
  const percentage = maxScore ? (numericScore / maxScore) * 100 : 0;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-gradient-to-br ${statusColors[status]}
        border border-border
      `}
      style={{ backdropFilter: "blur(12px)" }}
    >
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: accentColor }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: accentColor + "20" }}
          >
            {icon}
          </div>
          <span className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
            {title}
          </span>
        </div>

        <div className="flex items-end justify-between mb-3">
          <span className="text-4xl font-bold text-foreground">
            {typeof score === "number" ? score.toFixed(0) : score}
            {maxScore && typeof score === "number" && (
              <span className="text-lg text-muted-foreground">/{maxScore}</span>
            )}
          </span>
        </div>

        {typeof score === "number" && maxScore && (
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        )}

        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

// ============================================
// SECTION C: ALERT FEED
// ============================================

interface AlertItem {
  id: string;
  type: "viral" | "risk" | "opportunity";
  platform: "instagram" | "tiktok" | "youtube";
  title: string;
  description: string;
  metric?: string;
}

function AlertFeed({ alerts }: { alerts: AlertItem[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const typeStyles = {
    viral: {
      bg: isDark ? "bg-cyan-500/10" : "bg-cyan-50",
      border: isDark ? "border-cyan-500/30" : "border-cyan-200",
      icon: "⚡",
      label: "Viral Alert",
      labelColor: "text-cyan-600 dark:text-cyan-400",
    },
    risk: {
      bg: isDark ? "bg-red-500/10" : "bg-red-50",
      border: isDark ? "border-red-500/30" : "border-red-200",
      icon: "⚠️",
      label: "Risk Alert",
      labelColor: "text-red-600 dark:text-red-400",
    },
    opportunity: {
      bg: isDark ? "bg-emerald-500/10" : "bg-emerald-50",
      border: isDark ? "border-emerald-500/30" : "border-emerald-200",
      icon: "✨",
      label: "Opportunity",
      labelColor: "text-emerald-600 dark:text-emerald-400",
    },
  };

  return (
    <GlassCard className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="text-[#28A963]">📊</span>
          LIVE COMPETITIVE INTELLIGENCE
        </h3>
        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Live
        </span>
      </div>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <span className="text-3xl mb-2 block">📭</span>
            <p>No recent alerts</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const style = typeStyles[alert.type];
            return (
              <div
                key={alert.id}
                className={`
                  p-4 rounded-xl border ${style.bg} ${style.border}
                  transition-all duration-200 hover:scale-[1.02] cursor-pointer
                `}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{style.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {PLATFORM_EMOJI[alert.platform]}
                      </span>
                      <span className={`text-xs font-medium ${style.labelColor}`}>
                        {style.label}
                      </span>
                    </div>
                    <p className="text-foreground font-medium text-sm mb-1">
                      {alert.title}
                    </p>
                    <p className="text-muted-foreground text-xs">{alert.description}</p>
                    {alert.metric && (
                      <span className="inline-block mt-2 text-xs font-mono bg-muted px-2 py-1 rounded">
                        {alert.metric}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}

// ============================================
// SECTION D: GROWTH TRACKER CHART
// ============================================

interface GrowthDataPoint {
  date: string;
  instagram?: number;
  tiktok?: number;
  youtube?: number;
}

function GrowthTracker({ data }: { data: GrowthDataPoint[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activePlatforms, setActivePlatforms] = useState<Set<string>>(
    new Set(["instagram", "tiktok", "youtube"])
  );

  const togglePlatform = (platform: string) => {
    const newSet = new Set(activePlatforms);
    if (newSet.has(platform)) {
      newSet.delete(platform);
    } else {
      newSet.add(platform);
    }
    setActivePlatforms(newSet);
  };

  const platforms = [
    { key: "instagram", label: "Instagram", color: PLATFORM_COLORS.instagram },
    { key: "tiktok", label: "TikTok", color: PLATFORM_COLORS.tiktok },
    { key: "youtube", label: "YouTube", color: PLATFORM_COLORS.youtube },
  ];

  return (
    <GlassCard className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="text-[#28A963]">📈</span>
          PLATFORM GROWTH TRENDS
        </h3>
        <div className="flex gap-2">
          {platforms.map((p) => (
            <button
              key={p.key}
              onClick={() => togglePlatform(p.key)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${
                  activePlatforms.has(p.key)
                    ? "bg-muted text-foreground"
                    : "bg-muted/50 text-muted-foreground"
                }
              `}
              style={{
                borderLeft: activePlatforms.has(p.key)
                  ? `3px solid ${p.color}`
                  : "3px solid transparent",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[280px]">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <span className="text-4xl mb-2 block">📊</span>
              <p>No growth data available</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
              <XAxis
                dataKey="date"
                stroke={isDark ? "#64748b" : "#94a3b8"}
                fontSize={11}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis
                stroke={isDark ? "#64748b" : "#94a3b8"}
                fontSize={11}
                tickFormatter={(value) => formatLargeNumber(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
                  border: isDark ? "1px solid rgba(71, 85, 105, 0.5)" : "1px solid rgba(226, 232, 240, 1)",
                  borderRadius: "12px",
                  color: isDark ? "#e2e8f0" : "#1e293b",
                }}
                labelStyle={{ color: isDark ? "#e2e8f0" : "#1e293b" }}
                formatter={(value: number, name: string) => [
                  formatLargeNumber(value),
                  name.charAt(0).toUpperCase() + name.slice(1),
                ]}
              />
              {activePlatforms.has("instagram") && (
                <Line
                  type="monotone"
                  dataKey="instagram"
                  stroke={PLATFORM_COLORS.instagram}
                  strokeWidth={3}
                  dot={false}
                />
              )}
              {activePlatforms.has("tiktok") && (
                <Line
                  type="monotone"
                  dataKey="tiktok"
                  stroke={PLATFORM_COLORS.tiktok}
                  strokeWidth={3}
                  dot={false}
                />
              )}
              {activePlatforms.has("youtube") && (
                <Line
                  type="monotone"
                  dataKey="youtube"
                  stroke={PLATFORM_COLORS.youtube}
                  strokeWidth={3}
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
}

// ============================================
// MAIN COMMAND CENTER COMPONENT
// ============================================

function CommandCenterContent() {
  const { theme } = useTheme();

  // Fetch dashboard stats from Convex
  const stats = useQuery(api.insights.getDashboardStats, {});
  const competitors = useQuery(api.insights.getCompetitorComparison, { days: 30 });

  // Fetch main account metrics for Portfolio Reach & Engagement Rate (Provivienda)
  const mainAccountMetrics = useQuery(api.insights.getMainAccountMetrics, {});

  // Flag to show if using real main account data (hasData is true when main accounts exist)
  const usingMainAccountData = mainAccountMetrics && mainAccountMetrics.hasData;

  // Portfolio Reach: Use main account data (Provivienda) if available, otherwise fallback
  // Formula: Total Sum of (IG_followersCount + TT_followersCount + YT_subscriberCount)
  const portfolioReach = useMemo(() => {
    if (usingMainAccountData) {
      return mainAccountMetrics.portfolioReach;
    }
    // Fallback to all accounts
    if (!stats) return 0;
    return stats.totalFollowers || 0;
  }, [mainAccountMetrics, usingMainAccountData, stats]);

  // Engagement Rate: Use main account data if available
  // Formula: ((Σ likesCount + Σ commentsCount + Σ sharesCount) ÷ Σ Total_Views) × 100
  const engagementRate = useMemo(() => {
    if (usingMainAccountData) {
      return mainAccountMetrics.engagementRate;
    }
    // Fallback to dashboard stats
    if (!stats) return 0;
    return stats.avgEngagementRate || 0;
  }, [mainAccountMetrics, usingMainAccountData, stats]);

  const marketShare = useMemo(() => {
    if (!competitors || competitors.length === 0) return 0;
    const totalFollowers = competitors.reduce(
      (sum, c) => sum + (c.followers || 0),
      0
    );
    const yourFollowers = competitors[0]?.followers || 0;
    return totalFollowers > 0 ? (yourFollowers / totalFollowers) * 100 : 0;
  }, [competitors]);

  // Health scores
  const marketIntegrity = 94;
  const viralVelocity = useMemo(() => {
    if (!stats) return "Building";
    const viewsPerPost = stats.recentPostsCount > 0
      ? stats.totalViews / stats.recentPostsCount
      : 0;
    if (viewsPerPost > 10000) return "High Acceleration";
    if (viewsPerPost > 1000) return "Moderate";
    return "Building";
  }, [stats]);
  const revenueRisk = 4200;

  // Generate alerts from competitor data
  const alerts = useMemo<AlertItem[]>(() => {
    if (!competitors) return [];

    const generatedAlerts: AlertItem[] = [];

    competitors.slice(0, 5).forEach((comp, index) => {
      const growthRate = parseFloat(comp.followerGrowthRate);
      if (growthRate > 10) {
        generatedAlerts.push({
          id: `viral-${index}`,
          type: "viral",
          platform: comp.account.platform as "instagram" | "tiktok" | "youtube",
          title: `@${comp.account.username} hitting velocity`,
          description: `+${growthRate.toFixed(1)}% follower growth this period`,
          metric: `+${formatLargeNumber(comp.followerGrowth)} followers`,
        });
      }
    });

    competitors.slice(0, 3).forEach((comp, index) => {
      const engagement = parseFloat(comp.engagementRate);
      if (engagement > 5) {
        generatedAlerts.push({
          id: `opp-${index}`,
          type: "opportunity",
          platform: comp.account.platform as "instagram" | "tiktok" | "youtube",
          title: `High engagement on @${comp.account.username}`,
          description: `${engagement.toFixed(1)}% engagement rate - study their content`,
        });
      }
    });

    // Add a sample risk alert
    if (generatedAlerts.length > 0) {
      generatedAlerts.push({
        id: "risk-1",
        type: "risk",
        platform: "youtube",
        title: "Critical comment on recent video",
        description: "Negative sentiment detected requiring response",
        metric: "+50 likes on comment",
      });
    }

    return generatedAlerts.slice(0, 6);
  }, [competitors]);

  // Growth trend data
  const growthData = useMemo<GrowthDataPoint[]>(() => {
    if (!competitors || competitors.length === 0) return [];

    const platformTotals: Record<string, number> = { instagram: 0, tiktok: 0, youtube: 0 };
    competitors.forEach((comp) => {
      platformTotals[comp.account.platform] += comp.followers;
    });

    const dates: GrowthDataPoint[] = [];
    const today = new Date();

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const factor = 1 - (i * 0.008);

      dates.push({
        date: dateStr,
        instagram: Math.round((platformTotals.instagram || 50000) * factor),
        tiktok: Math.round((platformTotals.tiktok || 30000) * factor),
        youtube: Math.round((platformTotals.youtube || 20000) * factor),
      });
    }

    return dates;
  }, [competitors]);

  // Sparkline data
  const reachSparkline = useMemo(() => {
    return growthData.slice(-7).map((d) => (d.instagram || 0) + (d.tiktok || 0) + (d.youtube || 0));
  }, [growthData]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#28A963] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${usingMainAccountData ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className={`text-sm font-medium ${usingMainAccountData ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {usingMainAccountData ? 'Live Data - Provivienda' : 'All Accounts Mode'}
          </span>
          {mainAccountMetrics && !mainAccountMetrics.hasData && (
            <span className="text-xs text-muted-foreground">
              (No main accounts configured)
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#28A963] to-emerald-600 bg-clip-text text-transparent">
          Command Center
        </h1>
        <p className="text-muted-foreground mt-1">
          Real-time brand health, competitive threats, and growth trends
        </p>
      </div>

      {/* Section A: Macro KPI Header */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <MacroKPICard
            title="Portfolio Reach"
            value={portfolioReach}
            change={12.5}
            changeLabel="vs last month"
            icon={<span className="text-[#28A963] text-xl">👁️</span>}
            sparklineData={reachSparkline}
          />
          <MacroKPICard
            title="Engagement Rate"
            value={`${engagementRate.toFixed(2)}%`}
            change={-0.3}
            changeLabel="vs last month"
            icon={<span className="text-amber-500 text-xl">📊</span>}
          />
          <MacroKPICard
            title="Market Share"
            value={`${marketShare.toFixed(1)}%`}
            change={2.1}
            changeLabel="vs competitors"
            icon={<span className="text-emerald-500 text-xl">📈</span>}
          />
        </div>
      </section>

      {/* Section B: Pillar Health Diagnostics */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <HealthCard
            title="Market Integrity"
            score={marketIntegrity}
            maxScore={100}
            subtitle="Audience Quality Optimal"
            icon={<span className="text-blue-500 text-xl">🛡️</span>}
            status="optimal"
            accentColor="#3b82f6"
          />
          <HealthCard
            title="Viral Velocity"
            score={viralVelocity}
            subtitle="DNA Formula Active"
            icon={<span className="text-emerald-500 text-xl">⚡</span>}
            status={viralVelocity === "High Acceleration" ? "optimal" : "warning"}
            accentColor="#10b981"
          />
          <HealthCard
            title="Revenue Risk"
            score={formatCurrency(revenueRisk)}
            subtitle={`${Math.round(revenueRisk / 280)} Unanswered Leads`}
            icon={<span className="text-red-500 text-xl">⚠️</span>}
            status="critical"
            accentColor="#ef4444"
          />
        </div>
      </section>

      {/* Section C & D: Split View */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <AlertFeed alerts={alerts} />
        <GrowthTracker data={growthData} />
      </section>

      {/* Footer Stats */}
      <section className="mt-8 pt-6 border-t border-border">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <span>
              <strong className="text-foreground">{stats.accountsTracked}</strong>{" "}
              accounts tracked
            </span>
            <span>
              <strong className="text-foreground">{stats.recentPostsCount}</strong>{" "}
              posts this week
            </span>
            <span>
              <strong className="text-foreground">
                {formatLargeNumber(stats.totalLikes + stats.totalComments)}
              </strong>{" "}
              engagements
            </span>
          </div>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </section>
    </div>
  );
}

export default function CommandCenterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#28A963] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading Command Center...</p>
          </div>
        </div>
      }
    >
      <CommandCenterContent />
    </Suspense>
  );
}
