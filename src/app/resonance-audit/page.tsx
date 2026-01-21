"use client";

import { useTheme } from "@/contexts/ThemeContext";

export default function ResonanceAuditPage() {
  const { theme } = useTheme();

  // Demo data for Grupo Horizonte - Colombian Real Estate
  const strategyAlignmentScore = 78;
  
  const alignmentGrid = [
    { pillar: "Innovación", content: 85, strategy: 90, gap: -5 },
    { pillar: "Confianza", content: 72, strategy: 85, gap: -13 },
    { pillar: "Sostenibilidad", content: 68, strategy: 75, gap: -7 },
    { pillar: "Comunidad", content: 82, strategy: 80, gap: 2 },
    { pillar: "Calidad", content: 79, strategy: 88, gap: -9 },
  ];

  const segmentAnalysis = [
    { 
      segment: "Familias Jóvenes", 
      resonance: 82, 
      engagement: "Alto",
      topContent: "Tours virtuales de apartamentos",
      recommendation: "Aumentar contenido sobre financiación"
    },
    { 
      segment: "Inversionistas", 
      resonance: 75, 
      engagement: "Medio",
      topContent: "Análisis de valorización",
      recommendation: "Más datos de ROI y rendimientos"
    },
    { 
      segment: "Primera Vivienda", 
      resonance: 88, 
      engagement: "Muy Alto",
      topContent: "Guías de subsidios VIS",
      recommendation: "Continuar educación financiera"
    },
    { 
      segment: "Compradores Premium", 
      resonance: 65, 
      engagement: "Bajo",
      topContent: "Proyectos exclusivos",
      recommendation: "Contenido más aspiracional"
    },
  ];

  const contentResonanceByType = [
    { type: "Videos de Proyectos", score: 86 },
    { type: "Testimoniales", score: 79 },
    { type: "Infografías Financieras", score: 74 },
    { type: "Posts Educativos", score: 71 },
    { type: "Promociones", score: 62 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Auditoría de Resonancia</h1>
          <p className="text-muted-foreground">
            Análisis de alineación entre contenido y estrategia de marca - Grupo Horizonte
          </p>
        </div>

        {/* Main Score Card */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1">Puntuación de Alineación Estratégica</h2>
              <p className="text-sm text-muted-foreground">
                Qué tan bien tu contenido refleja los pilares de marca
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-blue-500">{strategyAlignmentScore}%</div>
              <div className="text-sm text-muted-foreground mt-1">+3% vs mes anterior</div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${strategyAlignmentScore}%` }}
            />
          </div>
          
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>0% - Desalineado</span>
            <span>50% - Parcial</span>
            <span>100% - Alineación Total</span>
          </div>
        </div>

        {/* Alignment Grid */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Matriz de Alineación por Pilar</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Pilar de Marca</th>
                  <th className="text-center py-3 px-4 font-medium">Contenido Actual</th>
                  <th className="text-center py-3 px-4 font-medium">Meta Estratégica</th>
                  <th className="text-center py-3 px-4 font-medium">Brecha</th>
                  <th className="text-left py-3 px-4 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {alignmentGrid.map((item, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{item.pillar}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-12 h-8 bg-blue-500/10 text-blue-500 rounded font-semibold">
                        {item.content}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-12 h-8 bg-muted text-muted-foreground rounded font-semibold">
                        {item.strategy}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-12 h-8 rounded font-semibold ${
                        item.gap >= 0 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {item.gap > 0 ? '+' : ''}{item.gap}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.gap >= 0 ? (
                        <span className="inline-flex items-center gap-1 text-green-500 text-sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Alineado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-500 text-sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Optimizar
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Segment Analysis */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Análisis por Segmento</h2>
            <div className="space-y-4">
              {segmentAnalysis.map((segment, index) => (
                <div key={index} className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{segment.segment}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        segment.engagement === 'Muy Alto' ? 'bg-green-500/10 text-green-500' :
                        segment.engagement === 'Alto' ? 'bg-blue-500/10 text-blue-500' :
                        segment.engagement === 'Medio' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {segment.engagement}
                      </span>
                      <span className="text-lg font-bold text-blue-500">{segment.resonance}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${segment.resonance}%` }}
                    />
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">
                      <span className="font-medium text-foreground">Top contenido:</span> {segment.topContent}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Recomendación:</span> {segment.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Resonance by Type */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Resonancia por Tipo de Contenido</h2>
            <div className="space-y-4">
              {contentResonanceByType.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{item.type}</span>
                    <span className="text-sm font-bold">{item.score}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.score >= 80 ? 'bg-green-500' :
                        item.score >= 70 ? 'bg-blue-500' :
                        item.score >= 60 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Key Insights */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="font-semibold mb-3">Insights Clave</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Los videos de proyectos tienen la mayor resonancia con audiencias
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Las promociones necesitan mejor alineación con valores de marca
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  El segmento de primera vivienda muestra excelente engagement
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recomendaciones de Optimización</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Fortalecer Confianza</h3>
              <p className="text-sm text-muted-foreground">
                Aumentar testimoniales de clientes satisfechos y certificaciones de calidad
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Contenido Sostenible</h3>
              <p className="text-sm text-muted-foreground">
                Destacar prácticas de construcción sostenible y eficiencia energética
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Segmento Premium</h3>
              <p className="text-sm text-muted-foreground">
                Crear contenido exclusivo para compradores de alto valor
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
