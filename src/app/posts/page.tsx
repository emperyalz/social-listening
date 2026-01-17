"use client";

import { Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { ExternalLink, X, Heart, MessageCircle, Eye, Play, Clock } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { useFilterParams } from "@/hooks/useFilterParams";

function PostsContent() {
  const {
    selectedMarkets,
    setSelectedMarkets,
    selectedPlatforms,
    setSelectedPlatforms,
    clearAllFilters,
  } = useFilterParams();

  const posts = useQuery(api.posts.list, {});
  const accounts = useQuery(api.accounts.list, {});
  const markets = useQuery(api.markets.getAll);

  // Filter posts based on URL params
  const filteredPosts = posts?.filter((post) => {
    const account = accounts?.find(a => a._id === post.accountId);
    if (!account) return false;

    const platformMatch = selectedPlatforms.length === 0 || selectedPlatforms.includes(account.platform);
    const marketMatch = selectedMarkets.length === 0 || selectedMarkets.some(m => account.marketId === m as Id<"markets">);

    return platformMatch && marketMatch;
  }) || [];

  // Sort by most recent
  const sortedPosts = [...filteredPosts].sort((a, b) => b.postedAt - a.postedAt);

  // Platform options
  const platformOptions = [
    { value: "instagram", label: "📸 Instagram" },
    { value: "tiktok", label: "🎵 TikTok" },
    { value: "youtube", label: "▶️ YouTube" },
  ];

  // Market options
  const marketOptions = markets?.map(m => ({
    value: m._id,
    label: m.name,
  })) || [];

  const hasAnyFilter = selectedPlatforms.length > 0 || selectedMarkets.length > 0;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram": return "📸";
      case "tiktok": return "🎵";
      case "youtube": return "▶️";
      default: return "📱";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground">
            Browse and analyze competitor content
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <MultiSelect
              options={platformOptions}
              selected={selectedPlatforms}
              onChange={setSelectedPlatforms}
              placeholder="All Platforms"
            />
            <MultiSelect
              options={marketOptions}
              selected={selectedMarkets}
              onChange={setSelectedMarkets}
              placeholder="All Markets"
            />
            {hasAnyFilter && (
              <Button variant="ghost" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
              <p className="text-3xl font-bold">{sortedPosts.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">This Week</p>
              <p className="text-3xl font-bold">
                {sortedPosts.filter(p => p.postedAt > Date.now() - 7 * 24 * 60 * 60 * 1000).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">This Month</p>
              <p className="text-3xl font-bold">
                {sortedPosts.filter(p => p.postedAt > Date.now() - 30 * 24 * 60 * 60 * 1000).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post) => {
            const account = accounts?.find(a => a._id === post.accountId);
            const engagement = post.engagement;
            return (
              <Card key={post._id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Thumbnail */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  {post.thumbnailUrl ? (
                    <img
                      src={post.thumbnailUrl}
                      alt={post.caption || "Post thumbnail"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='30' fill='%239ca3af' text-anchor='middle' dy='.3em'%3E📷%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                      {getPlatformIcon(account?.platform || "")}
                    </div>
                  )}

                  {/* Platform badge */}
                  <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
                    account?.platform === 'instagram' ? 'bg-pink-500/90 text-white' :
                    account?.platform === 'tiktok' ? 'bg-black/90 text-white' :
                    'bg-red-500/90 text-white'
                  }`}>
                    {getPlatformIcon(account?.platform || "")} {account?.platform}
                  </div>

                  {/* Post type badge */}
                  <div className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full bg-black/60 text-white backdrop-blur-sm">
                    {post.postType}
                  </div>

                  {/* Duration badge for videos */}
                  {post.videoDuration && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 text-xs font-medium rounded bg-black/70 text-white flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(post.videoDuration)}
                    </div>
                  )}

                  {/* Play overlay for videos */}
                  {(post.postType === "video" || post.postType === "reel" || post.postType === "short") && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="h-6 w-6 text-gray-800 ml-1" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardContent className="p-4 space-y-3">
                  {/* Username and date */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">@{account?.username}</span>
                    <span className="text-muted-foreground">{formatDate(post.postedAt)}</span>
                  </div>

                  {/* Caption */}
                  <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                    {post.caption || "No caption"}
                  </p>

                  {/* Engagement Stats */}
                  {engagement && (
                    <div className="flex items-center gap-4 text-sm text-gray-500 pt-2 border-t">
                      <div className="flex items-center gap-1" title="Likes">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>{formatNumber(engagement.likesCount)}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Comments">
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                        <span>{formatNumber(engagement.commentsCount)}</span>
                      </div>
                      {engagement.viewsCount !== undefined && engagement.viewsCount > 0 && (
                        <div className="flex items-center gap-1" title="Views">
                          <Eye className="h-4 w-4 text-green-500" />
                          <span>{formatNumber(engagement.viewsCount)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hashtags */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {post.hashtags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                      {post.hashtags.length > 3 && (
                        <span className="text-xs text-gray-400">+{post.hashtags.length - 3} more</span>
                      )}
                    </div>
                  )}

                  {/* View Post Button */}
                  {post.postUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => window.open(post.postUrl, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Original
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No posts match the current filters
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostsContent />
    </Suspense>
  );
}
