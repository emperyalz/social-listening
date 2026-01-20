"use client";

import { Suspense, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// ============================================
// CONSTANTS & UTILITIES
// ============================================

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

const FORMAT_EMOJIS: Record<string, string> = {
  carousel: "📊",
  video: "🎥",
  tutorial: "📚",
  behindTheScenes: "🎬",
  userGenerated: "👥",
  question: "❓",
  announcement: "📢",
  lifestyle: "✨",
  promotional: "🏷️",
  storytelling: "📖",
  standard: "📝",
};

// ============================================
// GLASSMORPHISM CARD COMPONENT
// ============================================

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}

function GlassCard({ children, className = "", gradient }: GlassCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        border border-slate-700/50
        shadow-xl shadow-black/20
        ${className}
      `}
      style={{
        background: gradient || "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top left, rgba(245, 158, 11, 0.1) 0%, transparent 50%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ============================================
// WINNING FORMULA HERO
// ============================================

interface WinningFormulaProps {
  topFormat: string;
  bestHook: string;
  optimalLength: string;
  bestCTA: string;
  avgEngagement: number;
}

function WinningFormulaHero({
  topFormat,
  bestHook,
  optimalLength,
  bestCTA,
  avgEngagement,
}: WinningFormulaProps) {
  return (
    <GlassCard
      className="p-8"
      gradient="linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.9) 50%)"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">🧬</span>
            <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider">
              Content DNA - Winning Formula
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            What makes your top-performing content work
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <span className="text-2xl mb-2 block">{FORMAT_EMOJIS[topFormat] || "📝"}</span>
              <span className="text-slate-400 block text-xs uppercase tracking-wide">Top Format</span>
              <span className="text-white font-bold text-lg capitalize">{topFormat}</span>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <span className="text-2xl mb-2 block">🎣</span>
              <span className="text-slate-400 block text-xs uppercase tracking-wide">Best Hook</span>
              <span className="text-white font-bold text-lg">{bestHook}</span>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <span className="text-2xl mb-2 block">📏</span>
              <span className="text-slate-400 block text-xs uppercase tracking-wide">Optimal Length</span>
              <span className="text-white font-bold text-lg">{optimalLength}</span>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <span className="text-2xl mb-2 block">📣</span>
              <span className="text-slate-400 block text-xs uppercase tracking-wide">Best CTA</span>
              <span className="text-white font-bold text-lg">{bestCTA}</span>
            </div>
          </div>
        </div>
        
        <div className="hidden md:block">
          <div className="text-right">
            <span className="text-slate-400 text-sm block">Avg Engagement</span>
            <span className="text-4xl font-bold text-amber-400">{formatNumber(avgEngagement)}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// FORMAT PERFORMANCE CHART
// ============================================

interface FormatData {
  format: string;
  count: number;
  avgEngagement: number;
}

function FormatPerformanceChart({ data }: { data: FormatData[] }) {
  const chartData = data.slice(0, 8).map((d) => ({
    ...d,
    emoji: FORMAT_EMOJIS[d.format] || "📝",
    displayName: d.format.charAt(0).toUpperCase() + d.format.slice(1),
  }));

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-amber-400">📊</span>
        FORMAT PERFORMANCE
      </h3>
      
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" stroke="#64748b" fontSize={11} />
            <YAxis
              type="category"
              dataKey="displayName"
              stroke="#64748b"
              fontSize={11}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(71, 85, 105, 0.5)",
                borderRadius: "12px",
              }}
              formatter={(value: number) => [formatNumber(value), "Avg Engagement"]}
            />
            <Bar dataKey="avgEngagement" fill="#f59e0b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-4 gap-2">
        {chartData.slice(0, 4).map((format) => (
          <div key={format.format} className="text-center p-2 bg-slate-800/30 rounded-lg">
            <span className="text-2xl">{format.emoji}</span>
            <div className="text-xs text-slate-400 mt-1">{format.count} posts</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ============================================
// HOOK ANALYSIS CHART
// ============================================

interface HookData {
  hook: string;
  count: number;
  avgEngagement: number;
}

function HookAnalysisChart({ data }: { data: HookData[] }) {
  const chartData = data.slice(0, 6);
  const maxEngagement = Math.max(...chartData.map((d) => d.avgEngagement), 1);

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-emerald-400">🎣</span>
        HOOK EFFECTIVENESS
      </h3>
      
      <div className="space-y-4">
        {chartData.map((hook, index) => (
          <div key={hook.hook}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "○"}</span>
                <span className="text-white font-medium">{hook.hook}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-sm">{hook.count} posts</span>
                <span className="text-emerald-400 font-medium">{formatNumber(hook.avgEngagement)}</span>
              </div>
            </div>
            <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(hook.avgEngagement / maxEngagement) * 100}%`,
                  backgroundColor: index === 0 ? "#10b981" : index === 1 ? "#6366f1" : index === 2 ? "#f59e0b" : "#64748b",
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
// LENGTH ANALYSIS
// ============================================

interface LengthData {
  label: string;
  count: number;
  avgEngagement: number;
}

function LengthAnalysisChart({ data }: { data: LengthData[] }) {
  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-cyan-400">📏</span>
        OPTIMAL CAPTION LENGTH
      </h3>
      
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" height={50} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(71, 85, 105, 0.5)",
                borderRadius: "12px",
              }}
              formatter={(value: number) => [formatNumber(value), "Avg Engagement"]}
            />
            <Bar dataKey="avgEngagement" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-center text-sm text-slate-400">
        Sweet spot: <span className="text-cyan-400 font-medium">
          {data.sort((a, b) => b.avgEngagement - a.avgEngagement)[0]?.label || "N/A"}
        </span>
      </div>
    </GlassCard>
  );
}

