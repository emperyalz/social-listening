import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    accountId: v.optional(v.id("accounts")),
    platform: v.optional(
      v.union(v.literal("instagram"), v.literal("tiktok"), v.literal("youtube"))
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("posts").order("desc");

    if (args.accountId) {
      q = q.filter((q2) => q2.eq(q2.field("accountId"), args.accountId));
    }
    if (args.platform) {
      q = q.filter((q2) => q2.eq(q2.field("platform"), args.platform));
    }

    const posts = await q.take(args.limit || 50);

    // Get latest snapshot for each post
    const postsWithEngagement = await Promise.all(
      posts.map(async (post) => {
        const latestSnapshot = await ctx.db
          .query("postSnapshots")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .order("desc")
          .first();

        const account = await ctx.db.get(post.accountId);

        return {
          ...post,
          engagement: latestSnapshot,
          account: account
            ? { username: account.username, displayName: account.displayName }
            : null,
        };
      })
    );

    return postsWithEngagement;
  },
});

export const getById = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) return null;

    const account = await ctx.db.get(post.accountId);
    const snapshots = await ctx.db
      .query("postSnapshots")
      .withIndex("by_post", (q) => q.eq("postId", args.id))
      .order("desc")
      .take(30);

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.id))
      .take(100);

    const analysis = await ctx.db
      .query("contentAnalysis")
      .withIndex("by_post", (q) => q.eq("postId", args.id))
      .first();

    return {
      ...post,
      account,
      snapshots,
      comments,
      analysis,
    };
  },
});

export const getByPlatformPostId = query({
  args: {
    platform: v.union(
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("youtube")
    ),
    platformPostId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_platform_post_id", (q) =>
        q.eq("platform", args.platform).eq("platformPostId", args.platformPostId)
      )
      .first();
  },
});

