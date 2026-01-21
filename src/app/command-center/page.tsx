"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatNumber, formatCurrency } from "@/lib/utils"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  Share2,
  DollarSign,
  AlertTriangle,
  Zap,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  MessageCircle,
  Instagram,
  Youtube,
  Clock,
  Eye,
  Target,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"

// Demo Data - Grupo Horizonte (Colombian Real Estate Developer)
const DEMO_DATA = {
  macroKPIs: {
    portfolioReach: {
      value: 850500,
      change: 12.5,
      label: "Portfolio Reach",
    },
    engagementRate: {
      value: 3.82,
      change: 0.4,
      label: "Engagement Rate",
    },
    marketShare: {
      value: 14.5,
      change: 2.1,
      label: "Market Share",
    },
    avgResponseTime: {
      value: 2.4,
      change: -0.8,
      label: "Avg Response (hrs)",
    },
  },
  healthCards: [
    {
      title: "Market Integrity",
      score: 94,
      maxScore: 100,
      status: "excellent",
      description: "Brand perception is strong and consistent",
      icon: Shield,
    },
    {
      title: "Viral Velocity",
      score: 65,
      maxScore: 100,
      status: "moderate",
      description: "Content spread at moderate pace",
      icon: Zap,
    },
    {
      title: "Revenue Risk",
      score: 18400,
      maxScore: null,
      status: "warning",
      description: "28 Unanswered Leads",
      icon: DollarSign,
      isCurrency: true,
    },
  ],
  liveIntelligence: [
    {
      id: 1,
      type: "spike",
      title: "Engagement Spike Detected",
      description: "Torre Esmeralda post gaining viral traction (+340% engagement)",
      timestamp: "2 min ago",
      severity: "success",
      platform: "instagram",
    },
    {
      id: 2,
      type: "alert",
      title: "Negative Sentiment Alert",
      description: "Customer complaint about delivery delays in Proyecto Marina",
      timestamp: "15 min ago",
      severity: "warning",
      platform: "instagram",
    },
    {
      id: 3,
      type: "competitor",
      title: "Competitor Campaign Detected",
      description: "Grupo Argos launched new luxury apartment campaign",
      timestamp: "1 hour ago",
      severity: "info",
      platform: "youtube",
    },
    {
      id: 4,
      type: "lead",
      title: "Hot Lead Identified",
      description: "@maria_inversor asked about pricing for Vista del Mar units",
      timestamp: "3 hours ago",
      severity: "success",
      platform: "instagram",
    },
  ],
  platformGrowth: [
    { month: "Aug", instagram: 620000, youtube: 180000, tiktok: 95000 },
    { month: "Sep", instagram: 685000, youtube: 195000, tiktok: 120000 },
    { month: "Oct", instagram: 720000, youtube: 215000, tiktok: 155000 },
    { month: "Nov", instagram: 780000, youtube: 240000, tiktok: 195000 },
    { month: "Dec", instagram: 815000, youtube: 260000, tiktok: 245000 },
    { month: "Jan", instagram: 850500, youtube: 285000, tiktok: 310000 },
  ],
  engagementTrends: [
    { day: "Mon", rate: 3.2, comments: 245, shares: 89 },
    { day: "Tue", rate: 3.5, comments: 312, shares: 124 },
    { day: "Wed", rate: 3.8, comments: 428, shares: 167 },
    { day: "Thu", rate: 4.1, comments: 389, shares: 145 },
    { day: "Fri", rate: 3.9, comments: 356, shares: 132 },
    { day: "Sat", rate: 4.2, comments: 478, shares: 198 },
    { day: "Sun", rate: 3.6, comments: 289, shares: 95 },
  ],
  competitorComparison: [
    { name: "Grupo Horizonte", reach: 850500, engagement: 3.82, share: 14.5 },
    { name: "Grupo Argos", reach: 1200000, engagement: 2.9, share: 18.2 },
    { name: "Constructora Colpatria", reach: 650000, engagement: 3.1, share: 11.8 },
    { name: "Amarilo", reach: 520000, engagement: 4.2, share: 9.5 },
    { name: "Prodesa", reach: 480000, engagement: 3.5, share: 8.7 },
  ],
}

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

