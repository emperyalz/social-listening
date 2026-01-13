import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Markets we're tracking (Panama City, CDMX, Bogota, etc.)
  markets: defineTable({
    name: v.string(),
    country: v.string(),
    state: v.optional(v.string()),
    city: v.string(),
    timezone: v.string(),
    isActive: v.boolean(),
  }).index("by_active", ["isActive"]),

  // Competitors (the business/person entity)
  competitors: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("brokerage"),
      v.literal("individual_broker"),
      v.literal("developer"),
      v.literal("property_manager"),
      v.literal("investor"),
      v.literal("other")
    ),
    marketId: v.id("markets"),
    // Contact info
    website: v.optional(v.string()),
    email: v.optional(v.string()),
    phones: v.optional(v.array(v.string())),
    // Location
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    // Social handles (including non-monitored platforms)
    socialHandles: v.optional(v.object({
      instagram: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      youtube: v.optional(v.string()),
      facebook: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      twitter: v.optional(v.string()),
    })),
    // Metadata
    notes: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_market", ["marketId"])
    .index("by_type", ["type"])
    .index("by_active", ["isActive"]),

  // Social accounts to track (linked to competitors)
  accounts: defineTable({
    competitorId: v.optional(v.id("competitors")), // New: link to parent competitor
    platform: v.union(
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("youtube")
    ),
    username: v.string(),
    displayName: v.optional(v.string()),
    profileUrl: v.string(),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    marketId: v.id("markets"), // Keep for backwards compatibility
    // Metadata
    companyName: v.optional(v.string()),
    accountType: v.union(
      v.literal("brokerage"),
      v.literal("individual_broker"),
      v.literal("developer"),
      v.literal("other")
    ),
    isActive: v.boolean(),
    createdAt: v.number(),
    lastScrapedAt: v.optional(v.number()),
  })
    .index("by_platform", ["platform"])
    .index("by_market", ["marketId"])
    .index("by_competitor", ["competitorId"])
    .index("by_platform_username", ["platform", "username"]),

  // Follower/Following snapshots (tracked daily)
  accountSnapshots: defineTable({
    accountId: v.id("accounts"),
    followersCount: v.number(),
    followingCount: v.number(),
    postsCount: v.number(),
    // Platform-specific
    likesCount: v.optional(v.number()), // TikTok total likes
    subscribersCount: v.optional(v.number()), // YouTube subscribers
    viewsCount: v.optional(v.number()), // YouTube total views
    snapshotDate: v.string(), // YYYY-MM-DD
    createdAt: v.number(),
  })
    .index("by_account", ["accountId"])
    .index("by_account_date", ["accountId", "snapshotDate"]),

  // Individual posts/videos
  posts: defineTable({
    accountId: v.id("accounts"),
    platform: v.union(
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("youtube")
    ),
    platformPostId: v.string(), // Native ID from platform
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
    // Content
    caption: v.optional(v.string()),
    hashtags: v.array(v.string()),
    mentions: v.array(v.string()),
    // Media
    thumbnailUrl: v.optional(v.string()),
    mediaUrls: v.array(v.string()),
    videoDuration: v.optional(v.number()), // seconds
    // Timestamps
    postedAt: v.number(),
    createdAt: v.number(),
    lastUpdatedAt: v.number(),
  })
    .index("by_account", ["accountId"])
    .index("by_platform_post_id", ["platform", "platformPostId"])
    .index("by_posted_at", ["postedAt"]),

  // Engagement snapshots per post (tracked daily)
  postSnapshots: defineTable({
    postId: v.id("posts"),
    likesCount: v.number(),
    commentsCount: v.number(),
    sharesCount: v.optional(v.number()),
    viewsCount: v.optional(v.number()),
    savesCount: v.optional(v.number()),
    // Calculated metrics
    engagementRate: v.optional(v.number()),
    snapshotDate: v.string(), // YYYY-MM-DD
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_post_date", ["postId", "snapshotDate"]),

  // Comments on posts
  comments: defineTable({
    postId: v.id("posts"),
    platformCommentId: v.string(),
    authorUsername: v.string(),
    authorDisplayName: v.optional(v.string()),
    text: v.string(),
    likesCount: v.number(),
    repliesCount: v.optional(v.number()),
    isReply: v.boolean(),
    parentCommentId: v.optional(v.id("comments")),
    postedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_platform_id", ["platformCommentId"]),

  // Users who liked/commented (for analysis)
  engagers: defineTable({
    postId: v.id("posts"),
    username: v.string(),
    platform: v.union(
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("youtube")
    ),
    engagementType: v.union(
      v.literal("like"),
      v.literal("comment"),
      v.literal("share")
    ),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_username", ["username"]),

  // AI-generated content analysis
  contentAnalysis: defineTable({
    postId: v.id("posts"),
    // Scene analysis
    hasExteriorShot: v.boolean(),
    hasInteriorShot: v.boolean(),
    hasPeoplePresent: v.boolean(),
    peopleCount: v.optional(v.number()),
    // Property type
    propertyType: v.optional(
      v.union(
        v.literal("condo"),
        v.literal("house"),
        v.literal("apartment"),
        v.literal("penthouse"),
        v.literal("commercial"),
        v.literal("land"),
        v.literal("other")
      )
    ),
    // Production quality
    productionQuality: v.union(
      v.literal("professional"),
      v.literal("semi_professional"),
      v.literal("amateur")
    ),
    hasMusic: v.boolean(),
    hasVoiceover: v.boolean(),
    hasTextOverlay: v.boolean(),
    // Content elements
    showsPrice: v.boolean(),
    showsLocation: v.boolean(),
    showsAmenities: v.boolean(),
    // AI confidence
    analysisConfidence: v.number(),
    rawAnalysis: v.optional(v.string()),
    analyzedAt: v.number(),
  }).index("by_post", ["postId"]),

  // Scraping jobs tracking
  scrapingJobs: defineTable({
    platform: v.union(
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("youtube")
    ),
    jobType: v.union(
      v.literal("profile"),
      v.literal("posts"),
      v.literal("comments"),
      v.literal("engagers")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    apifyRunId: v.optional(v.string()),
    accountId: v.optional(v.id("accounts")),
    marketId: v.optional(v.id("markets")),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    itemsScraped: v.optional(v.number()),
    error: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_platform", ["platform"]),

  // Aggregated insights (computed daily)
  insights: defineTable({
    accountId: v.id("accounts"),
    period: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),
    periodDate: v.string(), // YYYY-MM-DD or YYYY-WW or YYYY-MM
    // Volume metrics
    postsPublished: v.number(),
    totalLikes: v.number(),
    totalComments: v.number(),
    totalViews: v.optional(v.number()),
    // Averages
    avgLikesPerPost: v.number(),
    avgCommentsPerPost: v.number(),
    avgEngagementRate: v.number(),
    // Growth
    followerGrowth: v.number(),
    followerGrowthRate: v.number(),
    // Best performing
    bestPostId: v.optional(v.id("posts")),
    bestPostingHour: v.optional(v.number()),
    bestPostingDay: v.optional(v.string()),
    // Content patterns
    topHashtags: v.array(v.string()),
    avgVideoDuration: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_account_period", ["accountId", "period"])
    .index("by_account_date", ["accountId", "periodDate"]),
});
