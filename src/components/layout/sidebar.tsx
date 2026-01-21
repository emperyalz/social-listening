"use client"

import Link from "next/link"
import Image from "next/image"
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
  Palette,
  Shield,
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

// Orwell Admin navigation - only visible to platform administrators
const orwellAdminNavigation = [
  {
    name: "Platform Branding",
    href: "/orwell-admin/branding",
    icon: Palette,
    description: "Manage dashboard branding",
  },
]

interface SidebarProps {
  isOrwellAdmin?: boolean
}

export function Sidebar({ isOrwellAdmin = true }: SidebarProps) {
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
            <Image
              src="/orwell-logo-white.svg"
              alt="Orwell"
              width={140}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-full">
            <div className="w-8 h-8 rounded-lg bg-[#28A963] flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="flex justify-center p-2 border-b border-gray-800">
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded-md hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Main Navigation */}
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

      {/* Orwell Admin Section - Only visible to Orwell Admins */}
      {isOrwellAdmin && (
        <>
          {!collapsed && (
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider">
                <Shield className="h-3 w-3" />
                Orwell Admin
              </div>
            </div>
          )}
          <nav className="px-2 space-y-1">
            {orwellAdminNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                    isActive
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
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
        </>
      )}

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
