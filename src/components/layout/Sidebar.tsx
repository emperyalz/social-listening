"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
} from "lucide-react";

const navigation = [
  { 
    name: "Overview", 
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Command Center", href: "/command-center", icon: Zap },
    ]
  },
  {
    name: "Intelligence Modules",
    items: [
      { name: "Commercial Intent", href: "/commercial-intent", icon: DollarSign },
      { name: "Resonance Audit", href: "/resonance-audit", icon: Target },
      { name: "Brand Voice", href: "/brand-voice", icon: Mic2 },
      { name: "Content Engineering", href: "/content-engineering", icon: FlaskConical },
      { name: "Audience Sentiment", href: "/audience-sentiment", icon: Heart },
    ]
  },
  {
    name: "Data & Analysis",
    items: [
      { name: "Competitors", href: "/competitors", icon: Users },
      { name: "Insights", href: "/insights", icon: TrendingUp },
      { name: "Posts", href: "/posts", icon: FileText },
    ]
  },
  {
    name: "Configuration",
    items: [
      { name: "Markets", href: "/markets", icon: Building2 },
      { name: "Jobs", href: "/jobs", icon: Activity },
      { name: "Platforms", href: "/platforms", icon: Palette },
      { name: "Projects", href: "/projects", icon: FolderKanban },
      { name: "Profile", href: "/profile", icon: UserCircle },
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/ascoltare-logo.svg"
            alt="Ascoltare"
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
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t p-4">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-xs text-muted-foreground">Real Estate Intelligence</p>
          <p className="text-sm font-medium">Panama City Market</p>
        </div>
      </div>
    </div>
  );
}
