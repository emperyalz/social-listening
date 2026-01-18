import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper function to get follower/subscriber count from a snapshot based on platform
function getFollowerCountFromSnapshot(
  snapshot: { followersCount: number; subscribersCount?: number } | null,
  platform: string
): number {
  if (!snapshot) return 0;
  // For YouTube, use subscribersCount (subscribers) instead of followersCount
  if (platform === "youtube") {
    return snapshot.subscribersCount ?? snapshot.followersCount ?? 0;
  }
  return snapshot.followersCount ?? 0;
}

// Get dashboard overview stats - supports multiple platforms and markets
export const getDashboardStats = query({
  args: {
    marketId: v.optional(v.id("markets")),
    marketIds: v.optional(v.array(v.id("markets"))),
    platform: v.optional(
      v.union(v.literal("instagram"), v.literal("tiktok"), v.literal("youtube"))
    ),
    platforms: v.optional(v.array(
      v.union(v.literal("instagram"), v.literal("tiktok"), v.literal("youtube"))
    )),
  },
  handler: async (ctx, args) => {
    let accounts = await ctx.db
      .query("accounts")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Filter by markets (supports array)
    if (args.marketIds && args.marketIds.length > 0) {
      const marketSet = new Set(args.marketIds);
      accounts = accounts.filter((a) => marketSet.has(a.marketId));
    } else if (args.marketId) {
      accounts = accounts.filter((a) => a.marketId === args.marketId);
    }

    // Filter by platforms (supports array)
    if (args.platforms && args.platforms.length > 0) {
      const platformSet = new Set(args.platforms);
      accounts = accounts.filter((a) => platformSet.has(a.platform));
    } else if (args.platform) {
      accounts = accounts.filter((a) => a.platform === args.platform);
    }

    const accountIds = new Set(accounts.map((a) => a._id));

    // Get recent posts (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentPosts = await ctx.db
      .query("posts")
      .filter((q) => q.gte(q.field("postedAt"), sevenDaysAgo))
      .collect();

    const filteredPosts = recentPosts.filter((p) => accountIds.has(p.accountId));

    // Get latest snapshots for follower counts
    let totalFollowers = 0;
    let totalPosts = 0;
    const today = new Date().toISOString().split("T")[0];

    for (const account of accounts) {
      const snapshot = await ctx.db
        .query("accountSnapshots")
        .withIndex("by_account", (q) => q.eq("accountId", account._id))
        .order("desc")
        .first();

      if (snapshot) {
        // Use helper function to correctly get followers/subscribers based on platform
        totalFollowers += getFollowerCountFromSnapshot(snapshot, account.platform);
        totalPosts += snapshot.postsCount;
      }
    }

    // Calculate total engagement from recent posts
    let totalLikes = 0;
    let totalComments = 0;
    let totalViews = 0;

    for (const post of filteredPosts) {
      const snapshot = await ctx.db
        .query("postSnapshots")
        .withIndex("by_post", (q) => q.eq("postId", post._id))
        .order("desc")
        .first();

      if (snapshot) {
        totalLikes += snapshot.likesCount;
        totalComments += snapshot.commentsCount;
        totalViews += snapshot.viewsCount || 0;
      }
    }

    return {
      accountsTracked: accounts.length,
      totalFollowers,
      totalPosts,
      recentPostsCount: filteredPosts.length,
      totalLikes,
      totalComments,
      totalViews,
      avgEngagementRate:
        totalFollowers > 0
          ? ((totalLikes + totalComments) / totalFollowers) * 100
          : 0,
    };
  },
});

