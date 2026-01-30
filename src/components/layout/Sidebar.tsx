"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  FileText,
  Settings,
  Activity,
  Building2,
  Palette,
  Target,
  DollarSign,
  Mic2,
  FlaskConical,
  Heart,
  Zap,
  UserCircle,
  FolderKanban,
  Sun,
  Moon,
} from "lucide-react";

const getNavigation = (t: (key: string) => string) => [
  { 
    name: t("nav.overview"), 
    items: [
      { name: t("nav.dashboard"), href: "/dashboard", icon: LayoutDashboard },
      { name: t("nav.commandCenter"), href: "/command-center", icon: Zap },
    ]
  },
  {
    name: t("nav.intelligenceModules"),
    items: [
      { name: t("nav.commercialIntent"), href: "/commercial-intent", icon: DollarSign },
      { name: t("nav.resonanceAudit"), href: "/resonance-audit", icon: Target },
      { name: t("nav.brandVoice"), href: "/brand-voice", icon: Mic2 },
      { name: t("nav.contentEngineering"), href: "/content-engineering", icon: FlaskConical },
      { name: t("nav.audienceSentiment"), href: "/audience-sentiment", icon: Heart },
    ]
  },
  {
    name: t("nav.dataAnalysis"),
    items: [
      { name: t("nav.competitors"), href: "/competitors", icon: Users },
      { name: t("nav.insights"), href: "/insights", icon: TrendingUp },
      { name: t("nav.posts"), href: "/posts", icon: FileText },
    ]
  },
  {
    name: t("nav.configuration"),
    items: [
      { name: t("nav.markets"), href: "/markets", icon: Building2 },
      { name: t("nav.jobs"), href: "/jobs", icon: Activity },
      { name: t("nav.platforms"), href: "/platforms", icon: Palette },
      { name: t("nav.projects"), href: "/projects", icon: FolderKanban },
      { name: t("nav.profile"), href: "/profile", icon: UserCircle },
      { name: t("nav.settings"), href: "/settings", icon: Settings },
    ]
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const navigation = getNavigation(t);

  // Select logo based on theme - using Orwell branding
  const logoSrc = theme === "dark" ? "/orwell-logo-dark.svg" : "/orwell-logo-white.svg";

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src={logoSrc}
            alt="Orwell"
            width={180}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {navigation.map((section) => (
          <div key={section.name}>
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.name}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#28A963] text-white"
                        : "text-muted-foreground hover:bg-[#28A963]/10 hover:text-[#28A963]"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
              {/* Theme Toggle - placed right after Settings link */}
              {section.name === t("nav.configuration") && (
                <button
                  onClick={toggleTheme}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-[#28A963]/10 hover:text-[#28A963]"
                >
                  {theme === "light" ? (
                    <>
                      <Moon className="h-4 w-4" />
                      <span>{t("settings.darkMode")}</span>
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4" />
                      <span>{t("settings.lightMode")}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Powered by QueXopa branding - larger size */}
      <div className="border-t p-6">
        <div className="flex items-center justify-center">
          <Image
            src={theme === "dark" ? "/powered-by-qx-dark.svg" : "/powered-by-qx-white.svg"}
            alt="Powered by QueXopa"
            width={200}
            height={48}
            className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    </div>
  );
}
