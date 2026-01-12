"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber, formatRelativeTime, getPlatformIcon } from "@/lib/utils";
import { Heart, MessageCircle, Eye, ExternalLink } from "lucide-react";

export default function PostsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("likes");

  const posts = useQuery(api.posts.list, {
    platform:
      selectedPlatform !== "all"
        ? (selectedPlatform as "instagram" | "tiktok" | "youtube")
        : undefined,
    limit: 50,
  });

  const topPosts = useQuery(api.posts.getTopPosts, {
    platform:
      selectedPlatform !== "all"
        ? (selectedPlatform as "instagram" | "tiktok" | "youtube")
        : undefined,
    metric: sortBy as "likes" | "comments" | "views" | "engagement",
    days: 30,
    limit: 20,
  });

  const displayPosts = sortBy === "recent" ? posts : topPosts;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground">
            Browse and analyze competitor content
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">📸 Instagram</SelectItem>
              <SelectItem value="tiktok">🎵 TikTok</SelectItem>
              <SelectItem value="youtube">▶️ YouTube</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="likes">Top by Likes</SelectItem>
              <SelectItem value="comments">Top by Comments</SelectItem>
              <SelectItem value="views">Top by Views</SelectItem>
              <SelectItem value="engagement">Top by Engagement</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayPosts?.map((post) => (
          <Card key={post._id} className="overflow-hidden">
            {/* Thumbnail */}
            {post.thumbnailUrl && (
              <div className="relative aspect-video bg-muted">
                <img
                  src={post.thumbnailUrl}
                  alt="Post thumbnail"
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-2 top-2">
                  <span className="rounded bg-black/70 px-2 py-1 text-xs text-white">
                    {getPlatformIcon(post.platform)} {post.postType}
                  </span>
                </div>
              </div>
            )}
            <CardContent className="p-4">
              {/* Account info */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    @{post.account?.username}
                  </span>
                </div>
                <a
                  href={post.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              {/* Caption */}
              {post.caption && (
                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                  {post.caption}
                </p>
              )}

              {/* Hashtags */}
              {post.hashtags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {post.hashtags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-muted px-2 py-0.5 text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                  {post.hashtags.length > 5 && (
                    <span className="text-xs text-muted-foreground">
                      +{post.hashtags.length - 5} more
                    </span>
                  )}
                </div>
              )}

              {/* Engagement metrics */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span>{formatNumber(post.engagement?.likesCount || 0)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <span>
                    {formatNumber(post.engagement?.commentsCount || 0)}
                  </span>
                </div>
                {post.engagement?.viewsCount && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-green-500" />
                    <span>{formatNumber(post.engagement.viewsCount)}</span>
                  </div>
                )}
              </div>

              {/* Posted time */}
              <div className="mt-3 text-xs text-muted-foreground">
                Posted {formatRelativeTime(post.postedAt)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!displayPosts || displayPosts.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No posts found. Add competitor accounts and run a scrape job to see
            content here.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
