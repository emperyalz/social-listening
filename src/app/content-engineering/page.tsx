"use client";

import { useTheme } from "@/contexts/ThemeContext";

export default function ContentEngineeringPage() {
  const { theme } = useTheme();

  // Demo data for Grupo Horizonte - Colombian Real Estate
  const winningFormula = {
    hook: "Pregunta provocadora",
    format: "Video corto (30-60s)",
    cta: "Agenda tu visita",
    bestTime: "Martes 7-9 PM",
    avgEngagement: 8.4,
  };

  const formatAnalysis = [
    { format: "Videos Cortos", engagement: 9.2, reach: 45000, conversion: 3.8 },
    { format: "Carruseles", engagement: 7.8, reach: 32000, conversion: 2.9 },
    { format: "Stories", engagement: 6.5, reach: 28000, conversion: 1.2 },
    { format: "Posts Estáticos", engagement: 4.2, reach: 18000, conversion: 1.8 },
    { format: "Reels", engagement: 8.9, reach: 52000, conversion: 2.4 },
    { format: "Lives", engagement: 5.1, reach: 8000, conversion: 4.5 },
  ];

  const hookEffectiveness = [
    { hook: "¿Sabías que...?", effectiveness: 92, uses: 24, trend: "up" },
    { hook: "El secreto de...", effectiveness: 87, uses: 18, trend: "up" },
    { hook: "Descubre cómo...", effectiveness: 78, uses: 31, trend: "stable" },
    { hook: "3 razones para...", effectiveness: 74, uses: 15, trend: "up" },
    { hook: "La verdad sobre...", effectiveness: 71, uses: 12, trend: "down" },
    { hook: "No compres sin...", effectiveness: 68, uses: 9, trend: "stable" },
  ];

  const ctaPerformance = [
    { cta: "Agenda tu visita", clicks: 2840, conversion: 4.2 },
    { cta: "Conoce más", clicks: 1920, conversion: 2.1 },
    { cta: "Escríbenos", clicks: 1650, conversion: 3.5 },
    { cta: "Ver proyecto", clicks: 1420, conversion: 1.8 },
    { cta: "Cotiza ahora", clicks: 980, conversion: 5.1 },
  ];

  const contentCalendar = [
    { day: "Lunes", bestFormat: "Carrusel educativo", bestHook: "¿Sabías que...?" },
    { day: "Martes", bestFormat: "Video de proyecto", bestHook: "Descubre cómo..." },
    { day: "Miércoles", bestFormat: "Story interactivo", bestHook: "El secreto de..." },
    { day: "Jueves", bestFormat: "Testimonial", bestHook: "La historia de..." },
    { day: "Viernes", bestFormat: "Reel dinámico", bestHook: "3 razones para..." },
    { day: "Sábado", bestFormat: "Tour virtual", bestHook: "Conoce..." },
    { day: "Domingo", bestFormat: "Post inspiracional", bestHook: "Tu sueño de..." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Ingeniería de Contenido</h1>
          <p className="text-muted-foreground">
            Optimización de formatos, hooks y CTAs - Grupo Horizonte
          </p>
        </div>

        {/* Winning Formula Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Fórmula Ganadora</h2>
              <p className="text-blue-100 text-sm">Combinación con mejor rendimiento este mes</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-blue-100 text-xs mb-1">Hook</p>
              <p className="font-semibold">{winningFormula.hook}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-blue-100 text-xs mb-1">Formato</p>
              <p className="font-semibold">{winningFormula.format}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-blue-100 text-xs mb-1">CTA</p>
              <p className="font-semibold">{winningFormula.cta}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-blue-100 text-xs mb-1">Mejor Hora</p>
              <p className="font-semibold">{winningFormula.bestTime}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-blue-100 text-xs mb-1">Engagement Promedio</p>
              <p className="font-semibold text-2xl">{winningFormula.avgEngagement}%</p>
            </div>
          </div>
        </div>

        {/* Format Analysis */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Análisis de Formatos</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Formato</th>
                  <th className="text-center py-3 px-4 font-medium">Engagement</th>
                  <th className="text-center py-3 px-4 font-medium">Alcance</th>
                  <th className="text-center py-3 px-4 font-medium">Conversión</th>
                  <th className="text-left py-3 px-4 font-medium">Rendimiento</th>
                </tr>
              </thead>
              <tbody>
                {formatAnalysis.map((item, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{item.format}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold ${
                        item.engagement >= 8 ? 'bg-green-500/10 text-green-500' :
                        item.engagement >= 6 ? 'bg-blue-500/10 text-blue-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {item.engagement}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-muted-foreground">
                      {(item.reach / 1000).toFixed(0)}K
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold">{item.conversion}%</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            item.engagement >= 8 ? 'bg-green-500' :
                            item.engagement >= 6 ? 'bg-blue-500' :
                            'bg-amber-500'
                          }`}
                          style={{ width: `${(item.engagement / 10) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Hook Effectiveness */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Efectividad de Hooks</h2>
            <div className="space-y-4">
              {hookEffectiveness.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.hook}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{item.uses} usos</span>
                        {item.trend === 'up' && (
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {item.trend === 'down' && (
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {item.trend === 'stable' && (
                          <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            item.effectiveness >= 85 ? 'bg-green-500' :
                            item.effectiveness >= 70 ? 'bg-blue-500' :
                            'bg-amber-500'
                          }`}
                          style={{ width: `${item.effectiveness}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold w-12 text-right">{item.effectiveness}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Performance */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Rendimiento de CTAs</h2>
            <div className="space-y-4">
              {ctaPerformance.map((item, index) => (
                <div key={index} className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{item.cta}</span>
                    <span className={`text-sm font-bold ${
                      item.conversion >= 4 ? 'text-green-500' :
                      item.conversion >= 2.5 ? 'text-blue-500' :
                      'text-amber-500'
                    }`}>
                      {item.conversion}% conv.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    <span>{item.clicks.toLocaleString()} clicks este mes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Calendar Recommendations */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Calendario de Contenido Optimizado</h2>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {contentCalendar.map((day, index) => (
              <div 
                key={index} 
                className={`rounded-lg p-4 ${
                  day.day === 'Martes' || day.day === 'Viernes' 
                    ? 'bg-blue-500/10 border border-blue-500/30' 
                    : 'bg-muted/30'
                }`}
              >
                <p className={`text-sm font-semibold mb-2 ${
                  day.day === 'Martes' || day.day === 'Viernes' 
                    ? 'text-blue-500' 
                    : ''
                }`}>
                  {day.day}
                </p>
                <p className="text-xs text-muted-foreground mb-1">Formato:</p>
                <p className="text-sm font-medium mb-2">{day.bestFormat}</p>
                <p className="text-xs text-muted-foreground mb-1">Hook:</p>
                <p className="text-sm">{day.bestHook}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            * Martes y Viernes destacados como días de mayor engagement histórico
          </p>
        </div>

        {/* Quick Tips */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recomendaciones de Optimización</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-semibold text-green-500">Mantener</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Videos cortos con hooks de pregunta. Están generando el mejor engagement (9.2%)
              </p>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-semibold text-amber-500">Optimizar</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Posts estáticos necesitan mejor copy. Considerar migrar a carruseles
              </p>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="font-semibold text-blue-500">Experimentar</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Lives tienen alta conversión (4.5%). Probar con mayor frecuencia semanal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