// ============================================
// HASHTAG ANALYSIS
// ============================================

function HashtagAnalysisChart({ data }: { data: LengthData[] }) {
  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-violet-400">#️⃣</span>
        HASHTAG SWEET SPOT
      </h3>
      
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" height={50} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(71, 85, 105, 0.5)",
                borderRadius: "12px",
              }}
              formatter={(value: number) => [formatNumber(value), "Avg Engagement"]}
            />
            <Bar dataKey="avgEngagement" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-center text-sm text-slate-400">
        Optimal: <span className="text-violet-400 font-medium">
          {data.sort((a, b) => b.avgEngagement - a.avgEngagement)[0]?.label || "N/A"}
        </span>
      </div>
    </GlassCard>
  );
}

// ============================================
// CTA EFFECTIVENESS
// ============================================

interface CTAData {
  cta: string;
  count: number;
  avgEngagement: number;
}

function CTAEffectivenessChart({ data }: { data: CTAData[] }) {
  const maxEngagement = Math.max(...data.map((d) => d.avgEngagement), 1);

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-pink-400">📣</span>
        CTA EFFECTIVENESS
      </h3>
      
      <div className="space-y-3">
        {data.slice(0, 8).map((cta, index) => (
          <div key={cta.cta}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-medium">{cta.cta}</span>
              <span className="text-pink-400 font-medium">{formatNumber(cta.avgEngagement)}</span>
            </div>
            <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-pink-500 to-rose-500"
                style={{ width: `${(cta.avgEngagement / maxEngagement) * 100}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{cta.count} posts</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ============================================
// TOP VS BOTTOM COMPARISON
// ============================================

interface ComparisonStats {
  avgWordCount: number;
  avgHashtags: number;
  avgEmojis: number;
  ctaUsage: number;
  questionHooks: number;
  listFormat: number;
}

function TopVsBottomComparison({
  topPerformers,
  bottomPerformers,
}: {
  topPerformers: ComparisonStats | null;
  bottomPerformers: ComparisonStats | null;
}) {
  if (!topPerformers || !bottomPerformers) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-emerald-400">⚖️</span>
          TOP vs BOTTOM COMPARISON
        </h3>
        <div className="text-center py-8 text-slate-500">
          <p>Not enough data for comparison</p>
        </div>
      </GlassCard>
    );
  }

  const metrics = [
    { label: "Avg Word Count", top: topPerformers.avgWordCount, bottom: bottomPerformers.avgWordCount, unit: "" },
    { label: "Avg Hashtags", top: topPerformers.avgHashtags, bottom: bottomPerformers.avgHashtags, unit: "" },
    { label: "Avg Emojis", top: topPerformers.avgEmojis, bottom: bottomPerformers.avgEmojis, unit: "" },
    { label: "CTA Usage", top: topPerformers.ctaUsage, bottom: bottomPerformers.ctaUsage, unit: "%" },
    { label: "Question Hooks", top: topPerformers.questionHooks, bottom: bottomPerformers.questionHooks, unit: "%" },
    { label: "List Format", top: topPerformers.listFormat, bottom: bottomPerformers.listFormat, unit: "%" },
  ];

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-emerald-400">⚖️</span>
        TOP vs BOTTOM COMPARISON
      </h3>
      
      <div className="flex justify-between mb-4 text-sm">
        <span className="text-emerald-400 font-medium">🏆 Top 25%</span>
        <span className="text-red-400 font-medium">Bottom 25% 📉</span>
      </div>
      
      <div className="space-y-4">
        {metrics.map((metric) => {
          const diff = metric.top - metric.bottom;
          const diffPercent = metric.bottom > 0 ? Math.round((diff / metric.bottom) * 100) : 0;
          
          return (
            <div key={metric.label} className="p-3 bg-slate-800/30 rounded-xl">
              <div className="text-center text-sm text-slate-400 mb-2">{metric.label}</div>
              <div className="flex items-center justify-between">
                <div className="text-emerald-400 font-bold text-xl">
                  {metric.top}{metric.unit}
                </div>
                <div className={`text-sm px-2 py-0.5 rounded ${
                  diff > 0 ? "bg-emerald-500/20 text-emerald-400" : 
                  diff < 0 ? "bg-red-500/20 text-red-400" : "bg-slate-700 text-slate-400"
                }`}>
                  {diff > 0 ? "+" : ""}{diff}{metric.unit} ({diffPercent > 0 ? "+" : ""}{diffPercent}%)
                </div>
                <div className="text-red-400 font-bold text-xl">
                  {metric.bottom}{metric.unit}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// ============================================
// BEST POSTING TIMES
// ============================================

interface TimeData {
  hour?: number;
  day?: number;
  label: string;
  avgEngagement: number;
  postCount: number;
}

function BestPostingTimes({ hours, days }: { hours: TimeData[]; days: TimeData[] }) {
  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-indigo-400">⏰</span>
        BEST POSTING TIMES
      </h3>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm text-slate-400 mb-3">Best Hours</h4>
          <div className="space-y-2">
            {hours.slice(0, 5).map((time, i) => (
              <div
                key={time.label}
                className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "○"}</span>
                  <span className="text-white">{time.label}</span>
                </div>
                <span className="text-indigo-400 font-medium">{formatNumber(time.avgEngagement)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm text-slate-400 mb-3">Best Days</h4>
          <div className="space-y-2">
            {days.slice(0, 5).map((time, i) => (
              <div
                key={time.label}
                className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "○"}</span>
                  <span className="text-white">{time.label}</span>
                </div>
                <span className="text-indigo-400 font-medium">{formatNumber(time.avgEngagement)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// TOP PERFORMING POSTS
// ============================================

interface TopPost {
  postId: string;
  postUrl: string;
  caption?: string;
  thumbnailUrl?: string;
  platform: string;
  postedAt: number;
  accountUsername?: string;
  likes: number;
  comments: number;
  engagement: number;
  engagementRate: string;
  format: string;
  hookType: string | null;
  hasCTA: boolean;
  wordCount: number;
  hashtagCount: number;
}

function TopPerformingPosts({ posts }: { posts: TopPost[] }) {
  const platformEmoji: Record<string, string> = {
    instagram: "📸",
    tiktok: "🎵",
    youtube: "📺",
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-amber-400">🏆</span>
        TOP PERFORMING POSTS
      </h3>
      
      <div className="space-y-4">
        {posts.slice(0, 5).map((post, index) => (
          <div
            key={post.postId}
            className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30"
          >
            <div className="flex items-start gap-4">
              {post.thumbnailUrl && (
                <img
                  src={post.thumbnailUrl}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}</span>
                  <span>{platformEmoji[post.platform] || "📱"}</span>
                  <span className="text-slate-400 text-sm">@{post.accountUsername}</span>
                </div>
                <p className="text-white text-sm line-clamp-2 mb-2">{post.caption}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                    {formatNumber(post.engagement)} engagement
                  </span>
                  <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded capitalize">
                    {post.format}
                  </span>
                  {post.hookType && (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                      {post.hookType}
                    </span>
                  )}
                  {post.hasCTA && (
                    <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 rounded">
                      Has CTA
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-amber-400 font-bold">{post.engagementRate}%</div>
                <div className="text-slate-500 text-xs">ER</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

function ContentEngineeringContent() {
  const [days, setDays] = useState(30);
  
  // Fetch data from Convex
  const analysisData = useQuery(api.contentReverseEngineering.getContentAnalysis, { days });
  const formulaData = useQuery(api.contentReverseEngineering.getWinningFormula, { days });
  
  if (!analysisData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Reverse-Engineering Content DNA...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-amber-400 text-sm font-medium">Content Analysis Active</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Content Reverse-Engineering
            </h1>
            <p className="text-slate-400 mt-1">Decode what makes your top content perform</p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            <label className="text-slate-400 text-sm">Period:</label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
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
      
      {/* Winning Formula Hero */}
      <section className="mb-8">
        <WinningFormulaHero
          topFormat={analysisData.summary.topFormat}
          bestHook={analysisData.summary.bestHook}
          optimalLength={analysisData.summary.optimalLength}
          bestCTA={analysisData.summary.bestCTA}
          avgEngagement={analysisData.summary.avgEngagement}
        />
      </section>
      
      {/* Format & Hook Analysis */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <FormatPerformanceChart data={analysisData.formatAnalysis} />
        <HookAnalysisChart data={analysisData.hookAnalysis} />
      </section>
      
      {/* Length & Hashtag Analysis */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <LengthAnalysisChart data={analysisData.lengthAnalysis} />
        <HashtagAnalysisChart data={analysisData.hashtagAnalysis} />
      </section>
      
      {/* CTA & Comparison */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CTAEffectivenessChart data={analysisData.ctaAnalysis} />
        <TopVsBottomComparison
          topPerformers={analysisData.comparison.topPerformers}
          bottomPerformers={analysisData.comparison.bottomPerformers}
        />
      </section>
      
      {/* Timing & Top Posts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BestPostingTimes
          hours={analysisData.timingAnalysis.bestHours}
          days={analysisData.timingAnalysis.bestDays}
        />
        <TopPerformingPosts posts={analysisData.topPosts} />
      </section>
      
      {/* Winning Formula Card */}
      {formulaData?.formula && (
        <section className="mb-8">
          <GlassCard className="p-6" gradient="linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.9) 50%)">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-emerald-400">🎯</span>
              YOUR WINNING FORMULA
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded ml-2">
                {formulaData.confidence}% confidence
              </span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="p-3 bg-slate-800/50 rounded-xl text-center">
                <span className="text-2xl mb-1 block">📊</span>
                <span className="text-slate-400 text-xs block">Format</span>
                <span className="text-white font-medium capitalize">{formulaData.formula.format}</span>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl text-center">
                <span className="text-2xl mb-1 block">🎣</span>
                <span className="text-slate-400 text-xs block">Hook</span>
                <span className="text-white font-medium">{formulaData.formula.hook || "Any"}</span>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl text-center">
                <span className="text-2xl mb-1 block">📣</span>
                <span className="text-slate-400 text-xs block">CTA</span>
                <span className="text-white font-medium">{formulaData.formula.cta || "Optional"}</span>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl text-center">
                <span className="text-2xl mb-1 block">📝</span>
                <span className="text-slate-400 text-xs block">Words</span>
                <span className="text-white font-medium">~{formulaData.formula.avgWordCount}</span>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl text-center">
                <span className="text-2xl mb-1 block">#️⃣</span>
                <span className="text-slate-400 text-xs block">Hashtags</span>
                <span className="text-white font-medium">~{formulaData.formula.avgHashtags}</span>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl text-center">
                <span className="text-2xl mb-1 block">😀</span>
                <span className="text-slate-400 text-xs block">Emojis</span>
                <span className="text-white font-medium">~{formulaData.formula.avgEmojis}</span>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl text-center">
                <span className="text-2xl mb-1 block">📢</span>
                <span className="text-slate-400 text-xs block">CTA Usage</span>
                <span className="text-white font-medium">{formulaData.formula.ctaUsagePercent}%</span>
              </div>
            </div>
            
            <p className="text-slate-500 text-sm mt-4">
              Based on analysis of {formulaData.sampleSize} top-performing posts
            </p>
          </GlassCard>
        </section>
      )}
      
      {/* Footer */}
      <section className="pt-6 border-t border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <span>
              <strong className="text-slate-300">{analysisData.summary.totalPostsAnalyzed}</strong>{" "}
              posts analyzed
            </span>
            <span>
              Avg engagement: <strong className="text-slate-300">{formatNumber(analysisData.summary.avgEngagement)}</strong>
            </span>
            <span>
              Period: <strong className="text-slate-300">{analysisData.periodDays} days</strong>
            </span>
          </div>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </section>
    </div>
  );
}

export default function ContentEngineeringPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading Content Analysis...</p>
          </div>
        </div>
      }
    >
      <ContentEngineeringContent />
    </Suspense>
  );
}
