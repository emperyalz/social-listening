"use client";

import { Suspense, useState, useMemo } from "react";
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

// ============================================
// DEMO DATA FOR GRUPO HORIZONTE
// ============================================
const DEMO_STATS = {
  accountsTracked: 12,
  recentPostsCount: 47,
  totalViews: 850500,
  totalFollowers: 125000,
  totalLikes: 45200,
  totalComments: 8900,
  avgEngagementRate: 3.82,
};

const DEMO_COMPETITORS = [
  { account: { platform: "instagram", username: "constructora_colpatria" }, followers: 185000, followerGrowth: 12500, followerGrowthRate: "7.2", engagementRate: "4.5" },
  { account: { platform: "instagram", username: "amarilo_oficial" }, followers: 142000, followerGrowth: 8900, followerGrowthRate: "6.7", engagementRate: "5.2" },
  { account: { platform: "tiktok", username: "grupo_horizonte" }, followers: 95000, followerGrowth: 15200, followerGrowthRate: "19.0", engagementRate: "8.1" },
  { account: { platform: "youtube", username: "GrupoHorizonteTV" }, followers: 45000, followerGrowth: 3200, followerGrowthRate: "7.6", engagementRate: "6.2" },
  { account: { platform: "instagram", username: "cusezar_colombia" }, followers: 78000, followerGrowth: 4100, followerGrowthRate: "5.5", engagementRate: "3.8" },
];

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

  // Use demo data instead of Convex queries
  const stats = DEMO_STATS;
  const competitors = DEMO_COMPETITORS;

  // Calculate derived metrics
  const portfolioReach = useMemo(() => {
    return stats.totalViews + (stats.totalFollowers || 0);
  }, [stats]);

  const engagementRate = useMemo(() => {
    return stats.avgEngagementRate || 0;
  }, [stats]);

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
    const viewsPerPost = stats.recentPostsCount > 0
      ? stats.totalViews / stats.recentPostsCount
      : 0;
    if (viewsPerPost > 10000) return "High Acceleration";
    if (viewsPerPost > 1000) return "Moderate";
    return "Building";
  }, [stats]);
  const revenueRisk = 18400;

  // Generate alerts from competitor data
  const alerts = useMemo<AlertItem[]>(() => {
    const generatedAlerts: AlertItem[] = [
      {
        id: "viral-1",
        type: "viral",
        platform: "tiktok",
        title: "Torre Esmeralda post gaining traction",
        description: "+340% engagement in 2 hours on property tour reel",
        metric: "+12.5K views",
      },
      {
        id: "opp-1",
        type: "opportunity",
        platform: "instagram",
        title: "@maria_inversor asking about Vista del Mar",
        description: "High-intent comment on 3BR unit pricing - respond within 1hr",
        metric: "Est. Value: $245,000",
      },
      {
        id: "risk-1",
        type: "risk",
        platform: "instagram",
        title: "Negative comment on Proyecto Marina",
        description: "Customer complaint about delivery delays - requires response",
        metric: "+50 likes on comment",
      },
      {
        id: "viral-2",
        type: "viral",
        platform: "youtube",
        title: "Amarilo's new campaign detected",
        description: "Competitor launched luxury apartment video series",
        metric: "+45K views in 24hrs",
      },
      {
        id: "opp-2",
        type: "opportunity",
        platform: "tiktok",
        title: "Trending hashtag #InversionColombia",
        description: "High engagement opportunity - create content within 6hrs",
        metric: "2.1M hashtag views",
      },
    ];
    return generatedAlerts;
  }, []);

  // Growth trend data
  const growthData = useMemo<GrowthDataPoint[]>(() => {
    const dates: GrowthDataPoint[] = [];
    const today = new Date();

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const factor = 1 - (i * 0.008);
      const noise = () => (Math.random() - 0.5) * 5000;

      dates.push({
        date: dateStr,
        instagram: Math.round(185000 * factor + noise()),
        tiktok: Math.round(95000 * factor + noise()),
        youtube: Math.round(45000 * factor + noise()),
      });
    }

    return dates;
  }, []);

  // Sparkline data
  const reachSparkline = useMemo(() => {
    return growthData.slice(-7).map((d) => (d.instagram || 0) + (d.tiktok || 0) + (d.youtube || 0));
  }, [growthData]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
            Demo Mode - Grupo Horizonte
          </span>
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
            change={0.4}
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
            subtitle="Brand perception strong and consistent"
            icon={<span className="text-blue-500 text-xl">🛡️</span>}
            status="optimal"
            accentColor="#3b82f6"
          />
          <HealthCard
            title="Viral Velocity"
            score={65}
            maxScore={100}
            subtitle="Content spread at moderate pace"
            icon={<span className="text-emerald-500 text-xl">⚡</span>}
            status="warning"
            accentColor="#10b981"
          />
          <HealthCard
            title="Revenue Risk"
            score={formatCurrency(revenueRisk)}
            subtitle="28 Unanswered Leads"
            icon={<span className="text-red-500 text-xl">💰</span>}
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
