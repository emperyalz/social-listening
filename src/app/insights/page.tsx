"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, TrendingDown, Users, 
  Instagram, Music2, Youtube, MapPin, X, ChevronDown, Check
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

// ============ CONSTANTS ============
const PLATFORM_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
];

const TIME_RANGE_OPTIONS = [
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
];

const PLATFORMS: Record<string, { icon: any; color: string; bg: string }> = {
  instagram: { icon: Instagram, color: "text-pink-500", bg: "bg-pink-50" },
  tiktok: { icon: Music2, color: "text-slate-800", bg: "bg-slate-100" },
  youtube: { icon: Youtube, color: "text-red-500", bg: "bg-red-50" },
};

// Helper to extract clean username
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

export default function InsightsPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string[]>(["30"]);

  const accounts = useQuery(api.accounts.list, {});
  const markets = useQuery(api.markets.getAll);

  const marketOptions = markets?.map(m => ({ value: m._id, label: m.name })) || [];
  
  // Filter accounts
  const filteredAccounts = accounts?.filter(acc => {
    if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(acc.platform)) return false;
    if (selectedMarkets.length > 0 && !selectedMarkets.includes(acc.marketId)) return false;
    return true;
  }) || [];

  const hasAnyFilter = selectedPlatforms.length > 0 || selectedMarkets.length > 0;

  // Calculate insights
  const totalFollowers = filteredAccounts.reduce((sum, acc) => sum + (acc.followersCount || 0), 0);
  const avgFollowers = filteredAccounts.length > 0 ? Math.round(totalFollowers / filteredAccounts.length) : 0;

  // Top growers (placeholder - would need snapshot data)
  const topGrowers = filteredAccounts
    .slice(0, 5)
    .map(acc => ({
      ...acc,
      cleanUsername: extractCleanUsername(acc.platform, acc.username),
      growth: 0 // Would calculate from snapshots
    }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Insights</h1>
        <p className="text-muted-foreground">
          Analyze competitor performance and trends
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
        <MultiSelect
          options={TIME_RANGE_OPTIONS}
          selected={selectedTimeRange}
          onChange={setSelectedTimeRange}
          placeholder="Time Range"
          icon={<TrendingUp className="h-4 w-4 text-slate-400" />}
          className="w-[180px]"
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalFollowers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Combined followers across {filteredAccounts.length} accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Followers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgFollowers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per account average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Accounts Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredAccounts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active monitoring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Growers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Growing Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topGrowers.map((account, index) => {
              const platform = PLATFORMS[account.platform];
              const Icon = platform?.icon || Users;
              return (
                <div key={account._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-muted-foreground w-6">
                      {index + 1}
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${platform?.bg || "bg-slate-100"}`}>
                      {account.avatarUrl ? (
                        <img src={account.avatarUrl} alt="" className="h-10 w-10 rounded-full" />
                      ) : (
                        <Icon className={`h-5 w-5 ${platform?.color || "text-slate-500"}`} />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">@{account.cleanUsername}</div>
                      <div className="text-xs text-muted-foreground">
                        {(account.followersCount || 0).toLocaleString()} followers
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-500">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">+{account.growth}%</span>
                  </div>
                </div>
              );
            })}
            {topGrowers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No accounts found matching your filters
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Platform Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(PLATFORMS).map(([key, platform]) => {
              const Icon = platform.icon;
              const count = filteredAccounts.filter(a => a.platform === key).length;
              const followers = filteredAccounts
                .filter(a => a.platform === key)
                .reduce((sum, a) => sum + (a.followersCount || 0), 0);
              
              return (
                <div key={key} className={`p-4 rounded-lg ${platform.bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-5 w-5 ${platform.color}`} />
                    <span className="font-medium capitalize">{key}</span>
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground">
                    {followers.toLocaleString()} total followers
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
