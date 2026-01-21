"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Progress } from "@/components/ui/progress"
import { formatNumber, formatCurrency } from "@/lib/utils"
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Flame,
  MessageCircle,
  ArrowRight,
  ExternalLink,
  Instagram,
  Youtube,
  MapPin,
  Clock,
  Star,
  Sparkles,
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
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts"

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

// Demo Data - Commercial Intent Intelligence for Grupo Horizonte
const DEMO_DATA = {
  moneyHeader: {
    estimatedOpportunityValue: 2590000,
    hotLeads: 14,
    avgOrderValue: 185000,
    conversionRate: 1.2,
  },
  salesFunnel: [
    { name: "Tier 1 - Browsing", value: 1240, fill: "#3B82F6", percentage: 88.6 },
    { name: "Tier 2 - Considering", value: 145, fill: "#8B5CF6", percentage: 10.4 },
    { name: "Tier 3 - Ready to Buy", value: 14, fill: "#28A963", percentage: 1.0 },
  ],
  hotLeads: [
    {
      id: 1,
      username: "@maria_inversor",
      platform: "instagram",
      avatar: "M",
      intentSignal: "Preguntó precio específico para Vista del Mar 3BR",
      engagementScore: 98,
      timeAgo: "2h ago",
      estimatedValue: 245000,
      location: "Bogotá",
    },
    {
      id: 2,
      username: "@carlos_bienes",
      platform: "instagram",
      avatar: "C",
      intentSignal: "Solicitó información sobre cuota inicial y financiamiento",
      engagementScore: 94,
      timeAgo: "5h ago",
      estimatedValue: 195000,
      location: "Medellín",
    },
    {
      id: 3,
      username: "@familia_rodriguez",
      platform: "tiktok",
      avatar: "F",
      intentSignal: "Comentó 'Me interesa para inversión' en tour virtual",
      engagementScore: 89,
      timeAgo: "8h ago",
      estimatedValue: 175000,
      location: "Cali",
    },
  ],
  trendingIntentSignals: [
    { keyword: "Precio", count: 342, change: 28, color: "#28A963" },
    { keyword: "Ubicación", count: 287, change: 15, color: "#3B82F6" },
    { keyword: "Cuota Inicial", count: 198, change: 45, color: "#8B5CF6" },
    { keyword: "Entrega 2026", count: 156, change: 32, color: "#F59E0B" },
    { keyword: "Financiamiento", count: 134, change: 22, color: "#EC4899" },
    { keyword: "Metros Cuadrados", count: 112, change: 8, color: "#06B6D4" },
  ],
  platformBreakdown: [
    { name: "Instagram", value: 58, leads: 8, color: "#E1306C" },
    { name: "TikTok", value: 28, leads: 4, color: "#00F2EA" },
    { name: "YouTube", value: 14, leads: 2, color: "#FF0000" },
  ],
  intentTrends: [
    { week: "W1", tier1: 980, tier2: 95, tier3: 8 },
    { week: "W2", tier1: 1050, tier2: 108, tier3: 9 },
    { week: "W3", tier1: 1120, tier2: 125, tier3: 11 },
    { week: "W4", tier1: 1240, tier2: 145, tier3: 14 },
  ],
  projectInterest: [
    { project: "Torre Esmeralda", interest: 32, value: 890000 },
    { project: "Vista del Mar", interest: 28, value: 720000 },
    { project: "Proyecto Marina", interest: 22, value: 540000 },
    { project: "Jardines del Norte", interest: 18, value: 440000 },
  ],
}

