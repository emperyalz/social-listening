"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Progress } from "@/components/ui/progress"
import {
  Mic2,
  Volume2,
  Settings,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Target,
  Users,
  MessageSquare,
  Instagram,
  Youtube,
  Sparkles,
  BarChart3,
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

// Demo Data - Brand Voice Alignment for Grupo Horizonte
const DEMO_DATA = {
  voiceConsistency: 82,
  toneRadar: [
    { tone: "Professional", target: 85, actual: 82 },
    { tone: "Aspirational", target: 90, actual: 88 },
    { tone: "Trustworthy", target: 95, actual: 78 },
    { tone: "Innovative", target: 70, actual: 75 },
    { tone: "Warm", target: 75, actual: 85 },
    { tone: "Exclusive", target: 80, actual: 72 },
  ],
  toneBreakdown: [
    { tone: "Professional", score: 82, trend: 3, status: "aligned" },
    { tone: "Aspirational", score: 88, trend: 5, status: "aligned" },
    { tone: "Trustworthy", score: 78, trend: -2, status: "needs_attention" },
    { tone: "Innovative", score: 75, trend: 8, status: "exceeding" },
    { tone: "Warm", score: 85, trend: 4, status: "exceeding" },
    { tone: "Exclusive", score: 72, trend: -5, status: "needs_attention" },
  ],
  formalityGauge: {
    target: 70, // 0 = casual, 100 = very formal
    actual: 65,
  },
  personalityMix: [
    { trait: "Sophisticated", value: 35, color: "#28A963" },
    { trait: "Friendly", value: 28, color: "#3B82F6" },
    { trait: "Authoritative", value: 22, color: "#8B5CF6" },
    { trait: "Playful", value: 15, color: "#F59E0B" },
  ],
  voiceTrends: [
    { month: "Aug", consistency: 74, alignment: 68 },
    { month: "Sep", consistency: 76, alignment: 71 },
    { month: "Oct", consistency: 78, alignment: 74 },
    { month: "Nov", consistency: 79, alignment: 76 },
    { month: "Dec", consistency: 80, alignment: 78 },
    { month: "Jan", consistency: 82, alignment: 80 },
  ],
  platformVoice: [
    {
      platform: "Instagram",
      consistency: 85,
      tone: "Aspirational & Visual",
      issues: 2,
      icon: Instagram,
    },
    {
      platform: "TikTok",
      consistency: 78,
      tone: "Casual & Engaging",
      issues: 5,
      icon: TikTokIcon,
    },
    {
      platform: "YouTube",
      consistency: 88,
      tone: "Professional & Detailed",
      issues: 1,
      icon: Youtube,
    },
  ],
  voiceRecommendations: [
    {
      id: 1,
      type: "improvement",
      title: "Increase Trust Signals",
      description:
        "Add more customer testimonials and certification mentions to boost trustworthy tone",
      impact: "Could improve trust score by 8-12%",
      priority: "high",
    },
    {
      id: 2,
      type: "warning",
      title: "TikTok Voice Drift",
      description:
        "Content becoming too casual, drifting from brand's premium positioning",
      impact: "Brand perception inconsistency",
      priority: "medium",
    },
    {
      id: 3,
      type: "opportunity",
      title: "Leverage Warm Tone Success",
      description:
        "Family-friendly content performing well - expand this voice element across platforms",
      impact: "Potential 15% engagement increase",
      priority: "medium",
    },
  ],
  targetVoiceConfig: {
    primary: "Professional & Aspirational",
    secondary: "Trustworthy & Warm",
    avoid: "Overly casual, Aggressive sales, Jargon-heavy",
  },
  emojiUsage: {
    recommended: 2,
    actual: 3.5,
    topUsed: ["\ud83c\udfe2", "\u2728", "\ud83c\udf05", "\ud83c\udfe0", "\ud83d\udc8e"],
  },
  voiceExamples: {
    onBrand: [
      "Descubre tu nuevo hogar con vistas privilegiadas al mar",
      "Inversi\u00f3n inteligente en ubicaciones premium de Colombia",
    ],
    offBrand: [
      "OFERTAS INCRE\u00cdBLES!!! No te lo pierdas!!!",
      "Dale like y comenta para ganar",
    ],
  },
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "aligned":
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
    case "exceeding":
      return <TrendingUp className="h-4 w-4 text-blue-400" />
    case "needs_attention":
      return <AlertTriangle className="h-4 w-4 text-amber-400" />
    default:
      return null
  }
}

