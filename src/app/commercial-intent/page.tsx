"use client";

import { useTheme } from "@/contexts/ThemeContext";

export default function CommercialIntentPage() {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="text-6xl mb-6">💰</div>
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#28A963] to-emerald-600 bg-clip-text text-transparent">
          Commercial Intent
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Identify high-intent comments and potential leads from your social media presence.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-600 dark:text-amber-400">
          <span>🚧</span>
          <span>Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
