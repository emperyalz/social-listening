"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Progress } from "@/components/ui/progress"
import { formatNumber } from "@/lib/utils"
import {
  Wand2,
  Video,
  Image,
  FileText,
  Clock,
  Hash,
  MessageSquare,
  TrendingUp,
  Star,
  Zap,
  Play,
  Eye,
  Heart,
  Calendar,
  BarChart3,
  Award,
  Sparkles,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Demo Data - Content Reverse-Engineering for Grupo Horizonte
const DEMO_DATA = {
  contentDNA: {
    topFormat: { name: "Reels/Video Tours", icon: Video, score: 95 },
    bestHook: { name: "Price Reveal", icon: Zap, score: 98 },
    optimalLength: { name: "Short (15-30s)", icon: Clock, score: 88 },
    bestCTA: { name: "Comment Keyword", icon: MessageSquare, score: 85 },
  },
  formatPerformance: [
    { format: "Reels", score: 95, engagement: 4.2, reach: 125000 },
    { format: "Carousels", score: 78, engagement: 3.1, reach: 85000 },
    { format: "Static Images", score: 45, engagement: 1.8, reach: 42000 },
    { format: "Stories", score: 62, engagement: 2.4, reach: 68000 },
    { format: "Live Tours", score: 88, engagement: 5.1, reach: 95000 },
  ],
  hookEffectiveness: [
    { hook: "Price Hook", score: 98, examples: '"Desde $X al mes"', color: "#28A963" },
    { hook: "Location Tease", score: 85, examples: '"A 5 min de..."', color: "#3B82F6" },
    { hook: "Lifestyle Promise", score: 72, examples: '"Tu nueva vida..."', color: "#8B5CF6" },
    { hook: "Urgency", score: 68, examples: '"\u00daltimas unidades"', color: "#F59E0B" },
    { hook: "Agent Intro", score: 35, examples: '"Hola, soy..."', color: "#EF4444" },
  ],
  lengthAnalysis: [
    { length: "0-15s", engagement: 3.2, completion: 92 },
    { length: "15-30s", engagement: 4.5, completion: 78 },
    { length: "30-60s", engagement: 3.8, completion: 54 },
    { length: "60-90s", engagement: 2.9, completion: 38 },
    { length: "90s+", engagement: 2.1, completion: 22 },
  ],
  hashtagAnalysis: [
    { tag: "#ApartamentosBogota", reach: 245000, engagement: 4.2 },
    { tag: "#InversionInmobiliaria", reach: 198000, engagement: 3.8 },
    { tag: "#VistasAlMar", reach: 175000, engagement: 4.5 },
    { tag: "#ViviendaNueva", reach: 156000, engagement: 3.2 },
    { tag: "#LujoyCómfort", reach: 134000, engagement: 3.9 },
  ],
  ctaEffectiveness: [
    { cta: "Comment keyword for info", conversion: 12.5, score: 98 },
    { cta: "Link in bio", conversion: 8.2, score: 75 },
    { cta: "DM for details", conversion: 6.8, score: 68 },
    { cta: "Visit website", conversion: 4.2, score: 45 },
    { cta: "Call now", conversion: 2.1, score: 28 },
  ],
  topVsBottom: {
    top: {
      avgEngagement: 4.8,
      avgReach: 185000,
      commonTraits: ["Price in first 3s", "Vertical format", "Music trending", "Clear CTA"],
    },
    bottom: {
      avgEngagement: 1.2,
      avgReach: 28000,
      commonTraits: ["Long intro", "No hook", "Poor audio", "No CTA"],
    },
  },
  bestPostingTimes: [
    { day: "Mon", hours: [8, 12, 19] },
    { day: "Tue", hours: [7, 13, 20] },
    { day: "Wed", hours: [8, 12, 18] },
    { day: "Thu", hours: [9, 13, 20] },
    { day: "Fri", hours: [8, 14, 21] },
    { day: "Sat", hours: [10, 15, 20] },
    { day: "Sun", hours: [11, 16, 19] },
  ],
  postingHeatmap: [
    { hour: "6am", Mon: 20, Tue: 25, Wed: 22, Thu: 18, Fri: 30, Sat: 45, Sun: 50 },
    { hour: "9am", Mon: 65, Tue: 70, Wed: 68, Thu: 72, Fri: 60, Sat: 55, Sun: 48 },
    { hour: "12pm", Mon: 85, Tue: 82, Wed: 88, Thu: 80, Fri: 75, Sat: 60, Sun: 55 },
    { hour: "3pm", Mon: 55, Tue: 58, Wed: 52, Thu: 60, Fri: 70, Sat: 78, Sun: 72 },
    { hour: "6pm", Mon: 78, Tue: 75, Wed: 80, Thu: 82, Fri: 85, Sat: 88, Sun: 80 },
    { hour: "9pm", Mon: 72, Tue: 78, Wed: 75, Thu: 80, Fri: 88, Sat: 82, Sun: 70 },
  ],
  topPerformingPosts: [
    {
      id: 1,
      thumbnail: "\ud83c\udfe2",
      title: "Vista del Mar - Tour 360\u00b0 con precios",
      engagement: 5.8,
      reach: 245000,
      format: "Reel",
      hook: "Price Reveal",
    },
    {
      id: 2,
      thumbnail: "\ud83c\udf05",
      title: "Amaneceres desde Torre Esmeralda",
      engagement: 5.2,
      reach: 198000,
      format: "Reel",
      hook: "Lifestyle",
    },
    {
      id: 3,
      thumbnail: "\ud83c\udfca",
      title: "Amenidades exclusivas Proyecto Marina",
      engagement: 4.9,
      reach: 175000,
      format: "Carousel",
      hook: "Feature Showcase",
    },
  ],
}

export default function ContentEngineeringPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Reverse-Engineering</h1>
          <p className="text-gray-400 mt-1">
            Discover what makes your content perform
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

      {/* Winning Formula DNA Cards */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(DEMO_DATA.contentDNA).map(([key, item]) => (
          <GlassCard key={key} className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-[#28A963]/20">
                <item.icon className="h-6 w-6 text-[#28A963]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <p className="text-lg font-bold text-white mt-1">{item.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#28A963] rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <span className="text-sm text-emerald-400">{item.score}</span>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Format Performance & Hook Effectiveness */}
      <div className="grid grid-cols-2 gap-6">
        {/* Format Performance */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Video className="h-5 w-5 text-[#28A963]" />
            Format Performance Score
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMO_DATA.formatPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
                <YAxis
                  type="category"
                  dataKey="format"
                  stroke="#9CA3AF"
                  fontSize={12}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#F9FAFB" }}
                  formatter={(value: number, name: string) => [
                    name === "score"
                      ? `${value}/100`
                      : name === "engagement"
                      ? `${value}%`
                      : formatNumber(value),
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                />
                <Bar dataKey="score" fill="#28A963" radius={[0, 4, 4, 0]} name="Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Hook Effectiveness */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#28A963]" />
            Hook Effectiveness Analysis
          </h3>
          <div className="space-y-4">
            {DEMO_DATA.hookEffectiveness.map((hook) => (
              <div key={hook.hook} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">{hook.hook}</span>
                    <span className="text-xs text-gray-500 ml-2">{hook.examples}</span>
                  </div>
                  <span
                    className={`text-lg font-bold ${
                      hook.score >= 80
                        ? "text-emerald-400"
                        : hook.score >= 60
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {hook.score}
                  </span>
                </div>
                <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${hook.score}%`,
                      backgroundColor: hook.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Length Analysis & CTA Effectiveness */}
      <div className="grid grid-cols-2 gap-6">
        {/* Length Analysis */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#28A963]" />
            Optimal Content Length
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DEMO_DATA.lengthAnalysis}>
                <defs>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#28A963" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#28A963" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="length" stroke="#9CA3AF" fontSize={12} />
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
                  dataKey="engagement"
                  stroke="#28A963"
                  fill="url(#colorEngagement)"
                  strokeWidth={2}
                  name="Engagement %"
                />
                <Area
                  type="monotone"
                  dataKey="completion"
                  stroke="#3B82F6"
                  fill="url(#colorCompletion)"
                  strokeWidth={2}
                  name="Completion %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#28A963]" />
              <span className="text-sm text-gray-400">Engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-400">Completion Rate</span>
            </div>
          </div>
        </GlassCard>

        {/* CTA Effectiveness */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#28A963]" />
            CTA Effectiveness
          </h3>
          <div className="space-y-4">
            {DEMO_DATA.ctaEffectiveness.map((cta, index) => (
              <div
                key={cta.cta}
                className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50"
              >
                <span className="text-gray-500 w-6 text-center">{index + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white">{cta.cta}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-emerald-400">
                        {cta.conversion}% conversion
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          cta.score >= 80
                            ? "bg-emerald-500/20 text-emerald-400"
                            : cta.score >= 60
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {cta.score}
                      </span>
                    </div>
                  </div>
                  <Progress value={cta.score} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Top Hashtags */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Hash className="h-5 w-5 text-[#28A963]" />
          Top Performing Hashtags
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {DEMO_DATA.hashtagAnalysis.map((tag) => (
            <div
              key={tag.tag}
              className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-[#28A963]/50 transition-all cursor-pointer"
            >
              <p className="text-[#28A963] font-medium text-sm truncate">{tag.tag}</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Reach</span>
                  <span className="text-white">{formatNumber(tag.reach)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Engagement</span>
                  <span className="text-emerald-400">{tag.engagement}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Top vs Bottom Performers & Best Posting Times */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top vs Bottom Comparison */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-[#28A963]" />
            Top vs Bottom Performers
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Top Performers */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <span className="font-medium text-emerald-400">Top 10%</span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Avg Engagement</span>
                  <span className="text-white font-medium">
                    {DEMO_DATA.topVsBottom.top.avgEngagement}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Avg Reach</span>
                  <span className="text-white font-medium">
                    {formatNumber(DEMO_DATA.topVsBottom.top.avgReach)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-2">Common Traits:</p>
              <div className="flex flex-wrap gap-1">
                {DEMO_DATA.topVsBottom.top.commonTraits.map((trait) => (
                  <span
                    key={trait}
                    className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Performers */}
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-red-400 rotate-180" />
                <span className="font-medium text-red-400">Bottom 10%</span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Avg Engagement</span>
                  <span className="text-white font-medium">
                    {DEMO_DATA.topVsBottom.bottom.avgEngagement}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Avg Reach</span>
                  <span className="text-white font-medium">
                    {formatNumber(DEMO_DATA.topVsBottom.bottom.avgReach)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-2">Common Issues:</p>
              <div className="flex flex-wrap gap-1">
                {DEMO_DATA.topVsBottom.bottom.commonTraits.map((trait) => (
                  <span
                    key={trait}
                    className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Best Posting Times */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#28A963]" />
            Best Posting Times
          </h3>
          <div className="space-y-3">
            {DEMO_DATA.bestPostingTimes.map((day) => (
              <div key={day.day} className="flex items-center gap-4">
                <span className="text-gray-400 w-10">{day.day}</span>
                <div className="flex-1 flex gap-2">
                  {Array.from({ length: 24 }).map((_, hour) => (
                    <div
                      key={hour}
                      className={`flex-1 h-6 rounded ${
                        day.hours.includes(hour)
                          ? "bg-[#28A963]"
                          : hour >= 6 && hour <= 22
                          ? "bg-gray-800"
                          : "bg-gray-900"
                      }`}
                      title={`${hour}:00`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-sm text-gray-400">
              <Sparkles className="h-4 w-4 text-[#28A963] inline mr-1" />
              Peak engagement windows highlighted in green
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Top Performing Posts */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-[#28A963]" />
          Top Performing Posts
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {DEMO_DATA.topPerformingPosts.map((post, index) => (
            <div
              key={post.id}
              className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-[#28A963]/50 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl">
                    {post.thumbnail}
                  </div>
                  <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#28A963] flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm line-clamp-2">
                    {post.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs">
                      {post.format}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                      {post.hook}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-gray-700">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Engagement</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {post.engagement}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Reach</p>
                  <p className="text-lg font-bold text-white">
                    {formatNumber(post.reach)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
