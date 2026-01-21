"use client";

import { Suspense, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

const DEMO_ANALYSIS_DATA = {
  summary: { totalPostsAnalyzed: 156, avgEngagementRate: 4.2, topPerformingFormat: "Carrusel", topPerformingHook: "Pregunta", overallContentScore: 78 },
  formatPerformance: [
    { format: "Carrusel", posts: 45, avgEngagement: 5.8, avgViews: 12500, score: 92 },
    { format: "Reel", posts: 38, avgEngagement: 4.9, avgViews: 18200, score: 87 },
    { format: "Imagen", posts: 52, avgEngagement: 3.2, avgViews: 5800, score: 68 },
    { format: "Video", posts: 21, avgEngagement: 4.1, avgViews: 8900, score: 75 },
  ],
  hookEffectiveness: [
    { hook: "Pregunta", usage: 34, avgEngagement: 5.4, effectiveness: 89 },
    { hook: "Estadistica", usage: 28, avgEngagement: 4.8, effectiveness: 82 },
    { hook: "Historia", usage: 22, avgEngagement: 4.2, effectiveness: 76 },
    { hook: "Beneficio", usage: 18, avgEngagement: 3.9, effectiveness: 71 },
    { hook: "Urgencia", usage: 12, avgEngagement: 4.5, effectiveness: 78 },
  ],
  winningFormula: { format: "Carrusel", hook: "Pregunta", timing: "Martes 7pm", hashtags: ["InversionColombia", "ApartamentosMedellin", "VidaEnElPoblado"], captions: "150-200 caracteres", cta: "Link en bio" },
  contentPillars: [
    { pillar: "Proyectos", posts: 48, engagement: 4.8, score: 85 },
    { pillar: "Lifestyle", posts: 35, engagement: 5.2, score: 88 },
    { pillar: "Educativo", posts: 28, engagement: 3.8, score: 72 },
    { pillar: "Testimonios", posts: 25, engagement: 5.6, score: 91 },
    { pillar: "Behind Scenes", posts: 20, engagement: 4.1, score: 76 },
  ],
  bestTimes: [
    { day: "Lunes", hour: 19, engagement: 4.2 }, { day: "Martes", hour: 19, engagement: 5.8 },
    { day: "Miercoles", hour: 20, engagement: 4.5 }, { day: "Jueves", hour: 19, engagement: 4.1 },
    { day: "Viernes", hour: 18, engagement: 3.8 }, { day: "Sabado", hour: 11, engagement: 4.9 },
  ],
  periodDays: 30,
};

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border shadow-xl bg-card ${className}`} style={{ backdropFilter: "blur(12px)" }}>
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: isDark ? "radial-gradient(ellipse at top left, rgba(168, 85, 247, 0.1) 0%, transparent 50%)" : "radial-gradient(ellipse at top left, rgba(168, 85, 247, 0.08) 0%, transparent 50%)" }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function ContentEngineeringContent() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const analysisData = DEMO_ANALYSIS_DATA;
  const getScoreColor = (score: number) => score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500";

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2"><div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" /><span className="text-purple-400 text-sm font-medium">Analisis de Contenido Activo</span></div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Ingenieria de Contenido</h1>
        <p className="text-muted-foreground mt-1">Descubre tu formula ganadora de contenido</p>
      </div>

      <GlassCard className="p-8 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2"><span className="text-3xl">🧪</span><span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Formula Ganadora</span></div>
            <div className={`text-6xl font-bold ${getScoreColor(analysisData.summary.overallContentScore)} mb-4`}>{analysisData.summary.overallContentScore}/100</div>
            <div className="grid grid-cols-4 gap-6">
              <div><span className="text-muted-foreground block text-sm">Mejor Formato</span><span className="text-foreground font-bold text-lg">{analysisData.summary.topPerformingFormat}</span></div>
              <div><span className="text-muted-foreground block text-sm">Mejor Hook</span><span className="text-foreground font-bold text-lg">{analysisData.summary.topPerformingHook}</span></div>
              <div><span className="text-muted-foreground block text-sm">Engagement Prom</span><span className="text-emerald-500 font-bold text-lg">{analysisData.summary.avgEngagementRate}%</span></div>
              <div><span className="text-muted-foreground block text-sm">Posts Analizados</span><span className="text-foreground font-bold text-lg">{analysisData.summary.totalPostsAnalyzed}</span></div>
            </div>
          </div>
          <div className="text-right p-6 bg-purple-500/10 rounded-2xl border border-purple-500/30">
            <span className="text-purple-400 text-sm font-semibold block mb-2">TU FORMULA</span>
            <div className="space-y-1 text-sm"><p className="text-foreground"><span className="text-muted-foreground">Formato:</span> {analysisData.winningFormula.format}</p><p className="text-foreground"><span className="text-muted-foreground">Hook:</span> {analysisData.winningFormula.hook}</p><p className="text-foreground"><span className="text-muted-foreground">Timing:</span> {analysisData.winningFormula.timing}</p><p className="text-foreground"><span className="text-muted-foreground">CTA:</span> {analysisData.winningFormula.cta}</p></div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2"><span className="text-purple-400">📊</span>RENDIMIENTO POR FORMATO</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysisData.formatPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                <XAxis dataKey="format" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} />
                <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)", borderRadius: "12px", color: isDark ? "#fff" : "#1e293b" }} />
                <Bar dataKey="avgEngagement" name="Engagement %" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {analysisData.formatPerformance.map((f) => (
              <div key={f.format} className="text-center p-2 bg-muted/30 rounded-lg">
                <span className="text-foreground font-bold block">{f.posts}</span>
                <span className="text-muted-foreground text-xs">{f.format}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2"><span className="text-pink-400">🎣</span>EFECTIVIDAD DE HOOKS</h3>
          <div className="space-y-4">
            {analysisData.hookEffectiveness.map((hook) => (
              <div key={hook.hook}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-foreground font-medium">{hook.hook}</span>
                  <div className="flex items-center gap-3"><span className="text-muted-foreground text-sm">{hook.usage} posts</span><span className={`font-bold ${getScoreColor(hook.effectiveness)}`}>{hook.effectiveness}%</span></div>
                </div>
                <div className="h-3 bg-muted/50 rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${hook.effectiveness}%` }} /></div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2"><span className="text-cyan-400">🎯</span>PILARES DE CONTENIDO</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={analysisData.contentPillars}>
                <PolarGrid stroke={isDark ? "#334155" : "#e2e8f0"} />
                <PolarAngleAxis dataKey="pillar" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} />
                <Radar name="Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2"><span className="text-amber-400">⏰</span>MEJORES HORARIOS</h3>
          <div className="space-y-3">
            {analysisData.bestTimes.map((t) => (
              <div key={t.day} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-foreground font-medium">{t.day}</span>
                <div className="flex items-center gap-4"><span className="text-muted-foreground">{t.hour}:00</span><span className={`font-bold ${getScoreColor(t.engagement * 15)}`}>{t.engagement}%</span></div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6 mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><span className="text-emerald-500">#</span>HASHTAGS RECOMENDADOS</h3>
        <div className="flex flex-wrap gap-2">
          {analysisData.winningFormula.hashtags.map((tag) => (<span key={tag} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">#{tag}</span>))}
          {["InmobiliariaColombia", "LujoMedellin", "InversionSegura", "CasaNueva"].map((tag) => (<span key={tag} className="px-4 py-2 bg-muted text-muted-foreground rounded-full text-sm">#{tag}</span>))}
        </div>
      </GlassCard>

      <section className="pt-6 border-t border-border">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4"><span><strong className="text-foreground">{analysisData.summary.totalPostsAnalyzed}</strong> posts</span><span><strong className="text-emerald-500">{analysisData.summary.avgEngagementRate}%</strong> engagement prom</span><span>Periodo: <strong className="text-foreground">{analysisData.periodDays} dias</strong></span></div>
          <span>Actualizado: {new Date().toLocaleTimeString("es-CO")}</span>
        </div>
      </section>
    </div>
  );
}

export default function ContentEngineeringPage() {
  return (<Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><div className="text-center"><div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-muted-foreground">Cargando...</p></div></div>}><ContentEngineeringContent /></Suspense>);
}