export default function CommercialIntentPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Commercial Intent Intelligence</h1>
          <p className="text-gray-400 mt-1">
            Identify and track high-value purchase signals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Money Header KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <GlassCard className="p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <DollarSign className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Estimated Opportunity Value</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(DEMO_DATA.moneyHeader.estimatedOpportunityValue)}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-500/20">
              <Flame className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Hot Leads (Tier 3)</p>
              <p className="text-2xl font-bold text-white">
                {DEMO_DATA.moneyHeader.hotLeads}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <Target className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Average Order Value</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(DEMO_DATA.moneyHeader.avgOrderValue)}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Intent Conversion Rate</p>
              <p className="text-2xl font-bold text-white">
                {DEMO_DATA.moneyHeader.conversionRate}%
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Sales Funnel & Hot Leads */}
      <div className="grid grid-cols-3 gap-6">
        {/* Sales Funnel */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#28A963]" />
            Intent Funnel
          </h3>
          <div className="space-y-4">
            {DEMO_DATA.salesFunnel.map((tier, index) => (
              <div key={tier.name} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">{tier.name}</span>
                  <span className="text-sm font-medium text-white">
                    {formatNumber(tier.value)}
                  </span>
                </div>
                <div className="h-10 rounded-lg overflow-hidden bg-gray-800">
                  <div
                    className="h-full rounded-lg transition-all duration-500 flex items-center justify-center"
                    style={{
                      width: `${Math.max(tier.percentage * 1.1, 15)}%`,
                      backgroundColor: tier.fill,
                    }}
                  >
                    <span className="text-xs font-medium text-white">
                      {tier.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Funnel Velocity</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +18% this month
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Hot Leads Feed */}
        <GlassCard className="col-span-2 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Hot Leads Feed
            <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs">
              {DEMO_DATA.hotLeads.length} Ready to Buy
            </span>
          </h3>
          <div className="space-y-3">
            {DEMO_DATA.hotLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-orange-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {lead.avatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      {lead.platform === "instagram" && (
                        <Instagram className="h-5 w-5 text-pink-500 bg-gray-900 rounded-full p-0.5" />
                      )}
                      {lead.platform === "tiktok" && (
                        <div className="bg-gray-900 rounded-full p-0.5">
                          <TikTokIcon className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{lead.username}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {lead.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                          Score: {lead.engagementScore}
                        </div>
                        <span className="text-xs text-gray-500">{lead.timeAgo}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{lead.intentSignal}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-emerald-400 font-medium">
                        Est. Value: {formatCurrency(lead.estimatedValue)}
                      </span>
                      <button className="text-xs text-[#28A963] hover:text-emerald-300 flex items-center gap-1">
                        View Profile <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Trending Intent Signals & Platform Breakdown */}
      <div className="grid grid-cols-2 gap-6">
        {/* Trending Intent Signals */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#28A963]" />
            Trending Intent Keywords
          </h3>
          <div className="space-y-3">
            {DEMO_DATA.trendingIntentSignals.map((signal, index) => (
              <div key={signal.keyword} className="flex items-center gap-4">
                <span className="text-gray-500 w-6 text-sm">{index + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{signal.keyword}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        {signal.count} mentions
                      </span>
                      <span className="text-xs text-emerald-400 flex items-center gap-0.5">
                        <TrendingUp className="h-3 w-3" />
                        +{signal.change}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(signal.count / 342) * 100}%`,
                        backgroundColor: signal.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Platform Breakdown */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-[#28A963]" />
            Platform Lead Distribution
          </h3>
          <div className="flex items-center gap-8">
            <div className="w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DEMO_DATA.platformBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {DEMO_DATA.platformBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {DEMO_DATA.platformBreakdown.map((platform) => (
                <div
                  key={platform.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: platform.color }}
                    />
                    <span className="text-white">{platform.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-medium">{platform.value}%</span>
                    <span className="text-sm text-gray-400 ml-2">
                      ({platform.leads} leads)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Intent Trends Chart & Project Interest */}
      <div className="grid grid-cols-2 gap-6">
        {/* Intent Trends */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#28A963]" />
            Intent Trends (4 Weeks)
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DEMO_DATA.intentTrends}>
                <defs>
                  <linearGradient id="colorTier1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTier2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTier3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#28A963" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#28A963" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#F9FAFB" }}
                />
                <Area
                  type="monotone"
                  dataKey="tier1"
                  stroke="#3B82F6"
                  fill="url(#colorTier1)"
                  strokeWidth={2}
                  name="Tier 1"
                />
                <Area
                  type="monotone"
                  dataKey="tier2"
                  stroke="#8B5CF6"
                  fill="url(#colorTier2)"
                  strokeWidth={2}
                  name="Tier 2"
                />
                <Area
                  type="monotone"
                  dataKey="tier3"
                  stroke="#28A963"
                  fill="url(#colorTier3)"
                  strokeWidth={2}
                  name="Tier 3"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-400">Browsing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm text-gray-400">Considering</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#28A963]" />
              <span className="text-sm text-gray-400">Ready to Buy</span>
            </div>
          </div>
        </GlassCard>

        {/* Project Interest */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-[#28A963]" />
            Interest by Project
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={DEMO_DATA.projectInterest}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="project"
                  stroke="#9CA3AF"
                  fontSize={12}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#F9FAFB" }}
                  formatter={(value: number, name: string) => [
                    name === "interest"
                      ? `${value} leads`
                      : formatCurrency(value),
                    name === "interest" ? "Interest" : "Est. Value",
                  ]}
                />
                <Bar
                  dataKey="interest"
                  fill="#28A963"
                  radius={[0, 4, 4, 0]}
                  name="Interest"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="grid grid-cols-2 gap-4">
              {DEMO_DATA.projectInterest.slice(0, 2).map((project) => (
                <div
                  key={project.project}
                  className="p-3 rounded-lg bg-gray-800/50"
                >
                  <p className="text-sm text-gray-400">{project.project}</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {formatCurrency(project.value)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {project.interest} interested leads
                  </p>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
