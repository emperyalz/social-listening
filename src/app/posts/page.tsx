"use client";

import { Suspense, useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { ExternalLink, X, Heart, MessageCircle, Eye, Play, Clock, ChevronLeft, ChevronRight, Maximize2, Volume2, VolumeX } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { useFilterParams } from "@/hooks/useFilterParams";

// Types for post data
type PostType = NonNullable<ReturnType<typeof useQuery<typeof api.posts.list>>>[number];
type AccountType = NonNullable<ReturnType<typeof useQuery<typeof api.accounts.list>>>[number];

// Media Player Modal Component
function MediaPlayerModal({
  post,
  account,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: {
  post: PostType;
  account?: AccountType;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}) {
  const [isMuted, setIsMuted] = useState(false);
  const platform = account?.platform || "";
  const isVideo = post.postType === "video" || post.postType === "reel" || post.postType === "short";

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowRight" && hasNext && onNext) onNext();
    if (e.key === "ArrowLeft" && hasPrev && onPrev) onPrev();
  }, [onClose, onNext, onPrev, hasNext, hasPrev]);

  // Get YouTube embed URL
  const getYouTubeEmbedUrl = () => {
    if (platform !== "youtube" || !post.platformPostId) return null;
    return `https://www.youtube.com/embed/${post.platformPostId}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0`;
  };

  // Get TikTok embed URL
  const getTikTokEmbedUrl = () => {
    if (platform !== "tiktok") return null;
    // TikTok requires the full video URL for embedding
    if (post.postUrl) {
      // Extract video ID from URL if available
      const match = post.postUrl.match(/video\/(\d+)/);
      if (match) {
        return `https://www.tiktok.com/embed/v2/${match[1]}`;
      }
    }
    if (post.platformPostId) {
      return `https://www.tiktok.com/embed/v2/${post.platformPostId}`;
    }
    return null;
  };

  // Get Instagram embed URL - Instagram requires oEmbed which is complex,
  // so we'll use their blockquote embed approach
  const getInstagramEmbedUrl = () => {
    if (platform !== "instagram") return null;
    if (post.postUrl) {
      // For Instagram, we need to use their embed endpoint
      return `${post.postUrl}embed/`;
    }
    return null;
  };

  // Render the appropriate media player
  const renderMediaPlayer = () => {
    // YouTube
    if (platform === "youtube") {
      const embedUrl = getYouTubeEmbedUrl();
      if (embedUrl) {
        return (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={post.caption || "YouTube video"}
          />
        );
      }
    }

    // TikTok
    if (platform === "tiktok") {
      const embedUrl = getTikTokEmbedUrl();
      if (embedUrl) {
        return (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={post.caption || "TikTok video"}
            style={{ maxWidth: "605px", margin: "0 auto" }}
          />
        );
      }
    }

    // Instagram
    if (platform === "instagram") {
      const embedUrl = getInstagramEmbedUrl();
      if (embedUrl) {
        return (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={post.caption || "Instagram post"}
            style={{ maxWidth: "540px", margin: "0 auto" }}
          />
        );
      }
    }

    // Fallback to direct video if mediaUrls contain video
    if (post.mediaUrls && post.mediaUrls.length > 0) {
      const mediaUrl = post.mediaUrls[0];
      // Check if it's a video URL
      if (mediaUrl.includes(".mp4") || mediaUrl.includes(".webm") || mediaUrl.includes(".mov")) {
        return (
          <video
            src={mediaUrl}
            controls
            autoPlay
            muted={isMuted}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              // If video fails, show thumbnail instead
              (e.target as HTMLVideoElement).style.display = "none";
            }}
          >
            Your browser does not support the video tag.
          </video>
        );
      }
      // It's an image
      return (
        <img
          src={mediaUrl}
          alt={post.caption || "Post media"}
          className="max-w-full max-h-full object-contain"
        />
      );
    }

    // Final fallback - show thumbnail
    if (post.thumbnailUrl) {
      return (
        <img
          src={post.thumbnailUrl}
          alt={post.caption || "Post thumbnail"}
          className="max-w-full max-h-full object-contain"
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center text-gray-400">
        <Play className="h-16 w-16 mb-4" />
        <p>Media not available for preview</p>
        {post.postUrl && (
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.open(post.postUrl, "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on {platform}
          </Button>
        )}
      </div>
    );
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2"
        onClick={onClose}
      >
        <X className="h-8 w-8" />
      </button>

      {/* Previous button */}
      {hasPrev && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-50 p-2 bg-black/50 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onPrev?.();
          }}
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-50 p-2 bg-black/50 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onNext?.();
          }}
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}

      {/* Main content */}
      <div
        className="flex flex-col lg:flex-row max-w-7xl w-full h-full lg:h-[85vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media Player */}
        <div className="flex-1 bg-black flex items-center justify-center min-h-[50vh] lg:min-h-0">
          {renderMediaPlayer()}
        </div>

        {/* Post Info Sidebar */}
        <div className="w-full lg:w-96 bg-white lg:rounded-r-lg overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Account info */}
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${
                platform === 'instagram' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                platform === 'tiktok' ? 'bg-black' :
                'bg-red-600'
              }`}>
                {account?.username?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="font-semibold">@{account?.username}</p>
                <p className="text-sm text-muted-foreground capitalize">{platform}</p>
              </div>
            </div>

            {/* Engagement stats */}
            {post.engagement && (
              <div className="flex items-center gap-6 py-4 border-b">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="font-medium">{formatNumber(post.engagement.likesCount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{formatNumber(post.engagement.commentsCount)}</span>
                </div>
                {post.engagement.viewsCount !== undefined && post.engagement.viewsCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-green-500" />
                    <span className="font-medium">{formatNumber(post.engagement.viewsCount)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Caption */}
            <div className="py-2">
              <p className="text-sm whitespace-pre-wrap">{post.caption || "No caption"}</p>
            </div>

            {/* Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 py-2">
                {post.hashtags.map((tag, i) => (
                  <span key={i} className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Post date and type */}
            <div className="text-sm text-muted-foreground py-2 border-t">
              <p>Posted: {new Date(post.postedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}</p>
              <p className="capitalize">Type: {post.postType}</p>
            </div>

            {/* View original button */}
            {post.postUrl && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(post.postUrl, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Original on {platform}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mute toggle for videos */}
      {isVideo && (platform === "youtube") && (
        <button
          className="absolute bottom-4 left-4 text-white hover:text-gray-300 z-50 p-2 bg-black/50 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted(!isMuted);
          }}
        >
          {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        </button>
      )}
    </div>
  );
}

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

  // State for media player modal
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);

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

  // Get thumbnail URL with fallbacks
  const getThumbnailUrl = (post: NonNullable<typeof posts>[number], platform?: string) => {
    // If we have a valid thumbnail URL, use it
    if (post.thumbnailUrl) {
      return post.thumbnailUrl;
    }

    // For YouTube, we can construct thumbnail from platformPostId
    if (platform === "youtube" && post.platformPostId) {
      return `https://img.youtube.com/vi/${post.platformPostId}/hqdefault.jpg`;
    }

    // For TikTok, try the cover images or mediaUrls
    if (platform === "tiktok" && post.mediaUrls && post.mediaUrls.length > 0) {
      return post.mediaUrls[0];
    }

    // For Instagram, try mediaUrls
    if (platform === "instagram" && post.mediaUrls && post.mediaUrls.length > 0) {
      return post.mediaUrls[0];
    }

    return null;
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

      {/* Media Player Modal */}
      {selectedPostIndex !== null && sortedPosts[selectedPostIndex] && (
        <MediaPlayerModal
          post={sortedPosts[selectedPostIndex]}
          account={accounts?.find(a => a._id === sortedPosts[selectedPostIndex].accountId)}
          onClose={() => setSelectedPostIndex(null)}
          onNext={() => setSelectedPostIndex(prev => prev !== null && prev < sortedPosts.length - 1 ? prev + 1 : prev)}
          onPrev={() => setSelectedPostIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev)}
          hasNext={selectedPostIndex < sortedPosts.length - 1}
          hasPrev={selectedPostIndex > 0}
        />
      )}

      {/* Posts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post, index) => {
            const account = accounts?.find(a => a._id === post.accountId);
            const engagement = post.engagement;
            const thumbnailUrl = getThumbnailUrl(post, account?.platform);
            return (
              <Card key={post._id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Thumbnail - clickable to open modal */}
                <div
                  className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedPostIndex(index)}
                >
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={post.caption || "Post thumbnail"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Try YouTube thumbnail as second attempt for YouTube posts
                        const target = e.target as HTMLImageElement;
                        if (account?.platform === "youtube" && post.platformPostId && !target.dataset.fallbackAttempted) {
                          target.dataset.fallbackAttempted = "true";
                          target.src = `https://img.youtube.com/vi/${post.platformPostId}/mqdefault.jpg`;
                        } else {
                          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='30' fill='%239ca3af' text-anchor='middle' dy='.3em'%3E📷%3C/text%3E%3C/svg%3E";
                        }
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
                  {(post.postType === "video" || post.postType === "reel" || post.postType === "short") ? (
                    <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity bg-black/10 group-hover:bg-black/30">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play className="h-8 w-8 text-gray-800 ml-1" fill="currentColor" />
                      </div>
                    </div>
                  ) : (
                    /* Expand overlay for images */
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Maximize2 className="h-5 w-5 text-gray-800" />
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
