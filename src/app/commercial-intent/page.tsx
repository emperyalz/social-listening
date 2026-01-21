"use client";

import { Suspense, useState, useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
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
// DEMO DATA - Grupo Horizonte (Colombian Real Estate)
// ============================================

const DEMO_INTENT_ANALYSIS = {
  summary: {
    estimatedOpportunityValue: 2850000000,
    highIntentLeads: 47,
    averageOrderValue: 450000000,
    conversionPotential: "12.5",
    totalCommentsAnalyzed: 3847,
  },
  funnel: {
    total: 3847,
    interest: { count: 2156, percentage: 56.0 },
    inquiry: { count: 1245, percentage: 32.4 },
    highIntent: { count: 446, percentage: 11.6 },
  },
  hotLeads: [
    { id: "1", text: "Me encanta este apartamento en El Poblado! Donde puedo agendar una visita?", authorUsername: "carlos_martinez_co", likesCount: 24, postedAt: Date.now() - 1000 * 60 * 30, matchedKeywords: ["agendar visita", "necesito"], platform: "instagram", accountUsername: "grupo_horizonte", commentId: "cm1" },
    { id: "2", text: "Cual es el precio del penthouse en Cartagena? Tengo presupuesto listo.", authorUsername: "maria_rodriguez_bog", likesCount: 18, postedAt: Date.now() - 1000 * 60 * 45, matchedKeywords: ["precio", "presupuesto"], platform: "instagram", accountUsername: "grupo_horizonte", commentId: "cm2" },
    { id: "3", text: "Busco apartamento de 3 habitaciones en Bogota zona norte. Puedo pagar de contado.", authorUsername: "andres_gomez_med", likesCount: 31, postedAt: Date.now() - 1000 * 60 * 120, matchedKeywords: ["busco", "contado"], platform: "instagram", accountUsername: "grupo_horizonte", commentId: "cm3" },
  ],
  trendingKeywords: [
    { keyword: "apartamento", count: 342 },
    { keyword: "precio", count: 287 },
    { keyword: "financiamiento", count: 234 },
    { keyword: "visita", count: 198 },
  ],
  platformBreakdown: {
    instagram: { interest: 1456, inquiry: 834, highIntent: 298 },
    tiktok: { interest: 567, inquiry: 312, highIntent: 112 },
    youtube: { interest: 133, inquiry: 99, highIntent: 36 },
  },
  periodDays: 30,
};

const DEMO_INTENT_TRENDS = [
  { date: "2025-12-26", interest: 67, inquiry: 42, highIntent: 18 },
  { date: "2025-12-27", interest: 73, inquiry: 45, highIntent: 21 },
  { date: "2025-12-28", interest: 81, inquiry: 52, highIntent: 24 },
  { date: "2025-12-29", interest: 78, inquiry: 48, highIntent: 22 },
  { date: "2025-12-30", interest: 85, inquiry: 54, highIntent: 26 },
  { date: "2026-01-03", interest: 89, inquiry: 56, highIntent: 28 },
  { date: "2026-01-04", interest: 94, inquiry: 61, highIntent: 31 },
];

const TIER_COLORS = { interest: "#6366f1", inquiry: "#f59e0b", highIntent: "#10b981" };
const PLATFORM_EMOJI: Record<string, string> = { instagram: "📸", tiktok: "🎵", youtube: "📺" };

function formatCurrency(num: number): string {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(num);
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

function timeAgo(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border shadow-xl bg-card ${className}`} style={{ backdropFilter: "blur(12px)" }}>
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: isDark ? "radial-gradient(ellipse at top left, rgba(16, 185, 129, 0.1) 0%, transparent 50%)" : "radial-gradient(ellipse at top left, rgba(16, 185, 129, 0.08) 0%, transparent 50%)" }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function CommercialIntentContent() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const intentAnalysis = DEMO_INTENT_ANALYSIS;
  const intentTrends = DEMO_INTENT_TRENDS;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-500 text-sm font-medium">Pipeline de Ventas Activo</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
          Inteligencia de Intencion Comercial
        </h1>
        <p className="text-muted-foreground mt-1">El Modulo de Dinero - Convierte engagement en ingresos</p>
      </div>

      <GlassCard className="p-8 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">💰</span>
              <span className="text-emerald-500 text-sm font-semibold uppercase tracking-wider">Valor Estimado</span>
            </div>
            <div className="text-5xl font-bold text-foreground mb-4">{formatCurrency(intentAnalysis.summary.estimatedOpportunityValue)}</div>
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div><span className="text-muted-foreground block">Leads Calientes</span><span className="text-foreground font-semibold text-lg">{intentAnalysis.summary.highIntentLeads}</span></div>
              <div><span className="text-muted-foreground block">Valor Promedio</span><span className="text-foreground font-semibold text-lg">{formatCurrency(intentAnalysis.summary.averageOrderValue)}</span></div>
              <div><span className="text-muted-foreground block">Conversion</span><span className="text-emerald-500 font-semibold text-lg">{intentAnalysis.summary.conversionPotential}%</span></div>
            </div>
          </div>
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center"><span className="text-5xl">🎯</span></div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2"><span className="text-emerald-500">📊</span>EMBUDO DE VENTAS</h3>
          {[{ key: "interest", label: "Interes", color: TIER_COLORS.interest }, { key: "inquiry", label: "Consulta", color: TIER_COLORS.inquiry }, { key: "highIntent", label: "Alta Intencion", color: TIER_COLORS.highIntent }].map((stage) => {
            const data = intentAnalysis.funnel[stage.key as keyof typeof intentAnalysis.funnel] as { count: number; percentage: number };
            return (
              <div key={stage.key} className="mb-4">
                <div className="flex justify-between mb-1"><span className="text-foreground">{stage.label}</span><span className="text-foreground font-bold">{formatNumber(data.count)} ({data.percentage}%)</span></div>
                <div className="h-8 bg-muted/50 rounded-xl overflow-hidden"><div className="h-full rounded-xl" style={{ width: `${Math.max(data.percentage, 10)}%`, backgroundColor: stage.color }} /></div>
              </div>
            );
          })}
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2"><span className="text-red-400">🔥</span>LEADS CALIENTES</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {intentAnalysis.hotLeads.map((lead) => (
              <div key={lead.id} className="p-4 rounded-xl bg-muted/30 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-1">{lead.platform && <span>{PLATFORM_EMOJI[lead.platform]}</span>}<span className="text-foreground font-medium">@{lead.authorUsername}</span><span className="text-muted-foreground text-xs">{timeAgo(lead.postedAt)}</span></div>
                <p className="text-muted-foreground text-sm mb-2">{lead.text}</p>
                <div className="flex gap-1">{lead.matchedKeywords.map((kw, i) => <span key={i} className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded">{kw}</span>)}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><span className="text-amber-400">🔍</span>KEYWORDS TRENDING</h3>
          {intentAnalysis.trendingKeywords.map((item, i) => (
            <div key={item.keyword} className="flex items-center gap-3 mb-3">
              <span className="text-muted-foreground text-sm w-6">{i + 1}.</span>
              <div className="flex-1"><div className="flex justify-between mb-1"><span className="text-foreground">{item.keyword}</span><span className="text-muted-foreground text-sm">{item.count}x</span></div><div className="h-2 bg-muted/50 rounded-full"><div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full" style={{ width: `${(item.count / 342) * 100}%` }} /></div></div>
            </div>
          ))}
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><span className="text-cyan-400">📈</span>TENDENCIA DE INTENCION</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={intentTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                <XAxis dataKey="date" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} tickFormatter={(v) => new Date(v).toLocaleDateString("es-CO", { month: "short", day: "numeric" })} />
                <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)", border: "1px solid rgba(71, 85, 105, 0.5)", borderRadius: "12px", color: isDark ? "#fff" : "#1e293b" }} />
                <Line type="monotone" dataKey="highIntent" stroke={TIER_COLORS.highIntent} strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="inquiry" stroke={TIER_COLORS.inquiry} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="interest" stroke={TIER_COLORS.interest} strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6 mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><span className="text-indigo-400">📱</span>INTENCION POR PLATAFORMA</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={Object.entries(intentAnalysis.platformBreakdown).map(([p, c]) => ({ platform: p.charAt(0).toUpperCase() + p.slice(1), ...c }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
              <XAxis type="number" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} />
              <YAxis type="category" dataKey="platform" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} width={80} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)", borderRadius: "12px", color: isDark ? "#fff" : "#1e293b" }} />
              <Bar dataKey="interest" stackId="a" fill={TIER_COLORS.interest} />
              <Bar dataKey="inquiry" stackId="a" fill={TIER_COLORS.inquiry} />
              <Bar dataKey="highIntent" stackId="a" fill={TIER_COLORS.highIntent} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <section className="pt-6 border-t border-border">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4"><span><strong className="text-foreground">{formatNumber(intentAnalysis.summary.totalCommentsAnalyzed)}</strong> comentarios</span><span><strong className="text-emerald-500">{intentAnalysis.summary.highIntentLeads}</strong> leads calientes</span><span>Periodo: <strong className="text-foreground">{intentAnalysis.periodDays} dias</strong></span></div>
          <span>Actualizado: {new Date().toLocaleTimeString("es-CO")}</span>
        </div>
      </section>
    </div>
  );
}

export default function CommercialIntentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><div className="text-center"><div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-muted-foreground">Cargando...</p></div></div>}>
      <CommercialIntentContent />
    </Suspense>
  );
}