// Get competitor comparison data - supports multiple platforms and markets
export const getCompetitorComparison = query({
  args: {
    marketId: v.optional(v.id("markets")),
    marketIds: v.optional(v.array(v.id("markets"))),
    platform: v.optional(
      v.union(v.literal("instagram"), v.literal("tiktok"), v.literal("youtube"))
    ),
    platforms: v.optional(v.array(
      v.union(v.literal("instagram"), v.literal("tiktok"), v.literal("youtube"))
    )),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysAgo = args.days || 30;
    const cutoffDate = Date.now() - daysAgo * 24 * 60 * 60 * 1000;

    let accounts = await ctx.db
      .query("accounts")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Filter by markets (supports array)
    if (args.marketIds && args.marketIds.length > 0) {
      const marketSet = new Set(args.marketIds);
      accounts = accounts.filter((a) => marketSet.has(a.marketId));
    } else if (args.marketId) {
      accounts = accounts.filter((a) => a.marketId === args.marketId);
    }

    // Filter by platforms (supports array)
    if (args.platforms && args.platforms.length > 0) {
      const platformSet = new Set(args.platforms);
      accounts = accounts.filter((a) => platformSet.has(a.platform));
    } else if (args.platform) {
      accounts = accounts.filter((a) => a.platform === args.platform);
    }

    const comparison = await Promise.all(
      accounts.map(async (account) => {
        const market = await ctx.db.get(account.marketId);

        // Get follower snapshot
        const latestSnapshot = await ctx.db
          .query("accountSnapshots")
          .withIndex("by_account", (q) => q.eq("accountId", account._id))
          .order("desc")
          .first();

        const oldestSnapshot = await ctx.db
          .query("accountSnapshots")
          .withIndex("by_account", (q) => q.eq("accountId", account._id))
          .order("asc")
          .first();

        // Get posts in period
        const posts = await ctx.db
          .query("posts")
          .withIndex("by_account", (q) => q.eq("accountId", account._id))
          .filter((q) => q.gte(q.field("postedAt"), cutoffDate))
          .collect();

        // Calculate engagement
        let totalLikes = 0;
        let totalComments = 0;
        let totalViews = 0;

        for (const post of posts) {
          const snapshot = await ctx.db
            .query("postSnapshots")
            .withIndex("by_post", (q) => q.eq("postId", post._id))
            .order("desc")
            .first();

          if (snapshot) {
            totalLikes += snapshot.likesCount;
            totalComments += snapshot.commentsCount;
            totalViews += snapshot.viewsCount || 0;
          }
        }

        // Use helper function to correctly get followers/subscribers based on platform
        const followers = getFollowerCountFromSnapshot(latestSnapshot, account.platform);
        const oldFollowers = getFollowerCountFromSnapshot(oldestSnapshot, account.platform);
        const followerGrowth = followers - oldFollowers;

        return {
          account: {
            id: account._id,
            username: account.username,
            displayName: account.displayName,
            platform: account.platform,
            avatarUrl: account.avatarUrl,
            companyName: account.companyName,
            accountType: account.accountType,
          },
          market: market?.name,
          followers,
          followerGrowth,
          followerGrowthRate:
            oldFollowers > 0
              ? ((followerGrowth / oldFollowers) * 100).toFixed(1)
              : "0",
          postsCount: posts.length,
          postsPerWeek: ((posts.length / daysAgo) * 7).toFixed(1),
          totalLikes,
          totalComments,
          totalViews,
          avgLikesPerPost:
            posts.length > 0 ? Math.round(totalLikes / posts.length) : 0,
          avgCommentsPerPost:
            posts.length > 0 ? Math.round(totalComments / posts.length) : 0,
          engagementRate:
            followers > 0
              ? (((totalLikes + totalComments) / posts.length / followers) * 100).toFixed(
                  2
                )
              : "0",
        };
      })
    );

    // Sort by engagement rate
    comparison.sort(
      (a, b) => parseFloat(b.engagementRate) - parseFloat(a.engagementRate)
    );

    return comparison;
  },
});

