"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Heart, MessageCircle, Share2, Eye, Play,
  Instagram, Music2, Youtube, MapPin, Calendar, X, ChevronDown, Check, ExternalLink
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

const POST_TYPE_OPTIONS = [
  { value: "post", label: "Posts" },
  { value: "reel", label: "Reels" },
  { value: "video", label: "Videos" },
  { value: "short", label: "Shorts" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "likes", label: "Most Likes" },
  { value: "views", label: "Most Views" },
  { value: "comments", label: "Most Comments" },
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
        return pathname.split("/").filter(Boolean)[0] || cleaned;
      case "tiktok":
        return (pathname.split("/").filter(Boolean)[0] || cleaned).replace(/^@/, "");
      case "youtube":
        if (pathname.startsWith("/@")) return pathname.slice(2);
        if (pathname.startsWith("/c/")) return pathname.slice(3);
        if (pathname.startsWith("/channel/")) return pathname.slice(9);
        return (pathname.split("/").filter(Boolean)[0] || cleaned).replace(/^@/, "");
    }
  } catch (e) {}
  
  return cleaned;
}

export default function PostsPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string[]>(["recent"]);

  const posts = useQuery(api.posts.list, { limit: 50 });
  const accounts = useQuery(api.accounts.list, {});
  const markets = useQuery(api.markets.getAll);

  const marketOptions = markets?.map(m => ({ value: m._id, label: m.name })) || [];
  
  // Create account lookup
  const accountMap = new Map(accounts?.map(a => [a._id, a]) || []);

  // Filter and sort posts
  let filteredPosts = posts?.filter(post => {
    const account = accountMap.get(post.accountId);
    if (!account) return false;
    
    if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(account.platform)) return false;
    if (selectedMarkets.length > 0 && !selectedMarkets.includes(account.marketId)) return false;
    if (selectedTypes.length > 0 && !selectedTypes.includes(post.postType || "post")) return false;
    
    return true;
  }) || [];

  // Sort
  const sortBy = selectedSort[0] || "recent";
  filteredPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "likes":
        return (b.likesCount || 0) - (a.likesCount || 0);
      case "views":
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      case "comments":
        return (b.commentsCount || 0) - (a.commentsCount || 0);
      default:
        return (b.postedAt || 0) - (a.postedAt || 0);
    }
  });

  const hasAnyFilter = selectedPlatforms.length > 0 || selectedMarkets.length > 0 || selectedTypes.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Posts</h1>
        <p className="text-muted-foreground">
          Browse and analyze competitor content
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
          options={POST_TYPE_OPTIONS}
          selected={selectedTypes}
          onChange={setSelectedTypes}
          placeholder="All Types"
          icon={<Play className="h-4 w-4 text-slate-400" />}
        />
        <MultiSelect
          options={SORT_OPTIONS}
          selected={selectedSort}
          onChange={setSelectedSort}
          placeholder="Sort By"
          icon={<Calendar className="h-4 w-4 text-slate-400" />}
          className="w-[180px]"
        />
        {hasAnyFilter && (
          <button
            onClick={() => {
              setSelectedPlatforms([]);
              setSelectedMarkets([]);
              setSelectedTypes([]);
            }}
            className="flex items-center gap-1 px-3 py-2 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
            Clear All Filters
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredPosts.length} posts
      </div>

      {/* Posts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map(post => {
          const account = accountMap.get(post.accountId);
          if (!account) return null;
          
          const platform = PLATFORMS[account.platform];
          const Icon = platform?.icon || Instagram;
          const cleanUsername = extractCleanUsername(account.platform, account.username);
          
          return (
            <Card key={post._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              {post.thumbnailUrl && (
                <div className="relative aspect-square bg-slate-100">
                  <img 
                    src={post.thumbnailUrl} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                  {post.postType === "video" || post.postType === "reel" || post.postType === "short" ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="h-12 w-12 text-white fill-white" />
                    </div>
                  ) : null}
                </div>
              )}
              
              <CardContent className="p-4">
                {/* Account info */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${platform?.bg || "bg-slate-100"}`}>
                    {account.avatarUrl ? (
                      <img src={account.avatarUrl} alt="" className="h-8 w-8 rounded-full" />
                    ) : (
                      <Icon className={`h-4 w-4 ${platform?.color || "text-slate-500"}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">@{cleanUsername}</div>
                    <div className="text-xs text-muted-foreground">
                      {post.postedAt ? new Date(post.postedAt).toLocaleDateString() : "Unknown date"}
                    </div>
                  </div>
                  <a 
                    href={post.postUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                </div>

                {/* Caption */}
                {post.caption && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {post.caption}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{(post.likesCount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{(post.commentsCount || 0).toLocaleString()}</span>
                  </div>
                  {post.viewsCount !== undefined && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{(post.viewsCount || 0).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPosts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No posts found matching your filters. Try adjusting your criteria.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
