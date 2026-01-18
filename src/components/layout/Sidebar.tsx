"use client";

import Link from "next/link";
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
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Competitors", href: "/competitors", icon: Users },
  { name: "Insights", href: "/insights", icon: TrendingUp },
  { name: "Posts", href: "/posts", icon: FileText },
  { name: "Markets", href: "/markets", icon: Building2 },
  { name: "Jobs", href: "/jobs", icon: Activity },
  { name: "Platforms", href: "/platforms", icon: Palette },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            📊
          </div>
          <span className="text-lg font-semibold">SocialListen</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
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
