"use client";

import { Suspense, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const DEMO_SENTIMENT_DATA = {
  summary: { overallSentiment: 72, positivePercentage: 68, neutralPercentage: 24, negativePercentage: 8, totalCommentsAnalyzed: 4892, sentimentTrend: "improving" },
  distribution: [
    { name: "Positivo", value: 3327, color: "#10b981" },
    { name: "Neutral", value: 1174, color: "#6366f1" },
    { name: "Negativo", value: 391, color: "#ef4444" },
  ],
  topPositiveThemes: [
    { theme: "Calidad de Construccion", mentions: 456, sentiment: 89 },
    { theme: "Ubicacion Privilegiada", mentions: 398, sentiment: 92 },
    { theme: "Atencion al Cliente", mentions: 312, sentiment: 85 },
    { theme: "Diseno Moderno", mentions: 287, sentiment: 88 },
    { theme: "Zonas Comunes", mentions: 245, sentiment: 86 },
  ],
  topNegativeThemes: [
    { theme: "Tiempos de Entrega", mentions: 156, sentiment: 28 },
    { theme: "Precios Altos", mentions: 98, sentiment: 35 },
    { theme: "Parqueaderos", mentions: 67, sentiment: 32 },
    { theme: "Respuesta Postventa", mentions: 45, sentiment: 25 },
  ],
  trendingKeywords: [
    { keyword: "excelente", count: 234, sentiment: "positive" },
    { keyword: "hermoso", count: 198, sentiment: "positive" },
    { keyword: "recomendado", count: 176, sentiment: "positive" },
    { keyword: "espera", count: 87, sentiment: "negative" },
    { keyword: "caro", count: 65, sentiment: "negative" },
  ],
  platformSentiment: [
    { platform: "Instagram", positive: 72, neutral: 21, negative: 7 },
    { platform: "TikTok", positive: 65, neutral: 28, negative: 7 },
    { platform: "YouTube", positive: 78, neutral: 18, negative: 4 },
  ],
  recentComments: [
    { id: "1", text: "El apartamento modelo es espectacular! Ya quiero mudarme", author: "maria_lopez", sentiment: "positive", platform: "instagram" },
    { id: "2", text: "Cuando estaran listos los de la torre B? Llevamos meses esperando", author: "carlos_r", sentiment: "negative", platform: "instagram" },
    { id: "3", text: "Buena ubicacion pero los precios subieron mucho", author: "ana_garcia", sentiment: "neutral", platform: "tiktok" },
  ],
  periodDays: 30,
};

const DEMO_TREND_DATA = [
  { date: "2025-12-22", sentiment: 68 }, { date: "2025-12-24", sentiment: 70 },
  { date: "2025-12-26", sentiment: 69 }, { date: "2025-12-28", sentiment: 73 },
  { date: "2025-12-30", sentiment: 71 }, { date: "2026-01-02", sentiment: 74 },
  { date: "2026-01-04", sentiment: 72 }, { date: "2026-01-05", sentiment: 75 },
];

const SENTIMENT_COLORS = { positive: "#10b981", neutral: "#6366f1", negative: "#ef4444" };
const PLATFORM_EMOJI: Record<string, string> = { instagram: "📸", tiktok: "🎵", youtube: "📺" };

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border shadow-xl bg-card ${className}`} style={{ backdropFilter: "blur(12px)" }}>
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: isDark ? "radial-gradient(ellipse at top left, rgba(6, 182, 212, 0.1) 0%, transparent 50%)" : "radial-gradient(ellipse at top left, rgba(6, 182, 212, 0.08) 0%, transparent 50%)" }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function AudienceSentimentContent() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const sentimentData = DEMO_SENTIMENT_DATA;
  const trendData = DEMO_TREND_DATA;
  const getSentimentColor = (score: number) => score >= 70 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500";

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2"><div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" /><span className="text-cyan-400 text-sm font-medium">Analisis de Sentimiento Activo</span></div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Sentimiento de Audiencia</h1>
        <p className="text-muted-foreground mt-1">Entiende como se siente tu audiencia sobre tu marca</p>
      </div>

      <GlassCard className="p-8 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2"><span className="text-3xl">💭</span><span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">Sentimiento General</span></div>
            <div className={`text-6xl font-bold ${getSentimentColor(sentimentData.summary.overallSentiment)} mb-2`}>{sentimentData.summary.overallSentiment}/100</div>
            <p className="text-muted-foreground text-sm mb-6">Score de sentimiento basado en {sentimentData.summary.totalCommentsAnalyzed.toLocaleString()} comentarios</p>
            <div className="grid grid-cols-3 gap-6">
              <div><span className="text-muted-foreground block text-sm">Positivo</span><span className="text-emerald-500 font-bold text-xl">{sentimentData.summary.positivePercentage}%</span></div>
              <div><span className="text-muted-foreground block text-sm">Neutral</span><span className="text-indigo-400 font-bold text-xl">{sentimentData.summary.neutralPercentage}%</span></div>
              <div><span className="text-muted-foreground block text-sm">Negativo</span><span className="text-red-500 font-bold text-xl">{sentimentData.summary.negativePercentage}%</span></div>
            </div>
          </div>
          <div className="w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={sentimentData.distribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">{sentimentData.distribution.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.color} />)}</Pie><Tooltip contentStyle={{ backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)", borderRadius: "12px", color: isDark ? "#fff" : "#1e293b" }} /></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2"><span className="text-emerald-500">👍</span>TEMAS POSITIVOS TOP</h3>
          <div className="space-y-4">
            {sentimentData.topPositiveThemes.map((item) => (
              <div key={item.theme}>
                <div className="flex items-center justify-between mb-1"><span className="text-foreground font-medium">{item.theme}</span><div className="flex items-center gap-2"><span className="text-muted-foreground text-sm">{item.mentions} menciones</span><span className="text-emerald-500 font-bold">{item.sentiment}%</span></div></div>
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${item.sentiment}%` }} /></div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2"><span className="text-red-400">👎</span>TEMAS NEGATIVOS TOP</h3>
          <div className="space-y-4">
            {sentimentData.topNegativeThemes.map((item) => (
              <div key={item.theme}>
                <div className="flex items-center justify-between mb-1"><span className="text-foreground font-medium">{item.theme}</span><div className="flex items-center gap-2"><span className="text-muted-foreground text-sm">{item.mentions} menciones</span><span className="text-red-500 font-bold">{item.sentiment}%</span></div></div>
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden"><div className="h-full rounded-full bg-red-500" style={{ width: `${100 - item.sentiment}%` }} /></div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><span className="text-amber-400">🔤</span>PALABRAS TRENDING</h3>
          <div className="space-y-2">
            {sentimentData.trendingKeywords.map((item) => (
              <div key={item.keyword} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <span className="text-foreground">"{item.keyword}"</span>
                <div className="flex items-center gap-2"><span className="text-muted-foreground text-sm">{item.count}x</span><span className={`w-2 h-2 rounded-full ${item.sentiment === 'positive' ? 'bg-emerald-500' : item.sentiment === 'negative' ? 'bg-red-500' : 'bg-indigo-400'}`} /></div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><span className="text-cyan-400">📈</span>TENDENCIA DE SENTIMIENTO</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                <XAxis dataKey="date" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} tickFormatter={(v) => new Date(v).toLocaleDateString("es-CO", { month: "short", day: "numeric" })} />
                <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)", borderRadius: "12px", color: isDark ? "#fff" : "#1e293b" }} />
                <Line type="monotone" dataKey="sentiment" stroke="#06b6d4" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6 mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><span className="text-indigo-400">📱</span>SENTIMIENTO POR PLATAFORMA</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sentimentData.platformSentiment} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
              <XAxis type="number" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} />
              <YAxis type="category" dataKey="platform" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} width={80} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)", borderRadius: "12px", color: isDark ? "#fff" : "#1e293b" }} />
              <Bar dataKey="positive" name="Positivo" stackId="a" fill={SENTIMENT_COLORS.positive} />
              <Bar dataKey="neutral" name="Neutral" stackId="a" fill={SENTIMENT_COLORS.neutral} />
              <Bar dataKey="negative" name="Negativo" stackId="a" fill={SENTIMENT_COLORS.negative} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="p-6 mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><span className="text-pink-400">💬</span>COMENTARIOS RECIENTES</h3>
        <div className="space-y-3">
          {sentimentData.recentComments.map((comment) => (
            <div key={comment.id} className={`p-4 rounded-xl border ${comment.sentiment === 'positive' ? 'border-emerald-500/30 bg-emerald-500/10' : comment.sentiment === 'negative' ? 'border-red-500/30 bg-red-500/10' : 'border-indigo-500/30 bg-indigo-500/10'}`}>
              <div className="flex items-center gap-2 mb-2">{comment.platform && <span>{PLATFORM_EMOJI[comment.platform]}</span>}<span className="text-foreground font-medium">@{comment.author}</span><span className={`text-xs px-2 py-0.5 rounded ${comment.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-500' : comment.sentiment === 'negative' ? 'bg-red-500/20 text-red-500' : 'bg-indigo-500/20 text-indigo-400'}`}>{comment.sentiment === 'positive' ? 'Positivo' : comment.sentiment === 'negative' ? 'Negativo' : 'Neutral'}</span></div>
              <p className="text-muted-foreground text-sm">{comment.text}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <section className="pt-6 border-t border-border">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4"><span><strong className="text-foreground">{sentimentData.summary.totalCommentsAnalyzed.toLocaleString()}</strong> comentarios</span><span>Tendencia: <strong className="text-emerald-500">{sentimentData.summary.sentimentTrend === 'improving' ? '↑ Mejorando' : '→ Estable'}</strong></span><span>Periodo: <strong className="text-foreground">{sentimentData.periodDays} dias</strong></span></div>
          <span>Actualizado: {new Date().toLocaleTimeString("es-CO")}</span>
        </div>
      </section>
    </div>
  );
}

export default function AudienceSentimentPage() {
  return (<Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><div className="text-center"><div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-muted-foreground">Cargando...</p></div></div>}><AudienceSentimentContent /></Suspense>);
}