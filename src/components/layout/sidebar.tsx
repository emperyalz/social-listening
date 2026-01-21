"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  DollarSign,
  Target,
  Wand2,
  Heart,
  Mic2,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"

const navigation = [
  {
    name: "Command Center",
    href: "/command-center",
    icon: LayoutDashboard,
    description: "Overview dashboard",
  },
  {
    name: "Commercial Intent",
    href: "/commercial-intent",
    icon: DollarSign,
    description: "Revenue opportunities",
  },
  {
    name: "Resonance Audit",
    href: "/resonance-audit",
    icon: Target,
    description: "Strategy alignment",
  },
  {
    name: "Content Engineering",
    href: "/content-engineering",
    icon: Wand2,
    description: "Content optimization",
  },
  {
    name: "Audience Sentiment",
    href: "/audience-sentiment",
    icon: Heart,
    description: "Sentiment analysis",
  },
  {
    name: "Brand Voice",
    href: "/brand-voice",
    icon: Mic2,
    description: "Voice consistency",
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
    description: "Organization settings",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#28A963] flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-semibold text-lg">Ascoltare</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-gray-800 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive
                  ? "bg-[#28A963] text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.name}</div>
                  <div className="text-xs opacity-60 truncate">
                    {item.description}
                  </div>
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Demo Badge */}
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs text-amber-500 font-medium">Demo Mode</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Viewing Grupo Horizonte data
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
