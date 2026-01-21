"use client";

import { Suspense, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useTheme } from "@/context/ThemeContext";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ============================================
// CONSTANTS & UTILITIES
// ============================================

const TONE_COLORS: Record<string, string> = {
  Professional: "#6366f1",
  Friendly: "#f59e0b",
  Luxurious: "#8b5cf6",
  Playful: "#ec4899",
  Authoritative: "#10b981",
  Empathetic: "#06b6d4",
};

const PERSONALITY_COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ec4899", "#06b6d4"];

// ============================================
// GLASSMORPHISM CARD COMPONENT
// ============================================

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}

function GlassCard({ children, className = "", gradient }: GlassCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const defaultGradient = isDark
    ? "radial-gradient(ellipse at top left, rgba(139, 92, 246, 0.1) 0%, transparent 50%)"
    : "radial-gradient(ellipse at top left, rgba(139, 92, 246, 0.08) 0%, transparent 50%)";

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
          background: gradient || defaultGradient,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ============================================
// VOICE CONSISTENCY HERO
// ============================================

interface VoiceConsistencyHeroProps {
  overallConsistency: number;
  toneConsistency: number;
  formalityConsistency: number;
  dominantTone: string;
  formalityLevel: string;
}

function VoiceConsistencyHero({
  overallConsistency,
  toneConsistency,
  formalityConsistency,
  dominantTone,
  formalityLevel,
}: VoiceConsistencyHeroProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "rgba(16, 185, 129, 0.15)";
    if (score >= 60) return "rgba(245, 158, 11, 0.15)";
    return "rgba(239, 68, 68, 0.15)";
  };

  return (
    <GlassCard
      className="p-8"
      gradient={`radial-gradient(ellipse at top left, ${getScoreGradient(overallConsistency)} 0%, transparent 50%)`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">🎤</span>
            <span className="text-violet-400 text-sm font-semibold uppercase tracking-wider">
              Brand Voice Consistency
            </span>
          </div>
          <div className={`text-6xl font-bold ${getScoreColor(overallConsistency)} mb-2`}>
            {overallConsistency}%
          </div>
          <p className="text-muted-foreground text-sm mb-6">
            How consistently your content reflects your brand voice
          </p>

          <div className="grid grid-cols-4 gap-6">
            <div>
              <span className="text-muted-foreground block text-sm">Tone Match</span>
              <span className={`font-bold text-xl ${getScoreColor(toneConsistency)}`}>
                {toneConsistency}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-sm">Formality Match</span>
              <span className={`font-bold text-xl ${getScoreColor(formalityConsistency)}`}>
                {formalityConsistency}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-sm">Dominant Tone</span>
              <span className="font-bold text-xl text-violet-400">{dominantTone}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-sm">Formality</span>
              <span className="font-bold text-xl text-cyan-400">{formalityLevel}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-border flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke={overallConsistency >= 80 ? '#10b981' : overallConsistency >= 60 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(overallConsistency / 100) * 352} 352`}
                className="transition-all duration-1000"
              />
            </svg>
            <span className="text-4xl">🎯</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// TONE RADAR CHART
// ============================================

interface ToneScore {
  trait: string;
  score: number;
  emoji: string;
}

function ToneRadarChart({ brandScores, audienceScores }: { brandScores: ToneScore[]; audienceScores: ToneScore[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const radarData = brandScores.map((brand) => {
    const audience = audienceScores.find((a) => a.trait === brand.trait);
    return {
      trait: brand.trait,
      brand: brand.score,
      audience: audience?.score || 0,
    };
  });

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="text-violet-400">📊</span>
        TONE ANALYSIS
      </h3>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke={isDark ? "#334155" : "#e2e8f0"} />
            <PolarAngleAxis dataKey="trait" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} />
            <PolarRadiusAxis stroke={isDark ? "#334155" : "#e2e8f0"} fontSize={10} />
            <Radar
              name="Your Content"
              dataKey="brand"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Audience Response"
              dataKey="audience"
              stroke="#06b6d4"
              fill="#06b6d4"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Legend />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
                border: isDark ? "1px solid rgba(71, 85, 105, 0.5)" : "1px solid rgba(226, 232, 240, 0.8)",
                borderRadius: "12px",
                color: isDark ? "#fff" : "#1e293b",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

// ============================================
// TONE BREAKDOWN BARS
// ============================================

function ToneBreakdown({ scores }: { scores: ToneScore[] }) {
  const maxScore = Math.max(...scores.map((s) => s.score), 1);

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="text-amber-400">🎨</span>
        TONE BREAKDOWN
      </h3>

      <div className="space-y-4">
        {scores.slice(0, 6).map((tone) => (
          <div key={tone.trait}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span>{tone.emoji}</span>
                <span className="text-foreground font-medium">{tone.trait}</span>
              </div>
              <span className="text-muted-foreground text-sm">{tone.score} signals</span>
            </div>
            <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max((tone.score / maxScore) * 100, 5)}%`,
                  backgroundColor: TONE_COLORS[tone.trait] || "#6366f1",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ============================================
// FORMALITY GAUGE
// ============================================

function FormalityGauge({ score, level, targetScore }: { score: number; level: string; targetScore: number }) {
  const gaugePositions = [
    { label: "Very Casual", position: 10 },
    { label: "Casual", position: 30 },
    { label: "Neutral", position: 50 },
    { label: "Formal", position: 70 },
    { label: "Very Formal", position: 90 },
  ];

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="text-cyan-400">📏</span>
        FORMALITY LEVEL
      </h3>

      <div className="relative h-8 bg-gradient-to-r from-pink-500 via-yellow-500 via-slate-500 via-blue-500 to-indigo-500 rounded-full mb-4">
        <div
          className="absolute top-0 h-full w-1 bg-white/50"
          style={{ left: `${targetScore}%` }}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
            Target
          </div>
        </div>

        <div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-4 border-background shadow-lg transition-all duration-500"
          style={{ left: `calc(${score}% - 12px)` }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground mb-6">
        {gaugePositions.map((pos) => (
          <span key={pos.label} className={level === pos.label ? "text-foreground font-medium" : ""}>
            {pos.label}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
        <div>
          <span className="text-muted-foreground text-sm block">Current Level</span>
          <span className="text-foreground font-bold text-xl">{level}</span>
        </div>
        <div className="text-right">
          <span className="text-muted-foreground text-sm block">Score</span>
          <span className="text-cyan-400 font-bold text-xl">{score}/100</span>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// PERSONALITY MIX
// ============================================

interface PersonalityScore {
  trait: string;
  score: number;
  emoji: string;
}

function PersonalityMix({ scores }: { scores: PersonalityScore[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const pieData = scores
    .filter((s) => s.score > 0)
    .map((s) => ({
      name: s.trait,
      value: s.score,
      percentage: totalScore > 0 ? Math.round((s.score / totalScore) * 100) : 0,
    }));

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="text-pink-400">🎭</span>
        PERSONALITY MIX
      </h3>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PERSONALITY_COLORS[index % PERSONALITY_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
                border: isDark ? "1px solid rgba(71, 85, 105, 0.5)" : "1px solid rgba(226, 232, 240, 0.8)",
                borderRadius: "12px",
                color: isDark ? "#fff" : "#1e293b",
              }}
              formatter={(value: number, name: string) => [`${value} signals`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        {scores.slice(0, 5).map((scoreItem, i) => (
          <div key={scoreItem.trait} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: PERSONALITY_COLORS[i % PERSONALITY_COLORS.length] }}
            />
            <span className="text-muted-foreground truncate">{scoreItem.trait}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ============================================
// VOICE ALIGNMENT COMPARISON
// ============================================

interface VoiceAlignmentItem {
  trait: string;
  emoji: string;
  brandScore: number;
  audienceScore: number;
  alignment: string;
}

function VoiceAlignmentComparison({ data }: { data: VoiceAlignmentItem[] }) {
  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="text-emerald-500">🔄</span>
        BRAND-AUDIENCE VOICE ALIGNMENT
      </h3>

      <div className="space-y-3">
        {data.map((item) => (
          <div
            key={item.trait}
            className={`p-3 rounded-xl border ${
              item.alignment === "aligned"
                ? "border-emerald-500/30 bg-emerald-500/10"
                : item.alignment === "brand-only"
                ? "border-amber-500/30 bg-amber-500/10"
                : item.alignment === "audience-only"
                ? "border-cyan-500/30 bg-cyan-500/10"
                : "border-border bg-muted/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{item.emoji}</span>
                <span className="text-foreground font-medium">{item.trait}</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  item.alignment === "aligned"
                    ? "bg-emerald-500/20 text-emerald-500"
                    : item.alignment === "brand-only"
                    ? "bg-amber-500/20 text-amber-500"
                    : item.alignment === "audience-only"
                    ? "bg-cyan-500/20 text-cyan-500"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {item.alignment === "aligned" ? "✓ Aligned" :
                 item.alignment === "brand-only" ? "Brand Only" :
                 item.alignment === "audience-only" ? "Audience Only" : "None"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
              <div>
                <span className="text-muted-foreground">You: </span>
                <span className="text-violet-400">{item.brandScore}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Audience: </span>
                <span className="text-cyan-400">{item.audienceScore}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ============================================
// PLATFORM VOICE COMPARISON
// ============================================

interface PlatformVoice {
  platform: string;
  dominantTone: string;
  formalityLevel: string;
  avgSentenceLength: number;
}

function PlatformVoiceComparison({ data }: { data: PlatformVoice[] }) {
  const platformEmoji: Record<string, string> = {
    instagram: "📸",
    tiktok: "🎵",
    youtube: "📺",
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="text-indigo-400">📱</span>
        VOICE BY PLATFORM
      </h3>

      {data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No platform data available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((platform) => (
            <div
              key={platform.platform}
              className="p-4 bg-muted/30 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{platformEmoji[platform.platform] || "📱"}</span>
                <span className="text-foreground font-medium capitalize">{platform.platform}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">Dominant Tone</span>
                  <span className="text-violet-400 font-medium">{platform.dominantTone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Formality</span>
                  <span className="text-cyan-400 font-medium">{platform.formalityLevel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Avg Words/Sentence</span>
                  <span className="text-emerald-500 font-medium">{platform.avgSentenceLength}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

// ============================================
// RECOMMENDATIONS
// ============================================

interface Recommendation {
  type: string;
  message: string;
  priority: "high" | "medium" | "low";
}

function VoiceRecommendations({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="text-amber-400">💡</span>
        VOICE RECOMMENDATIONS
      </h3>

      {recommendations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <span className="text-4xl mb-2 block">✅</span>
          <p>Great job! Your brand voice is consistent.</p>
          <p className="text-sm mt-1">Keep up the excellent work!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border ${
                rec.priority === "high"
                  ? "border-red-500/30 bg-red-500/10"
                  : rec.priority === "medium"
                  ? "border-amber-500/30 bg-amber-500/10"
                  : "border-border bg-muted/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">
                  {rec.priority === "high" ? "🔴" : rec.priority === "medium" ? "🟡" : "🟢"}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-foreground font-medium">{rec.type}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{rec.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

// ============================================
// TARGET VOICE CONFIG
// ============================================

interface TargetVoice {
  primaryTone: string;
  secondaryTone: string;
  formalityTarget: number;
  personalityFocus: string[];
}

function TargetVoiceConfig({ config }: { config: TargetVoice }) {
  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="text-indigo-400">⚙️</span>
        TARGET VOICE PROFILE
      </h3>

      <div className="space-y-4">
        <div>
          <span className="text-muted-foreground text-sm block mb-2">Primary Tone</span>
          <span className="px-4 py-2 bg-violet-500/20 text-violet-400 rounded-full text-sm font-medium">
            {config.primaryTone}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground text-sm block mb-2">Secondary Tone</span>
          <span className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium">
            {config.secondaryTone}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground text-sm block mb-2">Formality Target</span>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full"
                style={{ width: `${config.formalityTarget}%` }}
              />
            </div>
            <span className="text-foreground font-medium">{config.formalityTarget}%</span>
          </div>
        </div>

        <div>
          <span className="text-muted-foreground text-sm block mb-2">Personality Focus</span>
          <div className="flex flex-wrap gap-2">
            {config.personalityFocus.map((trait) => (
              <span
                key={trait}
                className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// EMOJI USAGE
// ============================================

interface EmojiUsage {
  category: string;
  count: number;
  emojis: string[];
}

function EmojiUsageCard({ data }: { data: EmojiUsage[] }) {
  const filteredData = data.filter((d) => d.count > 0);

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span>😀</span>
        EMOJI USAGE
      </h3>

      {filteredData.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No emoji usage detected</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredData.map((category) => (
            <div
              key={category.category}
              className="p-3 bg-muted/30 rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-foreground font-medium capitalize">{category.category}</span>
                <span className="text-muted-foreground text-sm">{category.count} uses</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {category.emojis.map((emoji, i) => (
                  <span key={i} className="text-xl">{emoji}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

function BrandVoiceContent() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [days, setDays] = useState(30);

  const voiceData = useQuery(api.brandVoice.getBrandVoiceAnalysis, { days });
  const trendsData = useQuery(api.brandVoice.getVoiceTrends, { days });

  if (!voiceData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing Brand Voice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
          <span className="text-violet-400 text-sm font-medium">Voice Analysis Active</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Brand Voice Alignment
            </h1>
            <p className="text-muted-foreground mt-1">Tone, Style & Voice Consistency Analysis</p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-muted-foreground text-sm">Period:</label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm text-foreground"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <VoiceConsistencyHero
          overallConsistency={voiceData.summary.overallConsistency}
          toneConsistency={voiceData.summary.toneConsistency}
          formalityConsistency={voiceData.summary.formalityConsistency}
          dominantTone={voiceData.summary.dominantTone}
          formalityLevel={voiceData.summary.formalityLevel}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ToneRadarChart
          brandScores={voiceData.brandVoice.toneScores}
          audienceScores={voiceData.audienceVoice.toneScores}
        />
        <ToneBreakdown scores={voiceData.brandVoice.toneScores} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <FormalityGauge
          score={voiceData.brandVoice.formalityScore}
          level={voiceData.brandVoice.formalityLevel}
          targetScore={voiceData.targetVoice.formalityTarget}
        />
        <PersonalityMix scores={voiceData.brandVoice.personalityScores} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <VoiceAlignmentComparison data={voiceData.voiceAlignment} />
        <PlatformVoiceComparison data={voiceData.platformBreakdown} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <VoiceRecommendations recommendations={voiceData.recommendations} />
        </div>
        <TargetVoiceConfig config={voiceData.targetVoice} />
      </section>

      <section className="mb-8">
        <EmojiUsageCard data={voiceData.brandVoice.emojiUsage} />
      </section>

      <section className="pt-6 border-t border-border">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <span>
              <strong className="text-foreground">{voiceData.summary.totalPostsAnalyzed}</strong>{" "}
              posts analyzed
            </span>
            <span>
              <strong className="text-foreground">{voiceData.summary.totalCommentsAnalyzed}</strong>{" "}
              comments analyzed
            </span>
            <span>
              Avg <strong className="text-foreground">{voiceData.summary.avgSentenceLength}</strong>{" "}
              words/sentence
            </span>
            <span>
              Period: <strong className="text-foreground">{voiceData.periodDays} days</strong>
            </span>
          </div>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </section>
    </div>
  );
}

export default function BrandVoicePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading Brand Voice Analysis...</p>
          </div>
        </div>
      }
    >
      <BrandVoiceContent />
    </Suspense>
  );
}
