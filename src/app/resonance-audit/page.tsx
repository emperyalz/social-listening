"use client";

import { Suspense, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DEMO_AUDIT_DATA = {
  summary: { overallAlignmentScore: 78, messagingMatchScore: 82, alignedConcepts: 12, alignmentErrors: 3, alignmentWarnings: 5, totalPostsAnalyzed: 156, totalCommentsAnalyzed: 4892 },
  hexGrid: [
    { concept: "Lujo", inStrategy: true, captionPresence: 45, commentPresence: 38, status: "aligned" },
    { concept: "Inversion", inStrategy: true, captionPresence: 52, commentPresence: 61, status: "aligned" },
    { concept: "Ubicacion", inStrategy: true, captionPresence: 67, commentPresence: 89, status: "aligned" },
    { concept: "Calidad", inStrategy: true, captionPresence: 41, commentPresence: 32, status: "aligned" },
    { concept: "Modernidad", inStrategy: true, captionPresence: 38, commentPresence: 28, status: "warning" },
    { concept: "Sostenibilidad", inStrategy: true, captionPresence: 12, commentPresence: 8, status: "error" },
    { concept: "Precio", inStrategy: false, captionPresence: 8, commentPresence: 124, status: "warning" },
  ],
  segmentGapAnalysis: [
    { segment: "Inversionistas", isTargeted: true, presence: 234, status: "on-target" },
    { segment: "Familias Jovenes", isTargeted: true, presence: 189, status: "on-target" },
    { segment: "Profesionales", isTargeted: true, presence: 156, status: "on-target" },
    { segment: "Extranjeros", isTargeted: true, presence: 67, status: "under-target" },
    { segment: "Jubilados", isTargeted: false, presence: 98, status: "over-performing" },
  ],
  contentThemes: [
    { theme: "Proyectos", score: 156, percentage: 32 },
    { theme: "Lifestyle", score: 98, percentage: 20 },
    { theme: "Ubicacion", score: 87, percentage: 18 },
    { theme: "Financiero", score: 78, percentage: 16 },
    { theme: "Comunidad", score: 67, percentage: 14 },
  ],
  alignmentIssues: [
    { type: "Gap", concept: "Sostenibilidad", message: "Tu estrategia menciona sostenibilidad pero solo 2% de tu contenido lo refleja.", severity: "high" },
    { type: "No Estrategico", concept: "Precio", message: "Alta mencion de precio en comentarios pero no esta en tu estrategia.", severity: "medium" },
  ],
  periodDays: 30,
};

const DEMO_TREND_DATA = [
  { date: "2025-12-26", alignmentScore: 76 }, { date: "2025-12-27", alignmentScore: 78 },
  { date: "2025-12-28", alignmentScore: 79 }, { date: "2025-12-30", alignmentScore: 80 },
  { date: "2026-01-02", alignmentScore: 78 }, { date: "2026-01-04", alignmentScore: 82 },
];

const STATUS_COLORS = { aligned: "#10b981", error: "#ef4444", warning: "#f59e0b" };
const SEGMENT_STATUS_COLORS = { "on-target": "#10b981", "under-target": "#ef4444", "over-performing": "#f59e0b" };

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border shadow-xl bg-card ${className}`} style={{ backdropFilter: "blur(12px)" }}>
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: isDark ? "radial-gradient(ellipse at top left, rgba(239, 68, 68, 0.1) 0%, transparent 50%)" : "radial-gradient(ellipse at top left, rgba(239, 68, 68, 0.08) 0%, transparent 50%)" }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function ResonanceAuditContent() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const auditData = DEMO_AUDIT_DATA;
  const trendData = DEMO_TREND_DATA;
  const getScoreColor = (score: number) => score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500";

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2"><div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" /><span className="text-red-400 text-sm font-medium">Analisis de Resonancia Activo</span></div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">Auditoria de Resonancia</h1>
        <p className="text-muted-foreground mt-1">Estrategia vs Realidad - Mide tu alineacion de marca</p>
      </div>

      <GlassCard className="p-8 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2"><span className="text-3xl">🎯</span><span className="text-red-400 text-sm font-semibold uppercase tracking-wider">Alineacion Estrategia-Realidad</span></div>
            <div className={`text-6xl font-bold ${getScoreColor(auditData.summary.overallAlignmentScore)} mb-2`}>{auditData.summary.overallAlignmentScore}%</div>
            <p className="text-muted-foreground text-sm mb-6">Que tan bien tu contenido coincide con tu estrategia</p>
            <div className="grid grid-cols-4 gap-6">
              <div><span className="text-muted-foreground block text-sm">Match Mensajes</span><span className={`font-bold text-xl ${getScoreColor(auditData.summary.messagingMatchScore)}`}>{auditData.summary.messagingMatchScore}%</span></div>
              <div><span className="text-muted-foreground block text-sm">Alineados</span><span className="font-bold text-xl text-emerald-500">{auditData.summary.alignedConcepts}</span></div>
              <div><span className="text-muted-foreground block text-sm">Errores</span><span className="font-bold text-xl text-red-500">{auditData.summary.alignmentErrors}</span></div>
              <div><span className="text-muted-foreground block text-sm">Advertencias</span><span className="font-bold text-xl text-amber-500">{auditData.summary.alignmentWarnings}</span></div>
            </div>
          </div>
          <div className="w-32 h-32 rounded-full border-4 border-border flex items-center justify-center"><span className="text-4xl">🛡️</span></div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2"><span className="text-red-400">⬢</span>GRID DE ESTRATEGIA</h3>
          <div className="grid grid-cols-3 gap-4">
            {auditData.hexGrid.map((item) => (
              <div key={item.concept} className={`p-4 rounded-xl border-2 transition-all ${item.status === 'aligned' ? 'border-emerald-500/50 bg-emerald-500/10' : item.status === 'error' ? 'border-red-500/50 bg-red-500/10' : 'border-amber-500/50 bg-amber-500/10'}`}>
                <div className="text-center">
                  <span className="text-2xl mb-2 block">{item.status === 'aligned' ? '✅' : item.status === 'error' ? '❌' : '⚠️'}</span>
                  <span className="text-foreground font-medium block mb-1">{item.concept}</span>
                  <div className="text-xs text-muted-foreground"><span>Cap: {item.captionPresence}</span> | <span>Com: {item.commentPresence}</span></div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2"><span className="text-amber-400">🎯</span>ANALISIS DE GAPS POR SEGMENTO</h3>
          <div className="space-y-4">
            {auditData.segmentGapAnalysis.map((seg) => (
              <div key={seg.segment}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">{seg.isTargeted && <span className="text-xs bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded">OBJETIVO</span>}<span className="text-foreground font-medium">{seg.segment}</span></div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${seg.status === 'on-target' ? 'bg-emerald-500/20 text-emerald-500' : seg.status === 'under-target' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>{seg.status === 'on-target' ? 'EN OBJETIVO' : seg.status === 'under-target' ? 'BAJO' : 'SOBRE'}</span>
                    <span className="text-muted-foreground text-sm">{seg.presence}</span>
                  </div>
                </div>
                <div className="h-3 bg-muted/50 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.max((seg.presence / 234) * 100, 5)}%`, backgroundColor: SEGMENT_STATUS_COLORS[seg.status as keyof typeof SEGMENT_STATUS_COLORS] }} /></div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><span className="text-red-400">⚠️</span>PROBLEMAS DE ALINEACION</h3>
          <div className="space-y-3">
            {auditData.alignmentIssues.map((issue, i) => (
              <div key={i} className={`p-4 rounded-xl border ${issue.severity === 'high' ? 'border-red-500/30 bg-red-500/10' : 'border-amber-500/30 bg-amber-500/10'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-lg">{issue.severity === 'high' ? '🔴' : '🟡'}</span>
                  <div><div className="flex items-center gap-2 mb-1"><span className="text-foreground font-medium">{issue.concept}</span><span className="text-xs text-muted-foreground">{issue.type}</span></div><p className="text-muted-foreground text-sm">{issue.message}</p></div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><span className="text-emerald-500">📈</span>TENDENCIA DE ALINEACION</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                <XAxis dataKey="date" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} tickFormatter={(v) => new Date(v).toLocaleDateString("es-CO", { month: "short", day: "numeric" })} />
                <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)", borderRadius: "12px", color: isDark ? "#fff" : "#1e293b" }} />
                <Line type="monotone" dataKey="alignmentScore" stroke="#10b981" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <section className="pt-6 border-t border-border">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4"><span><strong className="text-foreground">{auditData.summary.totalPostsAnalyzed}</strong> posts</span><span><strong className="text-foreground">{auditData.summary.totalCommentsAnalyzed}</strong> comentarios</span><span>Periodo: <strong className="text-foreground">{auditData.periodDays} dias</strong></span></div>
          <span>Actualizado: {new Date().toLocaleTimeString("es-CO")}</span>
        </div>
      </section>
    </div>
  );
}

export default function ResonanceAuditPage() {
  return (<Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><div className="text-center"><div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-muted-foreground">Cargando...</p></div></div>}><ResonanceAuditContent /></Suspense>);
}