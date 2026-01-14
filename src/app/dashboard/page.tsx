"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, TrendingUp, Eye, Heart, 
  Instagram, Music2, Youtube, MapPin, Building2, X, ChevronDown, Check
} from "lucide-react";

// ============ MULTI-SELECT COMPONENT ============
function MultiSelect({ 
  options, 
  selected, 
  onChange, 
  placeholder, 
  icon,
  className = "w-[200px]"
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const clearThis = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const displayText = selected.length === 0 
    ? placeholder 
    : selected.length === 1 
      ? options.find(o => o.value === selected[0])?.label || selected[0]
      : `${selected.length} selected`;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full h-10 px-3 py-2 text-sm bg-white border rounded-md hover:bg-slate-50"
      >
        <span className="flex items-center gap-2 truncate">
          {icon}
          {displayText}
        </span>
        <div className="flex items-center gap-1">
          {selected.length > 0 && (
            <span title="Clear this filter">
              <X 
                className="h-4 w-4 text-slate-400 hover:text-red-500 cursor-pointer" 
                onClick={clearThis}
              />
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {selected.length > 0 && (
            <div
              onClick={clearThis}
              className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 cursor-pointer border-b text-red-600 text-sm"
            >
              <X className="h-4 w-4" />
              Clear selection ({selected.length})
            </div>
          )}
          {options.map(option => (
            <div
              key={option.value}
              onClick={() => toggleOption(option.value)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 cursor-pointer"
            >
              <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                selected.includes(option.value) ? "bg-primary border-primary" : "border-slate-300"
              }`}>
                {selected.includes(option.value) && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>
              <span className="text-sm">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ PLATFORM OPTIONS ============
const PLATFORM_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
];

const PLATFORMS: Record<string, { icon: any; color: string; bg: string }> = {
  instagram: { icon: Instagram, color: "text-pink-500", bg: "bg-pink-50" },
  tiktok: { icon: Music2, color: "text-slate-800", bg: "bg-slate-100" },
  youtube: { icon: Youtube, color: "text-red-500", bg: "bg-red-50" },
};

// Helper to extract clean username from potentially dirty data
function extractCleanUsername(platform: string, username: string): string {
  if (!username) return "";
  let cleaned = username.trim().replace(/^@/, "");
  
  if (!cleaned.includes("/") && !cleaned.includes(".")) {
    return cleaned;
  }
  
  try {
    let urlString = cleaned;
    if (!urlString.startsWith("http")) {
      urlString = "https://" + urlString;
    }
    const url = new URL(urlString);
    const pathname = url.pathname.replace(/\/$/, "");
    
    switch (platform) {
      case "instagram":
        const igParts = pathname.split("/").filter(Boolean);
        if (igParts.length > 0) return igParts[0];
        break;
      case "tiktok":
        const ttParts = pathname.split("/").filter(Boolean);
        if (ttParts.length > 0) return ttParts[0].replace(/^@/, "");
        break;
      case "youtube":
        if (pathname.startsWith("/@")) return pathname.slice(2);
        if (pathname.startsWith("/c/")) return pathname.slice(3);
        if (pathname.startsWith("/channel/")) return pathname.slice(9);
        const ytParts = pathname.split("/").filter(Boolean);
        if (ytParts.length > 0) return ytParts[0].replace(/^@/, "");
        break;
    }
  } catch (e) {}
  
  return cleaned;
}

export default function DashboardPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);

  const accounts = useQuery(api.accounts.list, {});
  const markets = useQuery(api.markets.getAll);
  const competitors = useQuery(api.competitors.list, {});

  const marketOptions = markets?.map(m => ({ value: m._id, label: m.name })) || [];
  
  // Filter accounts
  const filteredAccounts = accounts?.filter(acc => {
    if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(acc.platform)) return false;
    if (selectedMarkets.length > 0 && !selectedMarkets.includes(acc.marketId)) return false;
    return true;
  }) || [];

  // Calculate stats
  const totalFollowers = filteredAccounts.reduce((sum, acc) => sum + (acc.followersCount || 0), 0);
  const totalPosts = filteredAccounts.reduce((sum, acc) => sum + (acc.postsCount || 0), 0);
  
  const hasAnyFilter = selectedPlatforms.length > 0 || selectedMarkets.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of competitor social media presence
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap items-center">
        <MultiSelect
          options={PLATFORM_OPTIONS}
          selected={selectedPlatforms}
          onChange={setSelectedPlatforms}
          placeholder="All Platforms"
          icon={<Instagram className="h-4 w-4 text-slate-400" />}
        />
        <MultiSelect
          options={marketOptions}
          selected={selectedMarkets}
          onChange={setSelectedMarkets}
          placeholder="All Markets"
          icon={<MapPin className="h-4 w-4 text-slate-400" />}
        />
        {hasAnyFilter && (
          <button
            onClick={() => {
              setSelectedPlatforms([]);
              setSelectedMarkets([]);
            }}
            className="flex items-center gap-1 px-3 py-2 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
            Clear All Filters
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAccounts.length}</div>
            <p className="text-xs text-muted-foreground">
              Active tracking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalFollowers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined reach
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Tracked content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competitors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitors?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Being monitored
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Competitor Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>Competitor Rankings (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground border-b">
                  <th className="pb-3 font-medium">Rank</th>
                  <th className="pb-3 font-medium">Account</th>
                  <th className="pb-3 font-medium">Platform</th>
                  <th className="pb-3 font-medium text-right">Followers</th>
                  <th className="pb-3 font-medium text-right">Growth</th>
                  <th className="pb-3 font-medium text-right">Posts/Week</th>
                  <th className="pb-3 font-medium text-right">Avg Likes</th>
                  <th className="pb-3 font-medium text-right">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts
                  .sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0))
                  .slice(0, 10)
                  .map((account, index) => {
                    const platform = PLATFORMS[account.platform];
                    const Icon = platform?.icon || Users;
                    const cleanUsername = extractCleanUsername(account.platform, account.username);
                    return (
                      <tr key={account._id} className="border-b last:border-0">
                        <td className="py-3">{index + 1}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${platform?.bg || "bg-slate-100"}`}>
                              {account.avatarUrl ? (
                                <img src={account.avatarUrl} alt="" className="h-8 w-8 rounded-full" />
                              ) : (
                                <span className="text-sm font-medium">{cleanUsername[0]?.toUpperCase()}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">@{cleanUsername}</div>
                              <div className="text-xs text-muted-foreground">
                                {account.companyName || "Unknown"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${platform?.bg || "bg-slate-100"}`}>
                            <Icon className={`h-4 w-4 ${platform?.color || "text-slate-500"}`} />
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          {(account.followersCount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-green-500">+0%</td>
                        <td className="py-3 text-right">0.0</td>
                        <td className="py-3 text-right">0</td>
                        <td className="py-3 text-right">0%</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
