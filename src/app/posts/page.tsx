"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { ExternalLink, Calendar } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

export default function PostsPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);

  const posts = useQuery(api.posts.list, {});
  const accounts = useQuery(api.accounts.list, {});
  const markets = useQuery(api.markets.getAll);

  // Filter posts
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
    { value: "instagram", label: "Instagram" },
    { value: "tiktok", label: "TikTok" },
    { value: "youtube", label: "YouTube" },
  ];

  // Market options
  const marketOptions = markets?.map(m => ({
    value: m._id,
    label: m.name,
  })) || [];

  const hasAnyFilter = selectedPlatforms.length > 0 || selectedMarkets.length > 0;

  const clearAllFilters = () => {
    setSelectedPlatforms([]);
    setSelectedMarkets([]);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Posts</h1>
        <p className="text-muted-foreground">
          Browse and analyze competitor content
        </p>
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
              placeholder="Platform"
            />
            <MultiSelect
              options={marketOptions}
              selected={selectedMarkets}
              onChange={setSelectedMarkets}
              placeholder="Market"
            />
            {hasAnyFilter && (
              <Button variant="ghost" onClick={clearAllFilters}>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post) => {
            const account = accounts?.find(a => a._id === post.accountId);
            return (
              <Card key={post._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base line-clamp-2">{post.caption || "No caption"}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">@{account?.username}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      account?.platform === 'instagram' ? 'bg-pink-100 text-pink-700' :
                      account?.platform === 'tiktok' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {account?.platform}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.postedAt)}</span>
                  </div>

                  {post.postUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(post.postUrl, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Post
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
