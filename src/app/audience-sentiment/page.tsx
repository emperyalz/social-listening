"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Progress } from "@/components/ui/progress"
import { formatNumber } from "@/lib/utils"
import {
  Heart,
  Smile,
  Meh,
  Frown,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  AlertTriangle,
  Users,
  ThumbsUp,
  ThumbsDown,
  Instagram,
  Youtube,
  Star,
  Clock,
  ExternalLink,
  Sparkles,
  BarChart,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

// Demo Data - Audience Sentiment for Grupo Horizonte
const DEMO_DATA = {
  sentimentScore: 68,
  moodBreakdown: [
    { name: "Positive", value: 62, color: "#28A963" },
    { name: "Neutral", value: 28, color: "#6B7280" },
    { name: "Negative", value: 10, color: "#EF4444" },
  ],
  sentimentByTopic: [
    { topic: "Design & Views", positive: 92, neutral: 6, negative: 2 },
    { topic: "Location", positive: 78, neutral: 15, negative: 7 },
    { topic: "Amenities", positive: 72, neutral: 20, negative: 8 },
    { topic: "Customer Service", positive: 55, neutral: 25, negative: 20 },
    { topic: "Pricing", positive: 35, neutral: 40, negative: 25 },
    { topic: "Delivery Time", positive: 28, neutral: 32, negative: 40 },
  ],
  topSentimentWords: {
    positive: [
      { word: "Hermoso", count: 456, growth: 12 },
      { word: "Incre\u00edble", count: 389, growth: 8 },
      { word: "Excelente", count: 312, growth: 15 },
      { word: "Perfecto", count: 287, growth: 5 },
      { word: "Espectacular", count: 234, growth: 22 },
    ],
    negative: [
      { word: "Caro", count: 145, growth: -8 },
      { word: "Demora", count: 123, growth: 18 },
      { word: "Problema", count: 89, growth: 5 },
      { word: "Dif\u00edcil", count: 67, growth: -3 },
      { word: "Decepci\u00f3n", count: 45, growth: 12 },
    ],
  },
  platformSentiment: [
    { platform: "Instagram", positive: 65, neutral: 25, negative: 10, total: 12500 },
    { platform: "TikTok", positive: 72, neutral: 20, negative: 8, total: 8900 },
    { platform: "YouTube", positive: 58, neutral: 32, negative: 10, total: 4200 },
  ],
  sentimentTrends: [
    { month: "Aug", positive: 58, neutral: 30, negative: 12, score: 62 },
    { month: "Sep", positive: 60, neutral: 28, negative: 12, score: 64 },
    { month: "Oct", positive: 61, neutral: 28, negative: 11, score: 65 },
    { month: "Nov", positive: 63, neutral: 27, negative: 10, score: 67 },
    { month: "Dec", positive: 61, neutral: 29, negative: 10, score: 66 },
    { month: "Jan", positive: 62, neutral: 28, negative: 10, score: 68 },
  ],
  topCommenters: [
    {
      username: "@inversor_bogota",
      platform: "instagram",
      comments: 45,
      sentiment: "positive",
      influence: "high",
    },
    {
      username: "@maria_realestate",
      platform: "tiktok",
      comments: 38,
      sentiment: "positive",
      influence: "medium",
    },
    {
      username: "@carlos_critico",
      platform: "instagram",
      comments: 32,
      sentiment: "negative",
      influence: "high",
    },
    {
      username: "@familia_feliz",
      platform: "youtube",
      comments: 28,
      sentiment: "positive",
      influence: "medium",
    },
  ],
  attentionRequired: [
    {
      id: 1,
      type: "complaint",
      content: "Llevo 3 semanas esperando respuesta sobre mi reserva",
      username: "@cliente_frustrado",
      platform: "instagram",
      sentiment: -0.85,
      urgency: "high",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      type: "question",
      content: "\u00bfCu\u00e1ndo estar\u00e1 lista la torre 2? Ya pas\u00f3 la fecha prometida",
      username: "@esperando_entrega",
      platform: "tiktok",
      sentiment: -0.6,
      urgency: "medium",
      timestamp: "5 hours ago",
    },
    {
      id: 3,
      type: "negative_review",
      content: "Los precios subieron 20% desde que consult\u00e9. Muy decepcionante",
      username: "@comprador_sorprendido",
      platform: "instagram",
      sentiment: -0.72,
      urgency: "medium",
      timestamp: "1 day ago",
    },
  ],
  engagementBreakdown: [
    { type: "Likes", count: 45200, sentiment: 0.8 },
    { type: "Comments", count: 8900, sentiment: 0.65 },
    { type: "Shares", count: 3400, sentiment: 0.75 },
    { type: "Saves", count: 12800, sentiment: 0.85 },
  ],
}

const getSentimentIcon = (sentiment: string, size: string = "h-5 w-5") => {
  switch (sentiment) {
    case "positive":
      return <Smile className={`${size} text-emerald-400`} />
    case "neutral":
      return <Meh className={`${size} text-gray-400`} />
    case "negative":
      return <Frown className={`${size} text-red-400`} />
    default:
      return null
  }
}

export default function AudienceSentimentPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Audience & Sentiment Deep Dive</h1>
          <p className="text-gray-400 mt-1">
            Understanding how your audience feels about your brand
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

      {/* Sentiment Score Hero & Mood Distribution */}
      <div className="grid grid-cols-3 gap-6">
        {/* Sentiment Score */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-[#28A963]" />
            Overall Sentiment Score
          </h3>
          <div className="flex flex-col items-center">
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
                  stroke={
                    DEMO_DATA.sentimentScore >= 70
                      ? "#28A963"
                      : DEMO_DATA.sentimentScore >= 50
                      ? "#F59E0B"
                      : "#EF4444"
                  }
                  strokeWidth="12"
                  strokeDasharray={`${(DEMO_DATA.sentimentScore / 100) * 440} 440`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {DEMO_DATA.sentimentScore}
                </span>
                <span className="text-sm text-gray-400">out of 100</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">+3 points this month</span>
            </div>
          </div>
        </GlassCard>

        {/* Mood Breakdown Pie */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#28A963]" />
            Mood Distribution
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DEMO_DATA.moodBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {DEMO_DATA.moodBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {DEMO_DATA.moodBreakdown.map((mood) => (
                <div key={mood.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: mood.color }}
                  />
                  <span className="text-gray-400 text-sm flex-1">{mood.name}</span>
                  <span className="text-white font-medium">{mood.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Engagement Breakdown */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#28A963]" />
            Engagement Breakdown
          </h3>
          <div className="space-y-3">
            {DEMO_DATA.engagementBreakdown.map((item) => (
              <div key={item.type} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-sm">{item.type}</span>
                    <span className="text-white font-medium">
                      {formatNumber(item.count)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.sentiment * 100}%`,
                        backgroundColor:
                          item.sentiment >= 0.7
                            ? "#28A963"
                            : item.sentiment >= 0.5
                            ? "#F59E0B"
                            : "#EF4444",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Sentiment by Topic */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart className="h-5 w-5 text-[#28A963]" />
          Sentiment Distribution by Topic
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={DEMO_DATA.sentimentByTopic} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
              <YAxis
                type="category"
                dataKey="topic"
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
              />
              <Bar dataKey="positive" stackId="a" fill="#28A963" name="Positive" />
              <Bar dataKey="neutral" stackId="a" fill="#6B7280" name="Neutral" />
              <Bar dataKey="negative" stackId="a" fill="#EF4444" name="Negative" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#28A963]" />
            <span className="text-sm text-gray-400">Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span className="text-sm text-gray-400">Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-400">Negative</span>
          </div>
        </div>
      </GlassCard>

      {/* Top Sentiment Words */}
      <div className="grid grid-cols-2 gap-6">
        {/* Positive Words */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-emerald-400" />
            Top Positive Words
          </h3>
          <div className="space-y-3">
            {DEMO_DATA.topSentimentWords.positive.map((word, index) => (
              <div
                key={word.word}
                className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
              >
                <span className="text-emerald-400 font-bold w-6">{index + 1}</span>
                <span className="text-white flex-1">{word.word}</span>
                <span className="text-gray-400 text-sm">{word.count} mentions</span>
                <span className="text-emerald-400 text-sm flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {word.growth}%
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Negative Words */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ThumbsDown className="h-5 w-5 text-red-400" />
            Top Negative Words
          </h3>
          <div className="space-y-3">
            {DEMO_DATA.topSentimentWords.negative.map((word, index) => (
              <div
                key={word.word}
                className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <span className="text-red-400 font-bold w-6">{index + 1}</span>
                <span className="text-white flex-1">{word.word}</span>
                <span className="text-gray-400 text-sm">{word.count} mentions</span>
                <span
                  className={`text-sm flex items-center gap-1 ${
                    word.growth > 0 ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {word.growth > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(word.growth)}%
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Platform Sentiment & Trends */}
      <div className="grid grid-cols-2 gap-6">
        {/* Platform Sentiment */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#28A963]" />
            Sentiment by Platform
          </h3>
          <div className="space-y-4">
            {DEMO_DATA.platformSentiment.map((platform) => (
              <div key={platform.platform} className="p-4 rounded-xl bg-gray-800/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {platform.platform === "Instagram" && (
                      <Instagram className="h-5 w-5 text-pink-500" />
                    )}
                    {platform.platform === "TikTok" && (
                      <TikTokIcon className="h-5 w-5 text-white" />
                    )}
                    {platform.platform === "YouTube" && (
                      <Youtube className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-white font-medium">{platform.platform}</span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {formatNumber(platform.total)} comments
                  </span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${platform.positive}%` }}
                  />
                  <div
                    className="h-full bg-gray-500"
                    style={{ width: `${platform.neutral}%` }}
                  />
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${platform.negative}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-emerald-400">{platform.positive}% positive</span>
                  <span className="text-gray-400">{platform.neutral}% neutral</span>
                  <span className="text-red-400">{platform.negative}% negative</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Sentiment Trends */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#28A963]" />
            Sentiment Trends
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DEMO_DATA.sentimentTrends}>
                <defs>
                  <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#28A963" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#28A963" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6B7280" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6B7280" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
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
                  dataKey="positive"
                  stroke="#28A963"
                  fill="url(#colorPositive)"
                  strokeWidth={2}
                  name="Positive %"
                />
                <Area
                  type="monotone"
                  dataKey="negative"
                  stroke="#EF4444"
                  fill="url(#colorNegative)"
                  strokeWidth={2}
                  name="Negative %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Top Commenters & Attention Required */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top Commenters */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-[#28A963]" />
            Most Active Commenters
          </h3>
          <div className="space-y-3">
            {DEMO_DATA.topCommenters.map((commenter, index) => (
              <div
                key={commenter.username}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50"
              >
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      commenter.sentiment === "positive"
                        ? "bg-emerald-500"
                        : commenter.sentiment === "negative"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {commenter.username.charAt(1).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    {commenter.platform === "instagram" && (
                      <Instagram className="h-4 w-4 text-pink-500 bg-gray-900 rounded-full p-0.5" />
                    )}
                    {commenter.platform === "tiktok" && (
                      <div className="bg-gray-900 rounded-full p-0.5">
                        <TikTokIcon className="h-3 w-3 text-white" />
                      </div>
                    )}
                    {commenter.platform === "youtube" && (
                      <Youtube className="h-4 w-4 text-red-500 bg-gray-900 rounded-full p-0.5" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{commenter.username}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        commenter.influence === "high"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {commenter.influence} influence
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {commenter.comments} comments
                  </span>
                </div>
                {getSentimentIcon(commenter.sentiment)}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Attention Required */}
        <GlassCard className="p-6" variant="warning">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Attention Required
            <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
              {DEMO_DATA.attentionRequired.length} items
            </span>
          </h3>
          <div className="space-y-3">
            {DEMO_DATA.attentionRequired.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border ${
                  item.urgency === "high"
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-amber-500/10 border-amber-500/30"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">
                      {item.username}
                    </span>
                    {item.platform === "instagram" && (
                      <Instagram className="h-4 w-4 text-pink-500" />
                    )}
                    {item.platform === "tiktok" && (
                      <TikTokIcon className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        item.urgency === "high"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {item.urgency}
                    </span>
                    <span className="text-xs text-gray-500">{item.timestamp}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-300">{item.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-red-400">
                    Sentiment: {(item.sentiment * 100).toFixed(0)}
                  </span>
                  <button className="text-xs text-[#28A963] hover:text-emerald-300 flex items-center gap-1">
                    Respond <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