export default function CommandCenterPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Command Center</h1>
          <p className="text-gray-400 mt-1">
            Real-time overview for Grupo Horizonte
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Data
          </div>
          <span className="text-gray-500">Last updated: Just now</span>
        </div>
      </div>

      {/* Macro KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(DEMO_DATA.macroKPIs).map(([key, kpi]) => (
          <GlassCard key={key} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400">{kpi.label}</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {key === "engagementRate" || key === "marketShare"
                    ? `${kpi.value}%`
                    : key === "avgResponseTime"
                    ? `${kpi.value}h`
                    : formatNumber(kpi.value)}
                </p>
              </div>
              <div
                className={`flex items-center gap-1 text-sm ${
                  kpi.change >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {kpi.change >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {Math.abs(kpi.change)}%
              </div>
            </div>
            <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#28A963] to-emerald-400 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    key === "engagementRate"
                      ? kpi.value * 20
                      : key === "marketShare"
                      ? kpi.value * 5
                      : 75
                  )}%`,
                }}
              />
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Health Cards & Live Intelligence */}
      <div className="grid grid-cols-3 gap-6">
        {/* Health Cards */}
        <div className="col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#28A963]" />
            Health Indicators
          </h2>
          {DEMO_DATA.healthCards.map((card, index) => (
            <GlassCard
              key={index}
              className="p-4"
              variant={
                card.status === "excellent"
                  ? "success"
                  : card.status === "warning"
                  ? "warning"
                  : "default"
              }
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    card.status === "excellent"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : card.status === "warning"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  <card.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white">{card.title}</h3>
                    <span
                      className={`text-lg font-bold ${
                        card.status === "excellent"
                          ? "text-emerald-400"
                          : card.status === "warning"
                          ? "text-amber-400"
                          : "text-blue-400"
                      }`}
                    >
                      {card.isCurrency
                        ? formatCurrency(card.score)
                        : `${card.score}${card.maxScore ? `/${card.maxScore}` : ""}`}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{card.description}</p>
                  {card.maxScore && (
                    <Progress
                      value={(card.score / card.maxScore) * 100}
                      className="mt-2 h-1.5"
                    />
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Live Intelligence Feed */}
        <div className="col-span-2">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-[#28A963]" />
            Live Intelligence Feed
          </h2>
          <GlassCard className="p-0 divide-y divide-gray-800">
            {DEMO_DATA.liveIntelligence.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      item.severity === "success"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : item.severity === "warning"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {item.type === "spike" && <TrendingUp className="h-4 w-4" />}
                    {item.type === "alert" && (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    {item.type === "competitor" && <Target className="h-4 w-4" />}
                    {item.type === "lead" && <DollarSign className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white text-sm">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {item.platform === "instagram" && (
                          <Instagram className="h-4 w-4 text-pink-500" />
                        )}
                        {item.platform === "youtube" && (
                          <Youtube className="h-4 w-4 text-red-500" />
                        )}
                        {item.platform === "tiktok" && (
                          <TikTokIcon className="h-4 w-4 text-white" />
                        )}
                        <span className="text-xs text-gray-500">
                          {item.timestamp}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Platform Growth Trends */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#28A963]" />
            Platform Growth Trends
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DEMO_DATA.platformGrowth}>
                <defs>
                  <linearGradient id="colorInstagram" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E1306C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E1306C" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorYoutube" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF0000" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF0000" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTiktok" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F2EA" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00F2EA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#F9FAFB" }}
                  formatter={(value: number) => [formatNumber(value), ""]}
                />
                <Area
                  type="monotone"
                  dataKey="instagram"
                  stroke="#E1306C"
                  fill="url(#colorInstagram)"
                  strokeWidth={2}
                  name="Instagram"
                />
                <Area
                  type="monotone"
                  dataKey="youtube"
                  stroke="#FF0000"
                  fill="url(#colorYoutube)"
                  strokeWidth={2}
                  name="YouTube"
                />
                <Area
                  type="monotone"
                  dataKey="tiktok"
                  stroke="#00F2EA"
                  fill="url(#colorTiktok)"
                  strokeWidth={2}
                  name="TikTok"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-sm text-gray-400">Instagram</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-400">YouTube</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="text-sm text-gray-400">TikTok</span>
            </div>
          </div>
        </GlassCard>

        {/* Engagement Trends */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-[#28A963]" />
            Weekly Engagement Trends
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMO_DATA.engagementTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#F9FAFB" }}
                />
                <Bar
                  dataKey="comments"
                  fill="#28A963"
                  radius={[4, 4, 0, 0]}
                  name="Comments"
                />
                <Bar
                  dataKey="shares"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  name="Shares"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#28A963]" />
              <span className="text-sm text-gray-400">Comments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-400">Shares</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Competitor Comparison */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-[#28A963]" />
          Competitor Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                  Company
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                  Total Reach
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                  Engagement Rate
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                  Market Share
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {DEMO_DATA.competitorComparison.map((competitor, index) => (
                <tr
                  key={competitor.name}
                  className={`border-b border-gray-800/50 ${
                    index === 0 ? "bg-[#28A963]/10" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0
                            ? "bg-[#28A963] text-white"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {competitor.name.charAt(0)}
                      </div>
                      <span
                        className={`font-medium ${
                          index === 0 ? "text-[#28A963]" : "text-white"
                        }`}
                      >
                        {competitor.name}
                        {index === 0 && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#28A963]/20 text-[#28A963]">
                            You
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-white">
                    {formatNumber(competitor.reach)}
                  </td>
                  <td className="py-3 px-4 text-right text-white">
                    {competitor.engagement}%
                  </td>
                  <td className="py-3 px-4 text-right text-white">
                    {competitor.share}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div
                      className={`inline-flex items-center gap-1 ${
                        index === 0 || index === 3
                          ? "text-emerald-400"
                          : index === 1
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      {index === 0 || index === 3 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
