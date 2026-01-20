"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Language = "en" | "es" | "pt";

interface Translations {
  [key: string]: {
    en: string;
    es: string;
    pt: string;
  };
}

export const translations: Translations = {
  // Navigation
  "nav.overview": { en: "Overview", es: "Resumen", pt: "Visão Geral" },
  "nav.dashboard": { en: "Dashboard", es: "Panel", pt: "Painel" },
  "nav.commandCenter": { en: "Command Center", es: "Centro de Comando", pt: "Centro de Comando" },
  "nav.intelligenceModules": { en: "Intelligence Modules", es: "Módulos de Inteligencia", pt: "Módulos de Inteligência" },
  "nav.commercialIntent": { en: "Commercial Intent", es: "Intención Comercial", pt: "Intenção Comercial" },
  "nav.resonanceAudit": { en: "Resonance Audit", es: "Auditoría de Resonancia", pt: "Auditoria de Ressonância" },
  "nav.brandVoice": { en: "Brand Voice", es: "Voz de Marca", pt: "Voz da Marca" },
  "nav.contentEngineering": { en: "Content Engineering", es: "Ingeniería de Contenido", pt: "Engenharia de Conteúdo" },
  "nav.audienceSentiment": { en: "Audience Sentiment", es: "Sentimiento de Audiencia", pt: "Sentimento do Público" },
  "nav.dataAnalysis": { en: "Data & Analysis", es: "Datos y Análisis", pt: "Dados e Análise" },
  "nav.competitors": { en: "Competitors", es: "Competidores", pt: "Concorrentes" },
  "nav.insights": { en: "Insights", es: "Perspectivas", pt: "Insights" },
  "nav.posts": { en: "Posts", es: "Publicaciones", pt: "Publicações" },
  "nav.configuration": { en: "Configuration", es: "Configuración", pt: "Configuração" },
  "nav.markets": { en: "Markets", es: "Mercados", pt: "Mercados" },
  "nav.jobs": { en: "Jobs", es: "Trabajos", pt: "Trabalhos" },
  "nav.platforms": { en: "Platforms", es: "Plataformas", pt: "Plataformas" },
  "nav.projects": { en: "Projects", es: "Proyectos", pt: "Projetos" },
  "nav.profile": { en: "Profile", es: "Perfil", pt: "Perfil" },
  "nav.settings": { en: "Settings", es: "Ajustes", pt: "Configurações" },
  
  // Dashboard
  "dashboard.title": { en: "Dashboard", es: "Panel de Control", pt: "Painel de Controle" },
  "dashboard.subtitle": { en: "Real Estate Social Media Intelligence", es: "Inteligencia de Redes Sociales Inmobiliarias", pt: "Inteligência de Mídia Social Imobiliária" },
  "dashboard.accountsTracked": { en: "Accounts Tracked", es: "Cuentas Rastreadas", pt: "Contas Rastreadas" },
  "dashboard.totalFollowers": { en: "Total Followers", es: "Seguidores Totales", pt: "Total de Seguidores" },
  "dashboard.posts7days": { en: "Posts (7 days)", es: "Publicaciones (7 días)", pt: "Publicações (7 dias)" },
  "dashboard.avgEngagement": { en: "Avg Engagement", es: "Compromiso Promedio", pt: "Engajamento Médio" },
  "dashboard.totalLikes": { en: "Total Likes", es: "Total de Me Gusta", pt: "Total de Curtidas" },
  "dashboard.totalComments": { en: "Total Comments", es: "Total de Comentarios", pt: "Total de Comentários" },
  "dashboard.totalViews": { en: "Total Views", es: "Vistas Totales", pt: "Total de Visualizações" },
  "dashboard.competitorRankings": { en: "Competitor Rankings", es: "Clasificación de Competidores", pt: "Ranking de Concorrentes" },
  "dashboard.last7days": { en: "Last 7 days", es: "Últimos 7 días", pt: "Últimos 7 dias" },
  "dashboard.allMarkets": { en: "All Markets", es: "Todos los Mercados", pt: "Todos os Mercados" },
  "dashboard.allPlatforms": { en: "All Platforms", es: "Todas las Plataformas", pt: "Todas as Plataformas" },
  "dashboard.activeCompetitors": { en: "Active competitor accounts", es: "Cuentas de competidores activos", pt: "Contas de concorrentes ativos" },
  "dashboard.combinedAudience": { en: "Combined audience", es: "Audiencia combinada", pt: "Audiência combinada" },
  "dashboard.recentContent": { en: "Recent content published", es: "Contenido reciente publicado", pt: "Conteúdo recente publicado" },
  "dashboard.likesComments": { en: "Likes + comments / followers", es: "Me gusta + comentarios / seguidores", pt: "Curtidas + comentários / seguidores" },
  
  // Settings
  "settings.title": { en: "Settings", es: "Configuración", pt: "Configurações" },
  "settings.subtitle": { en: "Configure your social listening platform", es: "Configura tu plataforma de escucha social", pt: "Configure sua plataforma de escuta social" },
  "settings.language": { en: "Language", es: "Idioma", pt: "Idioma" },
  "settings.languageDescription": { en: "Select your preferred language", es: "Selecciona tu idioma preferido", pt: "Selecione seu idioma preferido" },
  "settings.theme": { en: "Theme", es: "Tema", pt: "Tema" },
  "settings.themeDescription": { en: "Choose light or dark mode", es: "Elige modo claro u oscuro", pt: "Escolha modo claro ou escuro" },
  "settings.lightMode": { en: "Light Mode", es: "Modo Claro", pt: "Modo Claro" },
  "settings.darkMode": { en: "Dark Mode", es: "Modo Oscuro", pt: "Modo Escuro" },
  "settings.apiConfiguration": { en: "API Configuration", es: "Configuración de API", pt: "Configuração de API" },
  "settings.scrapingSchedule": { en: "Scraping Schedule", es: "Programación de Scraping", pt: "Agenda­mento de Scraping" },
  "settings.dataRetention": { en: "Data Retention", es: "Retención de Datos", pt: "Retenção de Dados" },
  "settings.dangerZone": { en: "Danger Zone", es: "Zona de Peligro", pt: "Zona de Perigo" },
  
  // Common
  "common.save": { en: "Save", es: "Guardar", pt: "Salvar" },
  "common.cancel": { en: "Cancel", es: "Cancelar", pt: "Cancelar" },
  "common.delete": { en: "Delete", es: "Eliminar", pt: "Excluir" },
  "common.edit": { en: "Edit", es: "Editar", pt: "Editar" },
  "common.add": { en: "Add", es: "Añadir", pt: "Adicionar" },
  "common.search": { en: "Search", es: "Buscar", pt: "Pesquisar" },
  "common.loading": { en: "Loading...", es: "Cargando...", pt: "Carregando..." },
  "common.noData": { en: "No data available", es: "No hay datos disponibles", pt: "Nenhum dado disponível" },
  
  // Sidebar footer
  "sidebar.realEstateIntelligence": { en: "Real Estate Intelligence", es: "Inteligencia Inmobiliaria", pt: "Inteligência Imobiliária" },
  "sidebar.panamaCityMarket": { en: "Panama City Market", es: "Mercado de Ciudad de Panamá", pt: "Mercado da Cidade do Panamá" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("language") as Language | null;
    if (stored && ["en", "es", "pt"].includes(stored)) {
      setLanguage(stored);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("language", language);
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language] || translation.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