export default function BrandVoicePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Brand Voice Alignment</h1>
          <p className="text-gray-400 mt-1">
            Ensure your content speaks with a consistent brand voice
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

      {/* Voice Consistency Hero & Tone Radar */}
      <div className="grid grid-cols-2 gap-6">
        {/* Voice Consistency Score */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Mic2 className="h-5 w-5 text-[#28A963]" />
            Voice Consistency Score
          </h3>
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
                  strokeDasharray={`${(DEMO_DATA.voiceConsistency / 100) * 440} 440`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {DEMO_DATA.voiceConsistency}%
                </span>
                <span className="text-sm text-gray-400">Consistent</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-400 font-medium">Target Voice</p>
                <p className="text-white">{DEMO_DATA.targetVoiceConfig.primary}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-400 font-medium">Secondary</p>
                <p className="text-white">{DEMO_DATA.targetVoiceConfig.secondary}</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <TrendingUp className="h-4 w-4" />
                +6% improvement this quarter
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Tone Radar Chart */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-[#28A963]" />
            Tone Analysis (Target vs Actual)
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={DEMO_DATA.toneRadar}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis
                  dataKey="tone"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Radar
                  name="Actual"
                  dataKey="actual"
                  stroke="#28A963"
                  fill="#28A963"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-400">Target</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#28A963]" />
              <span className="text-sm text-gray-400">Actual</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Tone Breakdown */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-[#28A963]" />
          Tone Score Breakdown
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {DEMO_DATA.toneBreakdown.map((tone) => (
            <div
              key={tone.tone}
              className={`p-4 rounded-xl border ${
                tone.status === "aligned"
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : tone.status === "exceeding"
                  ? "border-blue-500/30 bg-blue-500/5"
                  : "border-amber-500/30 bg-amber-500/5"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(tone.status)}
                  <span className="font-medium text-white">{tone.tone}</span>
                </div>
                <span
                  className={`text-lg font-bold ${
                    tone.score >= 80
                      ? "text-emerald-400"
                      : tone.score >= 70
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {tone.score}
                </span>
              </div>
              <Progress value={tone.score} className="h-2" />
              <div className="flex items-center justify-between mt-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    tone.status === "aligned"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : tone.status === "exceeding"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {tone.status === "aligned"
                    ? "On Target"
                    : tone.status === "exceeding"
                    ? "Exceeding"
                    : "Needs Work"}
                </span>
                <span
                  className={`text-xs flex items-center gap-1 ${
                    tone.trend >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {tone.trend >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(tone.trend)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Formality & Personality Mix */}
      <div className="grid grid-cols-2 gap-6">
        {/* Formality Gauge */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#28A963]" />
            Formality Level
          </h3>
          <div className="relative pt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Casual</span>
              <span>Balanced</span>
              <span>Formal</span>
            </div>
            <div className="h-4 bg-gradient-to-r from-amber-500 via-emerald-500 to-blue-500 rounded-full relative">
              {/* Target marker */}
              <div
                className="absolute -top-1 w-1 h-6 bg-white rounded-full shadow-lg"
                style={{ left: `${DEMO_DATA.formalityGauge.target}%` }}
              />
              {/* Actual marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-gray-900 shadow-lg"
                style={{ left: `calc(${DEMO_DATA.formalityGauge.actual}% - 8px)` }}
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-center">
                <p className="text-sm text-gray-400">Target</p>
                <p className="text-lg font-bold text-blue-400">
                  {DEMO_DATA.formalityGauge.target}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Actual</p>
                <p className="text-lg font-bold text-emerald-400">
                  {DEMO_DATA.formalityGauge.actual}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Gap</p>
                <p className="text-lg font-bold text-amber-400">
                  {Math.abs(
                    DEMO_DATA.formalityGauge.target - DEMO_DATA.formalityGauge.actual
                  )}
                  %
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Personality Mix */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#28A963]" />
            Brand Personality Mix
          </h3>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DEMO_DATA.personalityMix}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {DEMO_DATA.personalityMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {DEMO_DATA.personalityMix.map((item) => (
                <div key={item.trait} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-400 flex-1">{item.trait}</span>
                  <span className="text-white font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Platform Voice Comparison */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-[#28A963]" />
          Voice Consistency by Platform
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {DEMO_DATA.platformVoice.map((platform) => (
            <div
              key={platform.platform}
              className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50"
            >
              <div className="flex items-center gap-3 mb-3">
                {platform.platform === "Instagram" && (
                  <Instagram className="h-6 w-6 text-pink-500" />
                )}
                {platform.platform === "TikTok" && (
                  <TikTokIcon className="h-6 w-6 text-white" />
                )}
                {platform.platform === "YouTube" && (
                  <Youtube className="h-6 w-6 text-red-500" />
                )}
                <span className="text-white font-medium">{platform.platform}</span>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Consistency</span>
                  <span
                    className={`font-bold ${
                      platform.consistency >= 85
                        ? "text-emerald-400"
                        : platform.consistency >= 75
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {platform.consistency}%
                  </span>
                </div>
                <Progress value={platform.consistency} className="h-2" />
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Voice:</span>
                <span className="text-white ml-2">{platform.tone}</span>
              </div>
              {platform.issues > 0 && (
                <div className="mt-2 flex items-center gap-1 text-amber-400 text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  {platform.issues} voice inconsistencies detected
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Voice Trends */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#28A963]" />
          Voice Consistency Trends
        </h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DEMO_DATA.voiceTrends}>
              <defs>
                <linearGradient id="colorConsistency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#28A963" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#28A963" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAlignment" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} domain={[60, 100]} />
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
                dataKey="consistency"
                stroke="#28A963"
                fill="url(#colorConsistency)"
                strokeWidth={2}
                name="Consistency %"
              />
              <Area
                type="monotone"
                dataKey="alignment"
                stroke="#3B82F6"
                fill="url(#colorAlignment)"
                strokeWidth={2}
                name="Brand Alignment %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#28A963]" />
            <span className="text-sm text-gray-400">Consistency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-400">Brand Alignment</span>
          </div>
        </div>
      </GlassCard>

      {/* Voice Recommendations & Examples */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recommendations */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-[#28A963]" />
            Voice Recommendations
          </h3>
          <div className="space-y-3">
            {DEMO_DATA.voiceRecommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-4 rounded-xl border ${
                  rec.type === "improvement"
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : rec.type === "warning"
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-blue-500/30 bg-blue-500/5"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {rec.type === "improvement" && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    )}
                    {rec.type === "warning" && (
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                    )}
                    {rec.type === "opportunity" && (
                      <Sparkles className="h-4 w-4 text-blue-400" />
                    )}
                    <span className="font-medium text-white">{rec.title}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      rec.priority === "high"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{rec.description}</p>
                <p className="text-xs text-emerald-400 mt-2">{rec.impact}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Voice Examples */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#28A963]" />
            Voice Examples
          </h3>
          <div className="space-y-4">
            {/* On-Brand Examples */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">On-Brand</span>
              </div>
              <div className="space-y-2">
                {DEMO_DATA.voiceExamples.onBrand.map((example, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <p className="text-sm text-white">"{example}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Off-Brand Examples */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-red-400">Avoid</span>
              </div>
              <div className="space-y-2">
                {DEMO_DATA.voiceExamples.offBrand.map((example, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <p className="text-sm text-white line-through opacity-60">
                      "{example}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Emoji Usage */}
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Emoji Usage</span>
                <span
                  className={`text-sm ${
                    Math.abs(
                      DEMO_DATA.emojiUsage.actual - DEMO_DATA.emojiUsage.recommended
                    ) <= 1
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                >
                  {DEMO_DATA.emojiUsage.actual} per post (target:{" "}
                  {DEMO_DATA.emojiUsage.recommended})
                </span>
              </div>
              <div className="flex items-center gap-2 text-2xl">
                {DEMO_DATA.emojiUsage.topUsed.map((emoji, index) => (
                  <span key={index}>{emoji}</span>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Target Voice Config */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-[#28A963]" />
          Target Voice Configuration
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-sm text-emerald-400 font-medium mb-2">Primary Voice</p>
            <p className="text-white font-medium">
              {DEMO_DATA.targetVoiceConfig.primary}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <p className="text-sm text-blue-400 font-medium mb-2">Secondary Voice</p>
            <p className="text-white font-medium">
              {DEMO_DATA.targetVoiceConfig.secondary}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-400 font-medium mb-2">Avoid</p>
            <p className="text-white font-medium">{DEMO_DATA.targetVoiceConfig.avoid}</p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
