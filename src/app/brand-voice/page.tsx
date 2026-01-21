"use client";

import { Suspense, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const DEMO_VOICE_DATA = {
  summary: { overallConsistency: 84, toneConsistency: 86, formalityConsistency: 81, dominantTone: "Profesional", formalityLevel: "Semi-Formal", totalPostsAnalyzed: 156, totalCommentsAnalyzed: 4892, avgSentenceLength: 12 },
  brandVoice: {
    toneScores: [
      { trait: "Profesional", score: 145, emoji: "💼" }, { trait: "Amigable", score: 98, emoji: "😊" },
      { trait: "Lujoso", score: 87, emoji: "✨" }, { trait: "Confiable", score: 76, emoji: "🛡️" },
      { trait: "Inspirador", score: 65, emoji: "🌟" }, { trait: "Innovador", score: 54, emoji: "🚀" },
    ],
    formalityScore: 68, formalityLevel: "Semi-Formal",
    personalityScores: [
      { trait: "Confianza", score: 134, emoji: "🛡️" }, { trait: "Elegancia", score: 98, emoji: "👔" },
      { trait: "Cercania", score: 87, emoji: "🤝" }, { trait: "Expertise", score: 76, emoji: "📚" },
      { trait: "Modernidad", score: 65, emoji: "💡" },
    ],
    emojiUsage: [
      { category: "Hogar", count: 156, emojis: ["🏠", "🏡", "🏢"] },
      { category: "Lujo", count: 98, emojis: ["✨", "💎", "🌟"] },
      { category: "Ubicacion", count: 87, emojis: ["📍", "🗺️", "🌴"] },
    ],
  },
  audienceVoice: {
    toneScores: [
      { trait: "Profesional", score: 112, emoji: "💼" }, { trait: "Amigable", score: 134, emoji: "😊" },
      { trait: "Lujoso", score: 67, emoji: "✨" }, { trait: "Confiable", score: 89, emoji: "🛡️" },
      { trait: "Inspirador", score: 78, emoji: "🌟" }, { trait: "Innovador", score: 45, emoji: "🚀" },
    ],
  },
  targetVoice: { primaryTone: "Profesional", secondaryTone: "Confiable", formalityTarget: 65, personalityFocus: ["Confianza", "Elegancia", "Expertise", "Cercania"] },
  voiceAlignment: [
    { trait: "Profesional", emoji: "💼", brandScore: 145, audienceScore: 112, alignment: "aligned" },
    { trait: "Amigable", emoji: "😊", brandScore: 98, audienceScore: 134, alignment: "audience-only" },
    { trait: "Lujoso", emoji: "✨", brandScore: 87, audienceScore: 67, alignment: "brand-only" },
    { trait: "Confiable", emoji: "🛡️", brandScore: 76, audienceScore: 89, alignment: "aligned" },
  ],
  platformBreakdown: [
    { platform: "instagram", dominantTone: "Profesional", formalityLevel: "Semi-Formal", avgSentenceLength: 11 },
    { platform: "tiktok", dominantTone: "Amigable", formalityLevel: "Casual", avgSentenceLength: 8 },
    { platform: "youtube", dominantTone: "Profesional", formalityLevel: "Formal", avgSentenceLength: 15 },
  ],
  recommendations: [
    { type: "Ajuste de Tono", message: "Tu audiencia responde mejor al tono Amigable. Considera aumentar este tono en Instagram.", priority: "medium" },
    { type: "Consistencia", message: "Excelente consistencia en tono profesional. Mantener este nivel.", priority: "low" },
    { type: "Oportunidad", message: "El tono Lujoso aparece mas en tu contenido que en respuestas. Considera balancear.", priority: "medium" },
  ],
  periodDays: 30,
};

const TONE_COLORS: Record<string, string> = { Profesional: "#6366f1", Amigable: "#f59e0b", Lujoso: "#8b5cf6", Confiable: "#10b981", Inspirador: "#ec4899", Innovador: "#06b6d4" };
const PERSONALITY_COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ec4899", "#06b6d4"];
const PLATFORM_EMOJI: Record<string, string> = { instagram: "📸", tiktok: "🎵", youtube: "📺" };

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border shadow-xl bg-card ${className}`} style={{ backdropFilter: "blur(12px)" }}>
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: isDark ? "radial-gradient(ellipse at top left, rgba(139, 92, 246, 0.1) 0%, transparent 50%)" : "radial-gradient(ellipse at top left, rgba(139, 92, 246, 0.08) 0%, transparent 50%)" }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function BrandVoiceContent() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const voiceData = DEMO_VOICE_DATA;
  const getScoreColor = (score: number) => score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500";

  const radarData = voiceData.brandVoice.toneScores.map((brand) => {
    const audience = voiceData.audienceVoice.toneScores.find((a) => a.trait === brand.trait);
    return { trait: brand.trait, brand: brand.score, audience: audience?.score || 0 };
  });

  const pieData = voiceData.brandVoice.personalityScores.map((s) => ({ name: s.trait, value: s.score }));

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2"><div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" /><span className="text-violet-400 text-sm font-medium">Analisis de Voz Activo</span></div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Alineacion de Voz de Marca</h1>
        <p className="text-muted-foreground mt-1">Analisis de Tono, Estilo y Consistencia</p>
      </div>

      <GlassCard className="p-8 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2"><span className="text-3xl">🎤</span><span className="text-violet-400 text-sm font-semibold uppercase tracking-wider">Consistencia de Voz</span></div>
            <div className={`text-6xl font-bold ${getScoreColor(voiceData.summary.overallConsistency)} mb-2`}>{voiceData.summary.overallConsistency}%</div>
            <p className="text-muted-foreground text-sm mb-6">Que tan consistente es tu contenido con tu voz de marca</p>
            <div className="grid grid-cols-4 gap-6">
              <div><span className="text-muted-foreground block text-sm">Match Tono</span><span className={`font-bold text-xl ${getScoreColor(voiceData.summary.toneConsistency)}`}>{voiceData.summary.toneConsistency}%</span></div>
              <div><span className="text-muted-foreground block text-sm">Match Formalidad</span><span className={`font-bold text-xl ${getScoreColor(voiceData.summary.formalityConsistency)}`}>{voiceData.summary.formalityConsistency}%</span></div>
              <div><span className="text-muted-foreground block text-sm">Tono Dominante</span><span className="font-bold text-xl text-violet-400">{voiceData.summary.dominantTone}</span></div>
              <div><span className="text-muted-foreground block text-sm">Formalidad</span><span className="font-bold text-xl text-cyan-400">{voiceData.summary.formalityLevel}</span></div>
            </div>
          </div>
          <div className="w-32 h-32 rounded-full border-4 border-border flex items-center justify-center"><span className="text-4xl">🎯</span></div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><span className="text-violet-400">📊</span>ANALISIS DE TONO</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke={isDark ? "#334155" : "#e2e8f0"} />
                <PolarAngleAxis dataKey="trait" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} />
                <Radar name="Tu Contenido" dataKey="brand" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={2} />
                <Radar name="Audiencia" dataKey="audience" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                <Legend />
                <Tooltip contentStyle={{ backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)", borderRadius: "12px", color: isDark ? "#fff" : "#1e293b" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><span className="text-amber-400">🎨</span>DESGLOSE DE TONO</h3>
          <div className="space-y-4">
            {voiceData.brandVoice.toneScores.slice(0, 6).map((tone) => (
              <div key={tone.trait}>
                <div className="flex items-center justify-between mb-1"><div className="flex items-center gap-2"><span>{tone.emoji}</span><span className="text-foreground font-medium">{tone.trait}</span></div><span className="text-muted-foreground text-sm">{tone.score} senales</span></div>
                <div className="h-3 bg-muted/50 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.max((tone.score / 145) * 100, 5)}%`, backgroundColor: TONE_COLORS[tone.trait] || "#6366f1" }} /></div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><span className="text-cyan-400">📏</span>NIVEL DE FORMALIDAD</h3>
          <div className="relative h-8 bg-gradient-to-r from-pink-500 via-yellow-500 via-slate-500 via-blue-500 to-indigo-500 rounded-full mb-4">
            <div className="absolute top-0 h-full w-1 bg-white/50" style={{ left: `${voiceData.targetVoice.formalityTarget}%` }}><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">Objetivo</div></div>
            <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-4 border-background shadow-lg" style={{ left: `calc(${voiceData.brandVoice.formalityScore}% - 12px)` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mb-6"><span>Muy Casual</span><span>Casual</span><span>Neutral</span><span>Formal</span><span>Muy Formal</span></div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"><div><span className="text-muted-foreground text-sm block">Nivel Actual</span><span className="text-foreground font-bold text-xl">{voiceData.brandVoice.formalityLevel}</span></div><div className="text-right"><span className="text-muted-foreground text-sm block">Score</span><span className="text-cyan-400 font-bold text-xl">{voiceData.brandVoice.formalityScore}/100</span></div></div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><span className="text-pink-400">🎭</span>MIX DE PERSONALIDAD</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">{pieData.map((_, i) => <Cell key={`cell-${i}`} fill={PERSONALITY_COLORS[i % PERSONALITY_COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)", borderRadius: "12px", color: isDark ? "#fff" : "#1e293b" }} /></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">{voiceData.brandVoice.personalityScores.slice(0, 5).map((s, i) => (<div key={s.trait} className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded" style={{ backgroundColor: PERSONALITY_COLORS[i % PERSONALITY_COLORS.length] }} /><span className="text-muted-foreground truncate">{s.trait}</span></div>))}</div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><span className="text-emerald-500">🔄</span>ALINEACION VOZ MARCA-AUDIENCIA</h3>
          <div className="space-y-3">
            {voiceData.voiceAlignment.map((item) => (
              <div key={item.trait} className={`p-3 rounded-xl border ${item.alignment === "aligned" ? "border-emerald-500/30 bg-emerald-500/10" : item.alignment === "brand-only" ? "border-amber-500/30 bg-amber-500/10" : "border-cyan-500/30 bg-cyan-500/10"}`}>
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span>{item.emoji}</span><span className="text-foreground font-medium">{item.trait}</span></div><span className={`text-xs px-2 py-0.5 rounded ${item.alignment === "aligned" ? "bg-emerald-500/20 text-emerald-500" : item.alignment === "brand-only" ? "bg-amber-500/20 text-amber-500" : "bg-cyan-500/20 text-cyan-500"}`}>{item.alignment === "aligned" ? "Alineado" : item.alignment === "brand-only" ? "Solo Marca" : "Solo Audiencia"}</span></div>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm"><div><span className="text-muted-foreground">Tu: </span><span className="text-violet-400">{item.brandScore}</span></div><div><span className="text-muted-foreground">Audiencia: </span><span className="text-cyan-400">{item.audienceScore}</span></div></div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><span className="text-indigo-400">📱</span>VOZ POR PLATAFORMA</h3>
          <div className="space-y-4">
            {voiceData.platformBreakdown.map((p) => (
              <div key={p.platform} className="p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3"><span className="text-2xl">{PLATFORM_EMOJI[p.platform]}</span><span className="text-foreground font-medium capitalize">{p.platform}</span></div>
                <div className="grid grid-cols-3 gap-4 text-sm"><div><span className="text-muted-foreground block">Tono</span><span className="text-violet-400 font-medium">{p.dominantTone}</span></div><div><span className="text-muted-foreground block">Formalidad</span><span className="text-cyan-400 font-medium">{p.formalityLevel}</span></div><div><span className="text-muted-foreground block">Palabras/Oracion</span><span className="text-emerald-500 font-medium">{p.avgSentenceLength}</span></div></div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6 mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><span className="text-amber-400">💡</span>RECOMENDACIONES DE VOZ</h3>
        <div className="space-y-3">
          {voiceData.recommendations.map((rec, i) => (
            <div key={i} className={`p-4 rounded-xl border ${rec.priority === "high" ? "border-red-500/30 bg-red-500/10" : rec.priority === "medium" ? "border-amber-500/30 bg-amber-500/10" : "border-border bg-muted/30"}`}>
              <div className="flex items-start gap-3"><span className="text-lg">{rec.priority === "high" ? "🔴" : rec.priority === "medium" ? "🟡" : "🟢"}</span><div><span className="text-foreground font-medium block mb-1">{rec.type}</span><p className="text-muted-foreground text-sm">{rec.message}</p></div></div>
            </div>
          ))}
        </div>
      </GlassCard>

      <section className="pt-6 border-t border-border">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4"><span><strong className="text-foreground">{voiceData.summary.totalPostsAnalyzed}</strong> posts</span><span><strong className="text-foreground">{voiceData.summary.totalCommentsAnalyzed}</strong> comentarios</span><span>Periodo: <strong className="text-foreground">{voiceData.periodDays} dias</strong></span></div>
          <span>Actualizado: {new Date().toLocaleTimeString("es-CO")}</span>
        </div>
      </section>
    </div>
  );
}

export default function BrandVoicePage() {
  return (<Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><div className="text-center"><div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-muted-foreground">Cargando...</p></div></div>}><BrandVoiceContent /></Suspense>);
}