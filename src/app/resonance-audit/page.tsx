"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Progress } from "@/components/ui/progress"
import {
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Users,
  MessageSquare,
  ArrowRight,
  Hexagon,
  PieChart as PieChartIcon,
  BarChart3,
  Lightbulb,
} from "lucide-react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"

// Demo Data - Resonance Audit for Grupo Horizonte
const DEMO_DATA = {
  alignmentScore: 78,
  messagingMatch: 65,
  hexGrid: [
    {
      concept: "Luxury-Aligned",
      status: "aligned",
      score: 92,
      description: "Premium positioning resonates well with target audience",
    },
    {
      concept: "Fast Delivery",
      status: "error",
      score: 34,
      description: "Delivery promises creating negative sentiment",
    },
    {
      concept: "Family-Friendly",
      status: "unintended_win",
      score: 88,
      description: "Unexpectedly strong resonance with families",
    },
    {
      concept: "Investment Value",
      status: "aligned",
      score: 85,
      description: "ROI messaging performing as intended",
    },
    {
      concept: "Location Premium",
      status: "aligned",
      score: 91,
      description: "Prime location emphasis highly effective",
    },
    {
      concept: "Modern Design",
      status: "partial",
      score: 67,
      description: "Design messaging needs refinement",
    },
  ],
  segmentGaps: [
    {
      segment: "Luxury Investors",
      target: 40,
      actual: 28,
      status: "under",
      gap: -12,
    },
    {
      segment: "Growing Families",
      target: 25,
      actual: 38,
      status: "over",
      gap: 13,
    },
    {
      segment: "First-Time Buyers",
      target: 20,
      actual: 22,
      status: "aligned",
      gap: 2,
    },
    {
      segment: "Retirees",
      target: 15,
      actual: 12,
      status: "under",
      gap: -3,
    },
  ],
  contentThemes: [
    { theme: "Location", value: 42, color: "#28A963" },
    { theme: "Amenities", value: 28, color: "#3B82F6" },
    { theme: "Price/Value", value: 18, color: "#8B5CF6" },
    { theme: "Lifestyle", value: 12, color: "#F59E0B" },
  ],
  alignmentTrends: [
    { month: "Aug", score: 65, messaging: 58 },
    { month: "Sep", score: 68, messaging: 60 },
    { month: "Oct", score: 72, messaging: 62 },
    { month: "Nov", score: 74, messaging: 64 },
    { month: "Dec", score: 76, messaging: 63 },
    { month: "Jan", score: 78, messaging: 65 },
  ],
  radarData: [
    { subject: "Brand Perception", A: 85, fullMark: 100 },
    { subject: "Message Clarity", A: 72, fullMark: 100 },
    { subject: "Target Reach", A: 68, fullMark: 100 },
    { subject: "Competitive Edge", A: 78, fullMark: 100 },
    { subject: "Emotional Connect", A: 82, fullMark: 100 },
    { subject: "Value Proposition", A: 75, fullMark: 100 },
  ],
  alignmentIssues: [
    {
      id: 1,
      issue: "Delivery Timeline Disconnect",
      severity: "high",
      description:
        "Marketing promises 'immediate delivery' but actual timeline is 18-24 months",
      impact: "23% negative sentiment increase",
      recommendation: "Update messaging to '2026 delivery' with construction progress updates",
    },
    {
      id: 2,
      issue: "Price Positioning Gap",
      severity: "medium",
      description:
        "Luxury positioning conflicts with aggressive discount promotions",
      impact: "15% brand perception decline",
      recommendation: "Replace discounts with 'exclusive incentives' language",
    },
    {
      id: 3,
      issue: "Audience Mismatch",
      severity: "low",
      description:
        "Content resonating more with families than targeted luxury investors",
      impact: "Opportunity cost: reaching wrong segment",
      recommendation: "Create separate content tracks for each audience",
    },
  ],
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "aligned":
      return <CheckCircle2 className="h-5 w-5 text-emerald-400" />
    case "error":
      return <XCircle className="h-5 w-5 text-red-400" />
    case "unintended_win":
      return <Sparkles className="h-5 w-5 text-amber-400" />
    case "partial":
      return <AlertTriangle className="h-5 w-5 text-orange-400" />
    default:
      return null
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "aligned":
      return "border-emerald-500/30 bg-emerald-500/10"
    case "error":
      return "border-red-500/30 bg-red-500/10"
    case "unintended_win":
      return "border-amber-500/30 bg-amber-500/10"
    case "partial":
      return "border-orange-500/30 bg-orange-500/10"
    default:
      return "border-gray-500/30 bg-gray-500/10"
  }
}

