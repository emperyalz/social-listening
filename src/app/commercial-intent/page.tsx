"use client";

import { Suspense, useState, useMemo } from "react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ============================================
// CONSTANTS & UTILITIES
// ============================================

const PLATFORM_COLORS = {
  instagram: "#E1306C",
  tiktok: "#00F2EA",
  youtube: "#FF0000",
};

const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "📸",
  tiktok: "🎵",
  youtube: "📺",
};

const TIER_COLORS = {
  interest: "#6366f1",    // Indigo
  inquiry: "#f59e0b",     // Amber
  highIntent: "#10b981",  // Emerald (Money green!)
};

const TIER_LABELS = {
  interest: "Interest",
  inquiry: "Inquiry",
  highIntent: "High Intent",
};

function formatCurrency(num: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
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
          background: "radial-gradient(ellipse at top left, rgba(16, 185, 129, 0.1) 0%, transparent 50%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ============================================
// OPPORTUNITY VALUE CARD
// ============================================

interface OpportunityValueProps {
  value: number;
  highIntentLeads: number;
  aov: number;
  conversionPotential: string;
}

function OpportunityValueCard({ value, highIntentLeads, aov, conversionPotential }: OpportunityValueProps) {
  return (
    <GlassCard
      className="p-8"
      gradient="linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.9) 50%)"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">💰</span>
            <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">
              Estimated Opportunity Value
            </span>
          </div>
          <div className="text-5xl font-bold text-white mb-4">
            {formatCurrency(value)}
          </div>
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-slate-400 block">Hot Leads</span>
              <span className="text-white font-semibold text-lg">{highIntentLeads}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Avg Order Value</span>
              <span className="text-white font-semibold text-lg">{formatCurrency(aov)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Conversion Rate</span>
              <span className="text-emerald-400 font-semibold text-lg">{conversionPotential}%</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <span className="text-5xl">🎯</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// SALES FUNNEL VISUALIZATION
// ============================================

interface FunnelData {
  total: number;
  interest: { count: number; percentage: number };
  inquiry: { count: number; percentage: number };
  highIntent: { count: number; percentage: number };
}

function SalesFunnel({ data }: { data: FunnelData }) {
  const funnelStages = [
    { key: "interest", label: "Interest (Tier 1)", description: "General positive engagement", color: TIER_COLORS.interest, icon: "💬" },
    { key: "inquiry", label: "Inquiry (Tier 2)", description: "Questions & consideration", color: TIER_COLORS.inquiry, icon: "❓" },
    { key: "highIntent", label: "High Intent (Tier 3)", description: "Ready to purchase", color: TIER_COLORS.highIntent, icon: "💰" },
  ];

  return (
    <GlassCard className="p-6 h-full">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <span className="text-emerald-400">📊</span>
        SOCIAL SALES FUNNEL
      </h3>
      
      <div className="space-y-4">
        {funnelStages.map((stage, index) => {
          const stageData = data[stage.key as keyof Omit<FunnelData, 'total'>];
          const widthPercent = data.total > 0 ? (stageData.count / data.total) * 100 : 0;
          const displayWidth = Math.max(widthPercent, 10); // Minimum 10% width for visibility
          
          return (
            <div key={stage.key} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{stage.icon}</span>
                  <div>
                    <span className="text-white font-medium">{stage.label}</span>
                    <span className="text-slate-500 text-xs block">{stage.description}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold text-lg">{formatNumber(stageData.count)}</span>
                  <span className="text-slate-400 text-sm ml-2">({stageData.percentage.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="h-10 bg-slate-800/50 rounded-xl overflow-hidden relative">
                <div
                  className="h-full rounded-xl transition-all duration-500 flex items-center justify-end pr-4"
                  style={{
                    width: `${displayWidth}%`,
                    backgroundColor: stage.color,
                    minWidth: '60px',
                  }}
                >
                  {index < 2 && (
                    <span className="text-white/70 text-xs">→</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Total Comments Analyzed</span>
          <span className="text-white font-semibold">{formatNumber(data.total)}</span>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// HOT LEADS FEED
// ============================================

interface HotLead {
  id: string;
  text: string;
  authorUsername: string;
  authorDisplayName?: string;
  likesCount: number;
  postedAt: number;
  matchedKeywords: string[];
  postUrl?: string;
  platform?: string;
  accountUsername?: string;
  commentId: string;
}

function HotLeadsFeed({ leads }: { leads: HotLead[] }) {
  return (
    <GlassCard className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-red-400">🔥</span>
          HOT LEADS FEED
        </h3>
        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
          Tier 3 Only
        </span>
      </div>
      
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {leads.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <span className="text-4xl mb-3 block">🎯</span>
            <p className="font-medium">No high-intent signals yet</p>
            <p className="text-sm mt-1">Comments with purchase intent will appear here</p>
          </div>
        ) : (
          leads.map((lead) => (
            <div
              key={lead.id}
              className="p-4 rounded-xl bg-slate-800/30 border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">💵</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {lead.platform && (
                      <span className="text-sm">{PLATFORM_EMOJI[lead.platform]}</span>
                    )}
                    <span className="text-white font-medium">@{lead.authorUsername}</span>
                    <span className="text-slate-500 text-xs">{timeAgo(lead.postedAt)}</span>
                  </div>
                  <p className="text-slate-300 text-sm mb-2 line-clamp-2">{lead.text}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {lead.matchedKeywords.slice(0, 3).map((kw, i) => (
                      <span
                        key={i}
                        className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>❤️ {lead.likesCount}</span>
                    {lead.accountUsername && (
                      <span>on @{lead.accountUsername}</span>
                    )}
                    {lead.postUrl && (
                      <a
                        href={lead.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Post →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}

// ============================================
// TRENDING KEYWORDS
// ============================================

function TrendingKeywords({ keywords }: { keywords: { keyword: string; count: number }[] }) {
  const maxCount = keywords[0]?.count || 1;
  
  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-amber-400">🔍</span>
        TRENDING INTENT SIGNALS
      </h3>
      
      <div className="space-y-3">
        {keywords.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No trending keywords yet</p>
        ) : (
          keywords.map((item, index) => (
            <div key={item.keyword} className="flex items-center gap-3">
              <span className="text-slate-500 text-sm w-6">{index + 1}.</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium">"{item.keyword}"</span>
                  <span className="text-slate-400 text-sm">{item.count}x</span>
                </div>
                <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}

// ============================================
// PLATFORM BREAKDOWN
// ============================================

function PlatformBreakdown({ data }: { data: Record<string, { interest: number; inquiry: number; highIntent: number }> }) {
  const platforms = Object.entries(data);
  
  if (platforms.length === 0) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Platform Breakdown</h3>
        <p className="text-slate-500 text-center py-4">No platform data available</p>
      </GlassCard>
    );
  }
  
  const chartData = platforms.map(([platform, counts]) => ({
    platform: platform.charAt(0).toUpperCase() + platform.slice(1),
    interest: counts.interest,
    inquiry: counts.inquiry,
    highIntent: counts.highIntent,
  }));
  
  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-indigo-400">📱</span>
        PLATFORM INTENT BREAKDOWN
      </h3>
      
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" stroke="#64748b" fontSize={11} />
            <YAxis type="category" dataKey="platform" stroke="#64748b" fontSize={11} width={80} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(71, 85, 105, 0.5)",
                borderRadius: "12px",
              }}
            />
            <Bar dataKey="interest" name="Interest" stackId="a" fill={TIER_COLORS.interest} />
            <Bar dataKey="inquiry" name="Inquiry" stackId="a" fill={TIER_COLORS.inquiry} />
            <Bar dataKey="highIntent" name="High Intent" stackId="a" fill={TIER_COLORS.highIntent} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center gap-6 mt-4">
        {Object.entries(TIER_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: TIER_COLORS[key as keyof typeof TIER_COLORS] }}
            />
            <span className="text-slate-400 text-xs">{label}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ============================================
// INTENT TRENDS CHART
// ============================================

function IntentTrendsChart({ data }: { data: { date: string; interest: number; inquiry: number; highIntent: number }[] }) {
  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-cyan-400">📈</span>
        INTENT SIGNALS OVER TIME
      </h3>
      
      <div className="h-[250px]">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>No trend data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
              />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(71, 85, 105, 0.5)",
                  borderRadius: "12px",
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="highIntent"
                name="High Intent"
                stroke={TIER_COLORS.highIntent}
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="inquiry"
                name="Inquiry"
                stroke={TIER_COLORS.inquiry}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="interest"
                name="Interest"
                stroke={TIER_COLORS.interest}
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
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

function CommercialIntentContent() {
  const [aov, setAov] = useState(150);
  const [days, setDays] = useState(30);
  
  // Fetch data from Convex
  const intentAnalysis = useQuery(api.commercialIntent.getCommercialIntentAnalysis, {
    days,
    averageOrderValue: aov,
  });
  
  const intentTrends = useQuery(api.commercialIntent.getIntentTrends, { days });
  
  if (!intentAnalysis) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Commercial Intelligence...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-emerald-400 text-sm font-medium">Sales Pipeline Active</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Commercial Intent Intelligence
            </h1>
            <p className="text-slate-400 mt-1">The "Money" Module - Turn engagement into revenue</p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-slate-400 text-sm">AOV:</label>
              <select
                value={aov}
                onChange={(e) => setAov(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
              >
                <option value={50}>$50</option>
                <option value={100}>$100</option>
                <option value={150}>$150</option>
                <option value={250}>$250</option>
                <option value={500}>$500</option>
                <option value={1000}>$1,000</option>
              </select>
            </div>
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
      </div>
      
      {/* Opportunity Value Hero */}
      <section className="mb-8">
        <OpportunityValueCard
          value={intentAnalysis.summary.estimatedOpportunityValue}
          highIntentLeads={intentAnalysis.summary.highIntentLeads}
          aov={intentAnalysis.summary.averageOrderValue}
          conversionPotential={intentAnalysis.summary.conversionPotential}
        />
      </section>
      
      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SalesFunnel data={intentAnalysis.funnel} />
        <HotLeadsFeed leads={intentAnalysis.hotLeads as HotLead[]} />
      </section>
      
      {/* Secondary Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <TrendingKeywords keywords={intentAnalysis.trendingKeywords} />
        <div className="lg:col-span-2">
          <IntentTrendsChart data={intentTrends || []} />
        </div>
      </section>
      
      {/* Platform Breakdown */}
      <section className="mb-8">
        <PlatformBreakdown data={intentAnalysis.platformBreakdown} />
      </section>
      
      {/* Footer */}
      <section className="pt-6 border-t border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <span>
              <strong className="text-slate-300">{formatNumber(intentAnalysis.summary.totalCommentsAnalyzed)}</strong>{" "}
              comments analyzed
            </span>
            <span>
              <strong className="text-emerald-400">{intentAnalysis.summary.highIntentLeads}</strong>{" "}
              wallet-in-hand leads
            </span>
            <span>
              Period: <strong className="text-slate-300">{intentAnalysis.periodDays} days</strong>
            </span>
          </div>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </section>
    </div>
  );
}

export default function CommercialIntentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading Commercial Intelligence...</p>
          </div>
        </div>
      }
    >
      <CommercialIntentContent />
    </Suspense>
  );
}
