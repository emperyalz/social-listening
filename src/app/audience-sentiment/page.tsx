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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

// ============================================
// CONSTANTS & UTILITIES
// ============================================

const SENTIMENT_COLORS = {
  positive: "#10b981",
  negative: "#ef4444",
  neutral: "#64748b",
};

const ENGAGEMENT_TYPE_EMOJI: Record<string, string> = {
  question: "❓",
  purchase: "🛒",
  compliment: "💕",
  suggestion: "💡",
  share: "📤",
  support: "🙏",
  general: "💬",
};

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

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
          background: "radial-gradient(ellipse at top left, rgba(6, 182, 212, 0.1) 0%, transparent 50%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ============================================
// SENTIMENT SCORE HERO
// ============================================

interface SentimentHeroProps {
  score: number;
  label: string;
  totalComments: number;
  positivePercent: number;
  negativePercent: number;
}

function SentimentScoreHero({
  score,
  label,
  totalComments,
  positivePercent,
  negativePercent,
}: SentimentHeroProps) {
  const getScoreColor = (s: number) => {
    if (s >= 60) return "text-emerald-400";
    if (s >= 40) return "text-amber-400";
    return "text-red-400";
  };

  const getGradient = (s: number) => {
    if (s >= 60) return "rgba(16, 185, 129, 0.15)";
    if (s >= 40) return "rgba(245, 158, 11, 0.15)";
    return "rgba(239, 68, 68, 0.15)";
  };

  return (
    <GlassCard
      className="p-8"
      gradient={`linear-gradient(135deg, ${getGradient(score)} 0%, rgba(15, 23, 42, 0.9) 50%)`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">💬</span>
            <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">
              Audience Sentiment
            </span>
          </div>
          <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>
            {score}
          </div>
          <p className="text-slate-400 text-sm mb-6">
            Overall sentiment score from {formatNumber(totalComments)} comments
          </p>
          
          <div className="grid grid-cols-3 gap-6">
            <div>
              <span className="text-slate-400 block text-sm">Mood</span>
              <span className={`font-bold text-xl ${getScoreColor(score)}`}>{label}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-sm">Positive</span>
              <span className="font-bold text-xl text-emerald-400">{positivePercent}%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-sm">Negative</span>
              <span className="font-bold text-xl text-red-400">{negativePercent}%</span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-slate-700 flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke={score >= 60 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 352} 352`}
                className="transition-all duration-1000"
              />
            </svg>
            <span className="text-4xl">
              {score >= 60 ? "😊" : score >= 40 ? "😐" : "😔"}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// SENTIMENT DISTRIBUTION PIE
// ============================================

interface SentimentDistribution {
  positive: { count: number; percentage: number };
  negative: { count: number; percentage: number };
  neutral: { count: number; percentage: number };
}

function SentimentDistributionChart({ data }: { data: SentimentDistribution }) {
  const pieData = [
    { name: "Positive", value: data.positive.count, color: SENTIMENT_COLORS.positive },
    { name: "Neutral", value: data.neutral.count, color: SENTIMENT_COLORS.neutral },
    { name: "Negative", value: data.negative.count, color: SENTIMENT_COLORS.negative },
  ];

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-cyan-400">🎭</span>
        SENTIMENT DISTRIBUTION
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
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(71, 85, 105, 0.5)",
                borderRadius: "12px",
              }}
              formatter={(value: number, name: string) => [formatNumber(value), name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <div className="w-3 h-3 rounded bg-emerald-500 mx-auto mb-1" />
          <span className="text-emerald-400 font-bold">{data.positive.percentage}%</span>
          <span className="text-slate-500 text-xs block">Positive</span>
        </div>
        <div className="text-center">
          <div className="w-3 h-3 rounded bg-slate-500 mx-auto mb-1" />
          <span className="text-slate-400 font-bold">{data.neutral.percentage}%</span>
          <span className="text-slate-500 text-xs block">Neutral</span>
        </div>
        <div className="text-center">
          <div className="w-3 h-3 rounded bg-red-500 mx-auto mb-1" />
          <span className="text-red-400 font-bold">{data.negative.percentage}%</span>
          <span className="text-slate-500 text-xs block">Negative</span>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// ENGAGEMENT TYPE BREAKDOWN
// ============================================

interface EngagementType {
  type: string;
  count: number;
  percentage: number;
  examples: string[];
}

function EngagementBreakdown({ data }: { data: EngagementType[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-violet-400">💬</span>
        ENGAGEMENT TYPES
      </h3>
      
      <div className="space-y-4">
        {data.slice(0, 7).map((item) => (
          <div key={item.type}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span>{ENGAGEMENT_TYPE_EMOJI[item.type] || "💬"}</span>
                <span className="text-white font-medium capitalize">{item.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-violet-400 font-medium">{item.percentage}%</span>
                <span className="text-slate-500 text-sm">({formatNumber(item.count)})</span>
              </div>
            </div>
            <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-violet-500 to-purple-500"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ============================================
// TOP SENTIMENT WORDS
// ============================================

interface SentimentWord {
  word: string;
  count: number;
  sentiment: "positive" | "negative";
}

function TopSentimentWords({ data }: { data: SentimentWord[] }) {
  const positiveWords = data.filter((w) => w.sentiment === "positive").slice(0, 10);
  const negativeWords = data.filter((w) => w.sentiment === "negative").slice(0, 10);

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-amber-400">🔤</span>
        TOP SENTIMENT WORDS
      </h3>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-emerald-400 text-sm font-medium mb-3 flex items-center gap-1">
            <span>😊</span> Positive
          </h4>
          <div className="flex flex-wrap gap-2">
            {positiveWords.map((word) => (
              <span
                key={word.word}
                className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm"
              >
                {word.word} <span className="text-emerald-500">({word.count})</span>
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-red-400 text-sm font-medium mb-3 flex items-center gap-1">
            <span>😔</span> Negative
          </h4>
          <div className="flex flex-wrap gap-2">
            {negativeWords.map((word) => (
              <span
                key={word.word}
                className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm"
              >
                {word.word} <span className="text-red-500">({word.count})</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// PLATFORM SENTIMENT
// ============================================

interface PlatformSentiment {
  platform: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

function PlatformSentimentChart({ data }: { data: PlatformSentiment[] }) {
  const platformEmoji: Record<string, string> = {
    instagram: "📸",
    tiktok: "🎵",
    youtube: "📺",
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-indigo-400">📱</span>
        SENTIMENT BY PLATFORM
      </h3>
      
      {data.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p>No platform data available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((platform) => (
            <div key={platform.platform} className="p-4 bg-slate-800/30 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{platformEmoji[platform.platform] || "📱"}</span>
                  <span className="text-white font-medium capitalize">{platform.platform}</span>
                </div>
                <span className="text-slate-400 text-sm">{formatNumber(platform.total)} comments</span>
              </div>
              
              <div className="h-4 bg-slate-800/50 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${platform.positive}%` }}
                />
                <div
                  className="h-full bg-slate-500 transition-all"
                  style={{ width: `${platform.neutral}%` }}
                />
                <div
                  className="h-full bg-red-500 transition-all"
                  style={{ width: `${platform.negative}%` }}
                />
              </div>
              
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-emerald-400">{platform.positive}% 👍</span>
                <span className="text-slate-400">{platform.neutral}% 😐</span>
                <span className="text-red-400">{platform.negative}% 👎</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

// ============================================
// TOP COMMENTERS
// ============================================

interface Commenter {
  username: string;
  comments: number;
  avgSentiment: number;
  totalLikes: number;
  sentimentLabel: "positive" | "negative" | "neutral";
}

function TopCommenters({ data }: { data: Commenter[] }) {
  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-pink-400">👥</span>
        MOST ENGAGED COMMENTERS
      </h3>
      
      <div className="space-y-3">
        {data.slice(0, 8).map((commenter, index) => (
          <div
            key={commenter.username}
            className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{index < 3 ? ["🥇", "🥈", "🥉"][index] : `#${index + 1}`}</span>
              <div>
                <span className="text-white font-medium">@{commenter.username}</span>
                <div className="text-xs text-slate-500">{commenter.comments} comments</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm">❤️ {formatNumber(commenter.totalLikes)}</span>
              <span className={`text-sm px-2 py-0.5 rounded ${
                commenter.sentimentLabel === "positive" ? "bg-emerald-500/20 text-emerald-400" :
                commenter.sentimentLabel === "negative" ? "bg-red-500/20 text-red-400" :
                "bg-slate-700 text-slate-400"
              }`}>
                {commenter.sentimentLabel === "positive" ? "😊" : commenter.sentimentLabel === "negative" ? "😔" : "😐"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ============================================
// ATTENTION REQUIRED
// ============================================

interface AttentionItem {
  text: string;
  username?: string;
  postedAt: number;
  likes?: number;
  sentiment?: string;
  negativeWords?: string[];
}

interface AttentionRequired {
  questions: AttentionItem[];
  purchaseIntent: AttentionItem[];
  negativeComments: AttentionItem[];
}

function AttentionRequiredSection({ data }: { data: AttentionRequired }) {
  const [activeTab, setActiveTab] = useState<"questions" | "purchase" | "negative">("questions");

  const tabs = [
    { id: "questions" as const, label: "Questions", emoji: "❓", count: data.questions.length, color: "indigo" },
    { id: "purchase" as const, label: "Purchase Intent", emoji: "🛒", count: data.purchaseIntent.length, color: "emerald" },
    { id: "negative" as const, label: "Negative", emoji: "⚠️", count: data.negativeComments.length, color: "red" },
  ];

  const activeItems = activeTab === "questions" ? data.questions :
    activeTab === "purchase" ? data.purchaseIntent : data.negativeComments;

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-amber-400">🔔</span>
        ATTENTION REQUIRED
      </h3>
      
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? `bg-${tab.color}-500/20 text-${tab.color}-400 border border-${tab.color}-500/30`
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
            }`}
            style={{
              backgroundColor: activeTab === tab.id 
                ? tab.color === "indigo" ? "rgba(99, 102, 241, 0.2)" 
                  : tab.color === "emerald" ? "rgba(16, 185, 129, 0.2)" 
                  : "rgba(239, 68, 68, 0.2)"
                : undefined,
              color: activeTab === tab.id
                ? tab.color === "indigo" ? "#818cf8"
                  : tab.color === "emerald" ? "#34d399"
                  : "#f87171"
                : undefined,
            }}
          >
            <span className="mr-1">{tab.emoji}</span>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>
      
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {activeItems.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <span className="text-3xl block mb-2">✅</span>
            <p>No items requiring attention</p>
          </div>
        ) : (
          activeItems.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border ${
                activeTab === "negative" 
                  ? "border-red-500/30 bg-red-500/10" 
                  : activeTab === "purchase"
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-indigo-500/30 bg-indigo-500/10"
              }`}
            >
              <p className="text-white text-sm mb-2">{item.text}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">@{item.username || "Anonymous"}</span>
                <span className="text-slate-500">{timeAgo(item.postedAt)}</span>
              </div>
              {item.negativeWords && item.negativeWords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.negativeWords.map((word, i) => (
                    <span key={i} className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                      {word}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}

// ============================================
// SENTIMENT TRENDS
// ============================================

interface TrendData {
  date: string;
  sentimentScore: number;
  positivePercent: number;
  negativePercent: number;
  total: number;
}

function SentimentTrendsChart({ data }: { data: TrendData[] }) {
  const filteredData = data.filter((d) => d.total > 0);

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-cyan-400">📈</span>
        SENTIMENT TREND
      </h3>
      
      <div className="h-[250px]">
        {filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>No trend data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={10}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
              />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(71, 85, 105, 0.5)",
                  borderRadius: "12px",
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="positivePercent"
                name="Positive %"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="negativePercent"
                name="Negative %"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

function AudienceSentimentContent() {
  const [days, setDays] = useState(30);
  
  // Fetch data from Convex
  const sentimentData = useQuery(api.audienceSentiment.getAudienceSentiment, { days });
  const trendsData = useQuery(api.audienceSentiment.getSentimentTrends, { days });
  
  if (!sentimentData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Analyzing Audience Sentiment...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          <span className="text-cyan-400 text-sm font-medium">Sentiment Analysis Active</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Audience & Sentiment Deep Dive
            </h1>
            <p className="text-slate-400 mt-1">Understand how your audience feels about your content</p>
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
      
      {/* Sentiment Hero */}
      <section className="mb-8">
        <SentimentScoreHero
          score={sentimentData.summary.overallSentimentScore}
          label={sentimentData.summary.sentimentLabel}
          totalComments={sentimentData.summary.totalComments}
          positivePercent={sentimentData.summary.positivePercentage}
          negativePercent={sentimentData.summary.negativePercentage}
        />
      </section>
      
      {/* Distribution & Engagement */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SentimentDistributionChart data={sentimentData.sentimentDistribution} />
        <EngagementBreakdown data={sentimentData.engagementBreakdown} />
      </section>
      
      {/* Words & Platforms */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TopSentimentWords data={sentimentData.topSentimentWords} />
        <PlatformSentimentChart data={sentimentData.platformBreakdown} />
      </section>
      
      {/* Commenters & Attention */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TopCommenters data={sentimentData.topCommenters} />
        <AttentionRequiredSection data={sentimentData.attentionRequired} />
      </section>
      
      {/* Trends */}
      <section className="mb-8">
        <SentimentTrendsChart data={trendsData || []} />
      </section>
      
      {/* Footer */}
      <section className="pt-6 border-t border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <span>
              <strong className="text-slate-300">{formatNumber(sentimentData.summary.totalComments)}</strong>{" "}
              comments analyzed
            </span>
            <span>
              <strong className="text-slate-300">{sentimentData.summary.totalPostsAnalyzed}</strong>{" "}
              posts
            </span>
            <span>
              Score: <strong className="text-slate-300">{sentimentData.summary.overallSentimentScore}/100</strong>
            </span>
            <span>
              Period: <strong className="text-slate-300">{sentimentData.periodDays} days</strong>
            </span>
          </div>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </section>
    </div>
  );
}

export default function AudienceSentimentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading Sentiment Analysis...</p>
          </div>
        </div>
      }
    >
      <AudienceSentimentContent />
    </Suspense>
  );
}
