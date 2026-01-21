"use client";

import { Suspense, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DEMO_VOICE_DATA = {
  summary: { overallConsistency: 82, toneScore: 85, formalityLevel: "Semi-Formal", dominantPersonality: "Profesional", totalPostsAnalyzed: 156 },
  toneAnalysis: [
    { trait: "Profesional", score: 92 },
    { trait: "Amigable", score: 78 },
    { trait: "Informativo", score: 88 },
    { trait: "Aspiracional", score: 72 },
    { trait: "Confiable", score: 85 },
    { trait: "Innovador", score: 68 },
  ],
  formalityDistribution: [
    { level: "Muy Formal", posts: 12, percentage: 8 },
    { level: "Formal", posts: 45, percentage: 29 },
    { level: "Semi-Formal", posts: 67, percentage: 43 },
    { level: "Casual", posts: 28, percentage: 18 },
    { level: "Muy Casual", posts: 4, percentage: 2 },
  ],
  personalityMix: [
    { personality: "Experto", presence: 78 },
    { personality: "Asesor", presence: 65 },
    { personality: "Visionario", presence: 52 },
    { personality: "Companero", presence: 45 },
  ],
  vocabularyInsights: {
    frequentWords: ["inversion", "lujo", "exclusivo", "ubicacion", "calidad", "diseno", "moderno", "premium"],
    avoidedWords: ["barato", "descuento", "oferta", "economico"],
    brandTerms: ["Grupo Horizonte", "vida en altura", "tu hogar ideal"],
  },
  consistencyIssues: [
    { issue: "Tono inconsistente en stories vs feed", severity: "medium", suggestion: "Mantener tono profesional en ambos formatos" },
    { issue: "Uso excesivo de emojis en algunos posts", severity: "low", suggestion: "Limitar a 2-3 emojis por publicacion" },
  ],
  periodDays: 30,
};

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border shadow-xl bg-card ${className}`} style={{ backdropFilter: "blur(12px)" }}>
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: isDark ? "radial-gradient(ellipse at top left, rgba(251, 146, 60, 0.1) 0%, transparent 50%)" : "radial-gradient(ellipse at top left, rgba(251, 146, 60, 0.08) 0%, transparent 50%)" }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function BrandVoiceContent() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const voiceData = DEMO_VOICE_DATA;
  const getScoreColor = (score: number) => score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500";

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2"><div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" /><span className="text-orange-400 text-sm font-medium">Analisis de Voz Activo</span></div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Voz de Marca</h1>
        <p className="text-muted-foreground mt-1">Analiza la consistencia y personalidad de tu comunicacion</p>
      </div>

      <GlassCard className="p-8 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2"><span className="text-3xl">🎙️</span><span className="text-orange-400 text-sm font-semibold uppercase tracking-wider">Consistencia de Voz</span></div>
            <div className={`text-6xl font-bold ${getScoreColor(voiceData.summary.overallConsistency)} mb-4`}>{voiceData.summary.overallConsistency}%</div>
            <div className="grid grid-cols-4 gap-6">
              <div><span className="text-muted-foreground block text-sm">Tono</span><span className={`font-bold text-xl ${getScoreColor(voiceData.summary.toneScore)}`}>{voiceData.summary.toneScore}%</span></div>
              <div><span className="text-muted-foreground block text-sm">Formalidad</span><span className="text-foreground font-bold text-lg">{voiceData.summary.formalityLevel}</span></div>
              <div><span className="text-muted-foreground block text-sm">Personalidad</span><span className="text-foreground font-bold text-lg">{voiceData.summary.dominantPersonality}</span></div>
              <div><span className="text-muted-foreground block text-sm">Posts</span><span className="text-foreground font-bold text-lg">{voiceData.summary.totalPostsAnalyzed}</span></div>
            </div>
          </div>
          <div className="w-32 h-32 rounded-full border-4 border-orange-500/30 flex items-center justify-center bg-orange-500/10"><span className="text-5xl">🎯</span></div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2"><span className="text-orange-400">📊</span>ANALISIS DE TONO</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={voiceData.toneAnalysis}>
                <PolarGrid stroke={isDark ? "#334155" : "#e2e8f0"} />
                <PolarAngleAxis dataKey="trait" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} />
                <Radar name="Score" dataKey="score" stroke="#fb923c" fill="#fb923c" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2"><span className="text-amber-400">📏</span>NIVELES DE FORMALIDAD</h3>
          <div className="space-y-4">
            {voiceData.formalityDistribution.map((level) => (
              <div key={level.level}>
                <div className="flex items-center justify-between mb-1"><span className="text-foreground font-medium">{level.level}</span><div className="flex items-center gap-2"><span className="text-muted-foreground text-sm">{level.posts} posts</span><span className="text-foreground font-bold">{level.percentage}%</span></div></div>
                <div className="h-3 bg-muted/50 rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500" style={{ width: `${level.percentage}%` }} /></div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2"><span className="text-pink-400">🎭</span>MIX DE PERSONALIDAD</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={voiceData.personalityMix} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                <XAxis type="number" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} domain={[0, 100]} />
                <YAxis type="category" dataKey="personality" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)", borderRadius: "12px", color: isDark ? "#fff" : "#1e293b" }} />
                <Bar dataKey="presence" fill="#ec4899" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><span className="text-emerald-500">📝</span>VOCABULARIO</h3>
          <div className="space-y-4">
            <div><span className="text-muted-foreground text-sm block mb-2">Palabras Frecuentes</span><div className="flex flex-wrap gap-2">{voiceData.vocabularyInsights.frequentWords.map((word) => <span key={word} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">{word}</span>)}</div></div>
            <div><span className="text-muted-foreground text-sm block mb-2">Evitar</span><div className="flex flex-wrap gap-2">{voiceData.vocabularyInsights.avoidedWords.map((word) => <span key={word} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">{word}</span>)}</div></div>
            <div><span className="text-muted-foreground text-sm block mb-2">Terminos de Marca</span><div className="flex flex-wrap gap-2">{voiceData.vocabularyInsights.brandTerms.map((term) => <span key={term} className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">{term}</span>)}</div></div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6 mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><span className="text-red-400">⚠️</span>PROBLEMAS DE CONSISTENCIA</h3>
        <div className="space-y-3">
          {voiceData.consistencyIssues.map((issue, i) => (
            <div key={i} className={`p-4 rounded-xl border ${issue.severity === 'high' ? 'border-red-500/30 bg-red-500/10' : issue.severity === 'medium' ? 'border-amber-500/30 bg-amber-500/10' : 'border-blue-500/30 bg-blue-500/10'}`}>
              <div className="flex items-start gap-3">
                <span className="text-lg">{issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🔵'}</span>
                <div><p className="text-foreground font-medium mb-1">{issue.issue}</p><p className="text-muted-foreground text-sm">💡 {issue.suggestion}</p></div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <section className="pt-6 border-t border-border">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4"><span><strong className="text-foreground">{voiceData.summary.totalPostsAnalyzed}</strong> posts</span><span>Consistencia: <strong className={getScoreColor(voiceData.summary.overallConsistency)}>{voiceData.summary.overallConsistency}%</strong></span><span>Periodo: <strong className="text-foreground">{voiceData.periodDays} dias</strong></span></div>
          <span>Actualizado: {new Date().toLocaleTimeString("es-CO")}</span>
        </div>
      </section>
    </div>
  );
}

export default function BrandVoicePage() {
  return (<Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><div className="text-center"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-muted-foreground">Cargando...</p></div></div>}><BrandVoiceContent /></Suspense>);
}