export default function ResonanceAuditPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Resonance Audit</h1>
          <p className="text-gray-400 mt-1">
            Strategy-to-reality alignment analysis
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

      {/* Hero Scores */}
      <div className="grid grid-cols-2 gap-6">
        {/* Alignment Score */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-[#28A963]" />
              Strategy-Reality Alignment
            </h3>
            <span className="text-sm text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              +4% this month
            </span>
          </div>
          <div className="flex items-center gap-8">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#28A963"
                  strokeWidth="12"
                  strokeDasharray={`${(DEMO_DATA.alignmentScore / 100) * 440} 440`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {DEMO_DATA.alignmentScore}%
                </span>
                <span className="text-sm text-gray-400">Aligned</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">Messaging Match</span>
                  <span className="text-white">{DEMO_DATA.messagingMatch}%</span>
                </div>
                <Progress value={DEMO_DATA.messagingMatch} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">Audience Alignment</span>
                  <span className="text-white">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">Brand Consistency</span>
                  <span className="text-white">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Brand Perception Radar */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#28A963]" />
            Brand Perception Analysis
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={DEMO_DATA.radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#28A963"
                  fill="#28A963"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Strategy Hex Grid */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Hexagon className="h-5 w-5 text-[#28A963]" />
          Strategy Concept Grid
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {DEMO_DATA.hexGrid.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border ${getStatusColor(item.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span className="font-medium text-white">{item.concept}</span>
                </div>
                <span
                  className={`text-lg font-bold ${
                    item.score >= 80
                      ? "text-emerald-400"
                      : item.score >= 60
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {item.score}
                </span>
              </div>
              <p className="text-sm text-gray-400">{item.description}</p>
              <div className="mt-2">
                <Progress
                  value={item.score}
                  className={`h-1.5 ${
                    item.status === "error" ? "[&>div]:bg-red-500" : ""
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-gray-400">Aligned</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-400" />
            <span className="text-sm text-gray-400">Misaligned</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-gray-400">Unintended Win</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <span className="text-sm text-gray-400">Needs Attention</span>
          </div>
        </div>
      </GlassCard>

      {/* Segment Gap Analysis & Content Themes */}
      <div className="grid grid-cols-2 gap-6">
        {/* Segment Gap Analysis */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#28A963]" />
            Segment Gap Analysis
          </h3>
          <div className="space-y-4">
            {DEMO_DATA.segmentGaps.map((segment) => (
              <div key={segment.segment} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{segment.segment}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm px-2 py-0.5 rounded-full ${
                        segment.status === "under"
                          ? "bg-red-500/20 text-red-400"
                          : segment.status === "over"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {segment.gap > 0 ? "+" : ""}
                      {segment.gap}%
                    </span>
                  </div>
                </div>
                <div className="relative h-6 bg-gray-800 rounded-lg overflow-hidden">
                  {/* Target marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
                    style={{ left: `${segment.target}%` }}
                  />
                  {/* Actual bar */}
                  <div
                    className={`absolute top-1 bottom-1 rounded ${
                      segment.status === "under"
                        ? "bg-red-500"
                        : segment.status === "over"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${segment.actual}%`, left: 0 }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Actual: {segment.actual}%</span>
                  <span>Target: {segment.target}%</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Content Theme Distribution */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-[#28A963]" />
            Content Theme Distribution
          </h3>
          <div className="flex items-center gap-6">
            <div className="w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DEMO_DATA.contentThemes}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {DEMO_DATA.contentThemes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {DEMO_DATA.contentThemes.map((theme) => (
                <div key={theme.theme} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white">{theme.theme}</span>
                      <span className="text-white font-medium">{theme.value}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${theme.value}%`,
                          backgroundColor: theme.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Alignment Trends */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#28A963]" />
          Alignment Score Trends
        </h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DEMO_DATA.alignmentTrends}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#28A963" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#28A963" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMessaging" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} domain={[50, 100]} />
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
                dataKey="score"
                stroke="#28A963"
                fill="url(#colorScore)"
                strokeWidth={2}
                name="Alignment Score"
              />
              <Area
                type="monotone"
                dataKey="messaging"
                stroke="#3B82F6"
                fill="url(#colorMessaging)"
                strokeWidth={2}
                name="Messaging Match"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#28A963]" />
            <span className="text-sm text-gray-400">Alignment Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-400">Messaging Match</span>
          </div>
        </div>
      </GlassCard>

      {/* Alignment Issues & Recommendations */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-[#28A963]" />
          Alignment Issues & Recommendations
        </h3>
        <div className="space-y-4">
          {DEMO_DATA.alignmentIssues.map((issue) => (
            <div
              key={issue.id}
              className={`p-4 rounded-xl border ${
                issue.severity === "high"
                  ? "border-red-500/30 bg-red-500/5"
                  : issue.severity === "medium"
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-blue-500/30 bg-blue-500/5"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      issue.severity === "high"
                        ? "bg-red-500/20 text-red-400"
                        : issue.severity === "medium"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{issue.issue}</h4>
                    <p className="text-sm text-gray-400 mt-1">{issue.description}</p>
                    <p className="text-sm text-red-400 mt-2">Impact: {issue.impact}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    issue.severity === "high"
                      ? "bg-red-500/20 text-red-400"
                      : issue.severity === "medium"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {issue.severity.toUpperCase()}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-800">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Lightbulb className="h-4 w-4" />
                  <span className="text-sm font-medium">Recommendation:</span>
                </div>
                <p className="text-sm text-gray-300 mt-1">{issue.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
