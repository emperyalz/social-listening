"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type PlatformId = "instagram" | "tiktok" | "youtube" | "facebook" | "linkedin" | "twitter";

interface PlatformLogo {
  url: string | null;
  name: string;
}

interface Platform {
  platformId: PlatformId;
  displayName: string;
  primaryColor?: string;
  secondaryColor?: string;
  isActive: boolean;
  logos?: { url: string | null; name: string }[];
  selectedLogos?: {
    avatar?: PlatformLogo | null;
    navigation?: PlatformLogo | null;
    filters?: PlatformLogo | null;
    posts?: PlatformLogo | null;
    competitors?: PlatformLogo | null;
    dashboard?: PlatformLogo | null;
  };
}

// Default emoji fallbacks
const platformEmojis: Record<PlatformId, string> = {
  instagram: "📸",
  tiktok: "🎵",
  youtube: "▶️",
  facebook: "👤",
  linkedin: "💼",
  twitter: "🐦",
};

// Default colors
const platformColors: Record<PlatformId, { primary: string; secondary: string }> = {
  instagram: { primary: "#E1306C", secondary: "#833AB4" },
  tiktok: { primary: "#000000", secondary: "#69C9D0" },
  youtube: { primary: "#FF0000", secondary: "#282828" },
  facebook: { primary: "#1877F2", secondary: "#4267B2" },
  linkedin: { primary: "#0A66C2", secondary: "#004182" },
  twitter: { primary: "#000000", secondary: "#1DA1F2" },
};

export type LogoContext = "avatar" | "navigation" | "filters" | "posts" | "competitors" | "dashboard";

/**
 * Hook to access platform logos and colors throughout the app
 */
export function usePlatformLogos() {
  const platforms = useQuery(api.platforms.list);

  /**
   * Get the logo URL for a specific platform and context
   * Returns null if no logo is configured (use emoji fallback)
   */
  const getLogoUrl = (platformId: PlatformId, context: LogoContext): string | null => {
    const platform = platforms?.find(p => p.platformId === platformId);
    if (!platform?.selectedLogos) return null;

    const logo = platform.selectedLogos[context];
    return logo?.url || null;
  };

  /**
   * Get the emoji fallback for a platform
   */
  const getEmoji = (platformId: PlatformId): string => {
    return platformEmojis[platformId] || "📱";
  };

  /**
   * Get platform colors (from DB or defaults)
   */
  const getColors = (platformId: PlatformId) => {
    const platform = platforms?.find(p => p.platformId === platformId);
    return {
      primary: platform?.primaryColor || platformColors[platformId]?.primary || "#666666",
      secondary: platform?.secondaryColor || platformColors[platformId]?.secondary || "#999999",
    };
  };

  /**
   * Get full platform info
   */
  const getPlatform = (platformId: PlatformId): Platform | undefined => {
    return platforms?.find(p => p.platformId === platformId) as Platform | undefined;
  };

  return {
    platforms: platforms as Platform[] | undefined,
    getLogoUrl,
    getEmoji,
    getColors,
    getPlatform,
    isLoading: platforms === undefined,
  };
}

// Re-export types
export type { PlatformId, Platform, PlatformLogo };
