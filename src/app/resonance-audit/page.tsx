"use client";

import { Suspense, useState, useMemo } from "react";
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
} from "recharts";

// ============================================
// CONSTANTS & UTILITIES
// ============================================

const STATUS_COLORS = {
  aligned: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  neutral: "#6366f1",
};

const SEGMENT_STATUS_COLORS = {
  "on-target": "#10b981",
  "under-target": "#ef4444",
  "over-performing": "#f59e0b",
  neutral: "#64748b",
};

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const defaultGradient = isDark
    ? "radial-gradient(ellipse at top left, rgba(239, 68, 68, 0.1) 0%, transparent 50%)"
    : "radial-gradient(ellipse at top left, rgba(239, 68, 68, 0.08) 0%, transparent 50%)";

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
// ALIGNMENT SCORE HERO
// ============================================

interface AlignmentScoreProps {
  overallScore: number;
  messagingScore: number;
  alignedCount: number;
  errorCount: number;
  warningCount: number;
}

function AlignmentScoreHero({
  overallScore,
  messagingScore,
  alignedCount,
  errorCount,
  warningCount,
}: AlignmentScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <GlassCard
      className="p-8"
      gradient={`radial-gradient(ellipse at top left, ${overallScore >= 80 ? 'rgba(16, 185, 129, 0.15)' : overallScore >= 60 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)'} 0%, transparent 50%)`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">🎯</span>
            <span className="text-red-400 text-sm font-semibold uppercase tracking-wider">
              Strategy-Reality Alignment
            </span>
          </div>
          <div className={`text-6xl font-bold ${getScoreColor(overallScore)} mb-2`}>
            {overallScore}%
          </div>
          <p className="text-muted-foreground text-sm mb-6">
            How well your content matches your brand strategy
          </p>

          <div className="grid grid-cols-4 gap-6">
            <div>
              <span className="text-muted-foreground block text-sm">Messaging Match</span>
              <span className={`font-bold text-xl ${getScoreColor(messagingScore)}`}>
                {messagingScore}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-sm">Aligned</span>
              <span className="font-bold text-xl text-emerald-500">{alignedCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-sm">Errors</span>
              <span className="font-bold text-xl text-red-500">{errorCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-sm">Warnings</span>
              <span className="font-bold text-xl text-amber-500">{warningCount}</span>
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
                stroke={overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(overallScore / 100) * 352} 352`}
                className="transition-all duration-1000"
              />
            </svg>
            <span className="text-4xl">🛡️</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// HEX GRID VISUALIZATION
// ============================================

interface HexGridItem {
  concept: string;
  inStrategy: boolean;
  captionPresence: number;
  commentPresence: number;
  totalPresence: number;
  status: "aligned" | "error" | "warning" | "neutral";
}

function HexGrid({ data }: { data: HexGridItem[] }) {
  return (
    <GlassCard className="p-6 h-full">
      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <span className="text-red-400">⬢</span>
        STRATEGY HEX-GRID
      </h3>

      <div className="grid grid-cols-3 gap-4">
        {data.map((item) => (
          <div
            key={item.concept}
            className={`
              relative p-4 rounded-xl border-2 transition-all
              ${item.status === 'aligned' ? 'border-emerald-500/50 bg-emerald-500/10' : ''}
              ${item.status === 'error' ? 'border-red-500/50 bg-red-500/10' : ''}
              ${item.status === 'warning' ? 'border-amber-500/50 bg-amber-500/10' : ''}
              ${item.status === 'neutral' ? 'border-border bg-muted/30' : ''}
            `}
          >
            {item.inStrategy && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-xs">★</span>
              </div>
            )}

            <div className="text-center">
              <span className="text-2xl mb-2 block">
                {item.status === 'aligned' ? '✅' : item.status === 'error' ? '❌' : item.status === 'warning' ? '⚠️' : '○'}
              </span>
              <span className="text-foreground font-medium block mb-1">{item.concept}</span>
              <div className="text-xs text-muted-foreground">
                <span>Captions: {item.captionPresence}</span>
                <span className="mx-1">|</span>
                <span>Comments: {item.commentPresence}</span>
              </div>
            </div>

            {item.status === 'error' && (
              <div className="mt-2 text-xs text-red-400 text-center">
                ⚡ Alignment Error
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-muted-foreground text-xs">Aligned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-muted-foreground text-xs">Error</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-muted-foreground text-xs">Unintended</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
            <span className="text-xs">★</span>
          </div>
          <span className="text-muted-foreground text-xs">In Strategy</span>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// SEGMENT GAP ANALYSIS
// ============================================

interface SegmentData {
  segment: string;
  isTargeted: boolean;
  presence: number;
  matchedKeywords: string[];
  status: "on-target" | "under-target" | "over-performing" | "neutral";
}

function SegmentGapAnalysis({ data }: { data: SegmentData[] }) {
  const maxPresence = Math.max(...data.map((d) => d.presence), 1);

  return (
    <GlassCard className="p-6 h-full">
      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <span className="text-amber-400">🎯</span>
        SEGMENT GAP ANALYSIS
      </h3>

      <div className="space-y-4">
        {data.map((seg) => (
          <div key={seg.segment} className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {seg.isTargeted && (
                  <span className="text-xs bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded">
                    TARGET
                  </span>
                )}
                <span className="text-foreground font-medium">{seg.segment}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    seg.status === 'on-target' ? 'bg-emerald-500/20 text-emerald-500' :
                    seg.status === 'under-target' ? 'bg-red-500/20 text-red-500' :
                    seg.status === 'over-performing' ? 'bg-amber-500/20 text-amber-500' :
                    'bg-muted text-muted-foreground'
                  }`}
                >
                  {seg.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className="text-muted-foreground text-sm">{seg.presence} signals</span>
              </div>
            </div>

            <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max((seg.presence / maxPresence) * 100, 5)}%`,
                  backgroundColor: SEGMENT_STATUS_COLORS[seg.status],
                }}
              />
            </div>

            {seg.matchedKeywords.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {seg.matchedKeywords.slice(0, 5).map((kw, i) => (
                  <span key={i} className="text-xs text-muted-foreground">
                    {kw}{i < Math.min(seg.matchedKeywords.length, 5) - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ============================================
// CONTENT THEMES
// ============================================

interface ThemeData {
  theme: string;
  score: number;
  percentage: number;
  matchedKeywords: string[];
}

function ContentThemes({ data }: { data: ThemeData[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const THEME_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4'];

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <span className="text-cyan-400">📊</span>
        CONTENT THEME DISTRIBUTION
      </h3>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
            <XAxis type="number" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} />
            <YAxis type="category" dataKey="theme" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} width={80} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
                border: isDark ? "1px solid rgba(71, 85, 105, 0.5)" : "1px solid rgba(226, 232, 240, 0.8)",
                borderRadius: "12px",
                color: isDark ? "#fff" : "#1e293b",
              }}
              formatter={(value: number) => [`${value} mentions`, 'Score']}
            />
            <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2">
        {data.map((themeItem, i) => (
          <div key={themeItem.theme} className="text-center">
            <div
              className="text-lg font-bold"
              style={{ color: THEME_COLORS[i % THEME_COLORS.length] }}
            >
              {themeItem.percentage}%
            </div>
            <div className="text-xs text-muted-foreground">{themeItem.theme}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ============================================
// ALIGNMENT ISSUES LIST
// ============================================

interface AlignmentIssue {
  type: string;
  concept: string;
  message: string;
  severity: "high" | "medium" | "low";
}

function AlignmentIssues({ issues }: { issues: AlignmentIssue[] }) {
  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="text-red-400">⚠️</span>
        ALIGNMENT ISSUES
      </h3>

      {issues.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <span className="text-4xl mb-2 block">✅</span>
          <p>No alignment issues detected</p>
          <p className="text-sm mt-1">Your content is well-aligned with your strategy</p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue, index) => (
            <div
              key={index}
              className={`
                p-4 rounded-xl border
                ${issue.severity === 'high' ? 'border-red-500/30 bg-red-500/10' : ''}
                ${issue.severity === 'medium' ? 'border-amber-500/30 bg-amber-500/10' : ''}
                ${issue.severity === 'low' ? 'border-border bg-muted/30' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">
                  {issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢'}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-foreground font-medium">{issue.concept}</span>
                    <span className="text-xs text-muted-foreground">{issue.type}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{issue.message}</p>
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
// STRATEGY CONFIG DISPLAY
// ============================================

interface StrategyConfig {
  targetAttributes: string[];
  targetSegments: string[];
  activeDocuments: string[];
}

function StrategyConfigDisplay({ config }: { config: StrategyConfig }) {
  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="text-indigo-400">📄</span>
        ACTIVE STRATEGY CONFIG
      </h3>

      <div className="space-y-4">
        <div>
          <span className="text-muted-foreground text-sm block mb-2">Target Brand Attributes</span>
          <div className="flex flex-wrap gap-2">
            {config.targetAttributes.map((attr) => (
              <span
                key={attr}
                className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm"
              >
                {attr}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="text-muted-foreground text-sm block mb-2">Target Segments</span>
          <div className="flex flex-wrap gap-2">
            {config.targetSegments.map((seg) => (
              <span
                key={seg}
                className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm"
              >
                {seg}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="text-muted-foreground text-sm block mb-2">Active Documents</span>
          <div className="space-y-1">
            {config.activeDocuments.map((doc) => (
              <div
                key={doc}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <span className="text-amber-400">📁</span>
                {doc}
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// ALIGNMENT TRENDS CHART
// ============================================

function AlignmentTrendsChart({ data }: { data: { date: string; alignmentScore: number; posts: number }[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="text-emerald-500">📈</span>
        ALIGNMENT SCORE TREND
      </h3>

      <div className="h-[200px]">
        {data.length === 0 || data.every(d => d.posts === 0) ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No trend data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.filter(d => d.posts > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
              <XAxis
                dataKey="date"
                stroke={isDark ? "#64748b" : "#94a3b8"}
                fontSize={11}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
              />
              <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
                  border: isDark ? "1px solid rgba(71, 85, 105, 0.5)" : "1px solid rgba(226, 232, 240, 0.8)",
                  borderRadius: "12px",
                  color: isDark ? "#fff" : "#1e293b",
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="alignmentScore"
                name="Alignment Score"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

function ResonanceAuditContent() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [days, setDays] = useState(30);

  const auditData = useQuery(api.resonanceAudit.getResonanceAudit, { days });
  const trendData = useQuery(api.resonanceAudit.getAlignmentTrends, { days });

  if (!auditData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing Strategy Alignment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          <span className="text-red-400 text-sm font-medium">Resonance Analysis Active</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">
              Resonance Audit
            </h1>
            <p className="text-muted-foreground mt-1">Strategy vs Reality - Measure your brand alignment</p>
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
        <AlignmentScoreHero
          overallScore={auditData.summary.overallAlignmentScore}
          messagingScore={auditData.summary.messagingMatchScore}
          alignedCount={auditData.summary.alignedConcepts}
          errorCount={auditData.summary.alignmentErrors}
          warningCount={auditData.summary.alignmentWarnings}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <HexGrid data={auditData.hexGrid as HexGridItem[]} />
        <SegmentGapAnalysis data={auditData.segmentGapAnalysis as SegmentData[]} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ContentThemes data={auditData.contentThemes as ThemeData[]} />
        </div>
        <StrategyConfigDisplay config={auditData.strategyConfig} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AlignmentIssues issues={auditData.alignmentIssues as AlignmentIssue[]} />
        <AlignmentTrendsChart data={trendData || []} />
      </section>

      <section className="pt-6 border-t border-border">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <span>
              <strong className="text-foreground">{auditData.summary.totalPostsAnalyzed}</strong>{" "}
              posts analyzed
            </span>
            <span>
              <strong className="text-foreground">{auditData.summary.totalCommentsAnalyzed}</strong>{" "}
              comments analyzed
            </span>
            <span>
              Period: <strong className="text-foreground">{auditData.periodDays} days</strong>
            </span>
          </div>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </section>
    </div>
  );
}

export default function ResonanceAuditPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading Resonance Audit...</p>
          </div>
        </div>
      }
    >
      <ResonanceAuditContent />
    </Suspense>
  );
}