export const create = mutation({
  args: {
    accountId: v.id("accounts"),
    platform: v.union(
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("youtube")
    ),
    platformPostId: v.string(),
    postUrl: v.string(),
    postType: v.union(
      v.literal("image"),
      v.literal("video"),
      v.literal("carousel"),
      v.literal("reel"),
      v.literal("story"),
      v.literal("short"),
      v.literal("live")
    ),
    caption: v.optional(v.string()),
    hashtags: v.array(v.string()),
    mentions: v.array(v.string()),
    thumbnailUrl: v.optional(v.string()),
    mediaUrls: v.array(v.string()),
    videoDuration: v.optional(v.number()),
    postedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if post already exists
    const existing = await ctx.db
      .query("posts")
      .withIndex("by_platform_post_id", (q) =>
        q.eq("platform", args.platform).eq("platformPostId", args.platformPostId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    const now = Date.now();
    return await ctx.db.insert("posts", {
      ...args,
      createdAt: now,
      lastUpdatedAt: now,
    });
  },
});

export const upsert = mutation({
  args: {
    accountId: v.id("accounts"),
    platform: v.union(
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("youtube")
    ),
    platformPostId: v.string(),
    postUrl: v.string(),
    postType: v.union(
      v.literal("image"),
      v.literal("video"),
      v.literal("carousel"),
      v.literal("reel"),
      v.literal("story"),
      v.literal("short"),
      v.literal("live")
    ),
    caption: v.optional(v.string()),
    hashtags: v.array(v.string()),
    mentions: v.array(v.string()),
    thumbnailUrl: v.optional(v.string()),
    mediaUrls: v.array(v.string()),
    videoDuration: v.optional(v.number()),
    postedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("posts")
      .withIndex("by_platform_post_id", (q) =>
        q.eq("platform", args.platform).eq("platformPostId", args.platformPostId)
      )
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        caption: args.caption,
        hashtags: args.hashtags,
        mentions: args.mentions,
        thumbnailUrl: args.thumbnailUrl,
        mediaUrls: args.mediaUrls,
        lastUpdatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("posts", {
      ...args,
      createdAt: now,
      lastUpdatedAt: now,
    });
  },
});

// Record engagement snapshot
export const recordSnapshot = mutation({
  args: {
    postId: v.id("posts"),
    likesCount: v.number(),
    commentsCount: v.number(),
    sharesCount: v.optional(v.number()),
    viewsCount: v.optional(v.number()),
    savesCount: v.optional(v.number()),
    engagementRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];

    // Check if we already have a snapshot for today
    const existing = await ctx.db
      .query("postSnapshots")
      .withIndex("by_post_date", (q) =>
        q.eq("postId", args.postId).eq("snapshotDate", today)
      )
      .first();

    if (existing) {
      // Update existing snapshot
      await ctx.db.patch(existing._id, {
        likesCount: args.likesCount,
        commentsCount: args.commentsCount,
        sharesCount: args.sharesCount,
        viewsCount: args.viewsCount,
        savesCount: args.savesCount,
        engagementRate: args.engagementRate,
      });
      return existing._id;
    }

    return await ctx.db.insert("postSnapshots", {
      ...args,
      snapshotDate: today,
      createdAt: Date.now(),
    });
  },
});

// Get top performing posts
export const getTopPosts = query({
  args: {
    platform: v.optional(
      v.union(v.literal("instagram"), v.literal("tiktok"), v.literal("youtube"))
    ),
    marketId: v.optional(v.id("markets")),
    metric: v.union(
      v.literal("likes"),
      v.literal("comments"),
      v.literal("views"),
      v.literal("engagement")
    ),
    days: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysAgo = args.days || 30;
    const cutoffDate = Date.now() - daysAgo * 24 * 60 * 60 * 1000;

    // Get posts from the time period
    let posts = await ctx.db
      .query("posts")
      .filter((q) => q.gte(q.field("postedAt"), cutoffDate))
      .collect();

    if (args.platform) {
      posts = posts.filter((p) => p.platform === args.platform);
    }

    if (args.marketId) {
      const marketId = args.marketId;
      const accountsInMarket = await ctx.db
        .query("accounts")
        .withIndex("by_market", (q) => q.eq("marketId", marketId))
        .collect();
      const accountIds = new Set(accountsInMarket.map((a) => a._id));
      posts = posts.filter((p) => accountIds.has(p.accountId));
    }

    // Get latest snapshots
    const postsWithEngagement = await Promise.all(
      posts.map(async (post) => {
        const snapshot = await ctx.db
          .query("postSnapshots")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .order("desc")
          .first();

        const account = await ctx.db.get(post.accountId);

        return {
          ...post,
          engagement: snapshot,
          account,
        };
      })
    );

    // Sort by metric
    postsWithEngagement.sort((a, b) => {
      const aVal = a.engagement
        ? args.metric === "likes"
          ? a.engagement.likesCount
          : args.metric === "comments"
            ? a.engagement.commentsCount
            : args.metric === "views"
              ? a.engagement.viewsCount || 0
              : a.engagement.engagementRate || 0
        : 0;
      const bVal = b.engagement
        ? args.metric === "likes"
          ? b.engagement.likesCount
          : args.metric === "comments"
            ? b.engagement.commentsCount
            : args.metric === "views"
              ? b.engagement.viewsCount || 0
              : b.engagement.engagementRate || 0
        : 0;
      return bVal - aVal;
    });

    return postsWithEngagement.slice(0, args.limit || 10);
  },
});

// Get posting frequency stats
export const getPostingStats = query({
  args: {
    accountId: v.id("accounts"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysAgo = args.days || 30;
    const cutoffDate = Date.now() - daysAgo * 24 * 60 * 60 * 1000;

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .filter((q) => q.gte(q.field("postedAt"), cutoffDate))
      .collect();

    // Group by day of week
    const byDayOfWeek: Record<string, number> = {
      Sun: 0,
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
    };
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Group by hour
    const byHour: Record<number, number> = {};
    for (let i = 0; i < 24; i++) byHour[i] = 0;

    for (const post of posts) {
      const date = new Date(post.postedAt);
      byDayOfWeek[days[date.getDay()]]++;
      byHour[date.getHours()]++;
    }

    return {
      totalPosts: posts.length,
      avgPostsPerDay: posts.length / daysAgo,
      byDayOfWeek,
      byHour,
      postTypes: posts.reduce(
        (acc, p) => {
          acc[p.postType] = (acc[p.postType] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  },
});