// Get content patterns analysis
export const getContentPatterns = query({
  args: {
    marketId: v.optional(v.id("markets")),
    platform: v.optional(
      v.union(v.literal("instagram"), v.literal("tiktok"), v.literal("youtube"))
    ),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysAgo = args.days || 30;
    const cutoffDate = Date.now() - daysAgo * 24 * 60 * 60 * 1000;

    let accounts = await ctx.db
      .query("accounts")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (args.marketId) {
      accounts = accounts.filter((a) => a.marketId === args.marketId);
    }
    if (args.platform) {
      accounts = accounts.filter((a) => a.platform === args.platform);
    }

    const accountIds = new Set(accounts.map((a) => a._id));

    // Get all posts in period
    const posts = await ctx.db
      .query("posts")
      .filter((q) => q.gte(q.field("postedAt"), cutoffDate))
      .collect();

    const filteredPosts = posts.filter((p) => accountIds.has(p.accountId));

    // Aggregate hashtags
    const hashtagCounts: Record<string, { count: number; totalEngagement: number }> =
      {};

    // Posting patterns
    const postsByHour: Record<number, { count: number; totalEngagement: number }> = {};
    const postsByDay: Record<string, { count: number; totalEngagement: number }> = {};
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < 24; i++) postsByHour[i] = { count: 0, totalEngagement: 0 };
    for (const day of days) postsByDay[day] = { count: 0, totalEngagement: 0 };

    // Post type performance
    const postTypePerformance: Record<
      string,
      { count: number; totalLikes: number; totalComments: number; totalViews: number }
    > = {};

    for (const post of filteredPosts) {
      const snapshot = await ctx.db
        .query("postSnapshots")
        .withIndex("by_post", (q) => q.eq("postId", post._id))
        .order("desc")
        .first();

      const engagement = snapshot
        ? snapshot.likesCount + snapshot.commentsCount
        : 0;

      // Hashtag analysis
      for (const hashtag of post.hashtags) {
        const tag = hashtag.toLowerCase();
        if (!hashtagCounts[tag]) {
          hashtagCounts[tag] = { count: 0, totalEngagement: 0 };
        }
        hashtagCounts[tag].count++;
        hashtagCounts[tag].totalEngagement += engagement;
      }

      // Time analysis
      const postDate = new Date(post.postedAt);
      const hour = postDate.getHours();
      const day = days[postDate.getDay()];

      postsByHour[hour].count++;
      postsByHour[hour].totalEngagement += engagement;
      postsByDay[day].count++;
      postsByDay[day].totalEngagement += engagement;

      // Post type analysis
      if (!postTypePerformance[post.postType]) {
        postTypePerformance[post.postType] = {
          count: 0,
          totalLikes: 0,
          totalComments: 0,
          totalViews: 0,
        };
      }
      postTypePerformance[post.postType].count++;
      if (snapshot) {
        postTypePerformance[post.postType].totalLikes += snapshot.likesCount;
        postTypePerformance[post.postType].totalComments += snapshot.commentsCount;
        postTypePerformance[post.postType].totalViews += snapshot.viewsCount || 0;
      }
    }

    // Find best performing hashtags
    const topHashtags = Object.entries(hashtagCounts)
      .map(([tag, data]) => ({
        hashtag: tag,
        count: data.count,
        avgEngagement:
          data.count > 0 ? Math.round(data.totalEngagement / data.count) : 0,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 20);

    // Find best posting times
    const bestHours = Object.entries(postsByHour)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        count: data.count,
        avgEngagement:
          data.count > 0 ? Math.round(data.totalEngagement / data.count) : 0,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);

    const bestDays = Object.entries(postsByDay)
      .map(([day, data]) => ({
        day,
        count: data.count,
        avgEngagement:
          data.count > 0 ? Math.round(data.totalEngagement / data.count) : 0,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);

    // Post type performance summary
    const typePerformance = Object.entries(postTypePerformance).map(
      ([type, data]) => ({
        type,
        count: data.count,
        avgLikes: data.count > 0 ? Math.round(data.totalLikes / data.count) : 0,
        avgComments:
          data.count > 0 ? Math.round(data.totalComments / data.count) : 0,
        avgViews: data.count > 0 ? Math.round(data.totalViews / data.count) : 0,
      })
    );

    return {
      totalPosts: filteredPosts.length,
      topHashtags,
      bestHours,
      bestDays,
      typePerformance,
    };
  },
});

// Get follower growth trends
export const getGrowthTrends = query({
  args: {
    accountId: v.id("accounts"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysAgo = args.days || 30;
    const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Get the account to determine platform
    const account = await ctx.db.get(args.accountId);
    const platform = account?.platform || "instagram";

    const snapshots = await ctx.db
      .query("accountSnapshots")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .filter((q) => q.gte(q.field("snapshotDate"), cutoffDate))
      .collect();

    // Sort by date
    snapshots.sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate));

    return snapshots.map((s) => ({
      date: s.snapshotDate,
      // Use subscribersCount for YouTube, followersCount for others
      followers: getFollowerCountFromSnapshot(s, platform),
      following: s.followingCount,
      posts: s.postsCount,
      // Include YouTube-specific metrics if available
      subscribersCount: (s as any).subscribersCount,
      viewsCount: (s as any).viewsCount,
    }));
  },
});

// Debug query to check account data status
export const getAccountDataStatus = query({
  args: {
    platform: v.optional(
      v.union(v.literal("instagram"), v.literal("tiktok"), v.literal("youtube"))
    ),
  },
  handler: async (ctx, args) => {
    let accounts = await ctx.db
      .query("accounts")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (args.platform) {
      accounts = accounts.filter((a) => a.platform === args.platform);
    }

    const accountsWithData = await Promise.all(
      accounts.map(async (account) => {
        const latestSnapshot = await ctx.db
          .query("accountSnapshots")
          .withIndex("by_account", (q) => q.eq("accountId", account._id))
          .order("desc")
          .first();

        const postsCount = await ctx.db
          .query("posts")
          .withIndex("by_account", (q) => q.eq("accountId", account._id))
          .collect();

        return {
          accountId: account._id,
          username: account.username,
          platform: account.platform,
          hasSnapshot: !!latestSnapshot,
          snapshotDate: latestSnapshot?.snapshotDate,
          followersCount: latestSnapshot?.followersCount ?? 0,
          subscribersCount: (latestSnapshot as any)?.subscribersCount ?? 0,
          postsCountInDb: postsCount.length,
          postsCountInSnapshot: latestSnapshot?.postsCount ?? 0,
          lastScrapedAt: account.lastScrapedAt,
        };
      })
    );

    return accountsWithData;
  },
});

// Get engagement trends for a post
export const getPostEngagementTrend = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const snapshots = await ctx.db
      .query("postSnapshots")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    snapshots.sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate));

    return snapshots.map((s) => ({
      date: s.snapshotDate,
      likes: s.likesCount,
      comments: s.commentsCount,
      views: s.viewsCount,
      shares: s.sharesCount,
    }));
  },
});
