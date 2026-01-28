import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Platform branding/logos configuration
  platforms: defineTable({
    platformId: v.union(
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("youtube"),
      v.literal("facebook"),
      v.literal("linkedin"),
      v.literal("twitter")
    ),
    displayName: v.string(), // "Instagram", "TikTok", "YouTube"
    // Brand colors
    primaryColor: v.optional(v.string()), // e.g., "#E1306C" for Instagram
    secondaryColor: v.optional(v.string()),
    // Display settings
    isActive: v.boolean(), // Whether to show this platform in the UI
    displayOrder: v.number(), // Order in which to display platforms
    // Visibility toggles for different UI contexts
    showInNavigation: v.optional(v.boolean()),
    showInFilters: v.optional(v.boolean()),
    showInPosts: v.optional(v.boolean()),
    showInCompetitors: v.optional(v.boolean()),
    // Logo selection for each context (references platformLogos._id)
    logoForAvatar: v.optional(v.id("platformLogos")), // Main avatar/icon shown in collapsed view
    logoForNavigation: v.optional(v.id("platformLogos")),
    logoForFilters: v.optional(v.id("platformLogos")),
    logoForPosts: v.optional(v.id("platformLogos")),
    logoForCompetitors: v.optional(v.id("platformLogos")),
    logoForDashboard: v.optional(v.id("platformLogos")),
    logoForJobs: v.optional(v.id("platformLogos")), // Scraping Jobs cards
    logoForRecentJobs: v.optional(v.id("platformLogos")), // Recent Jobs list
    logoForDropdowns: v.optional(v.id("platformLogos")), // Platform dropdowns/selects sitewide
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_platform", ["platformId"]),

  // Platform logos - stores all uploaded logos for each platform
  platformLogos: defineTable({
    platformId: v.union(
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("youtube"),
      v.literal("facebook"),
      v.literal("linkedin"),
      v.literal("twitter")
    ),
    name: v.string(), // User-defined name: "Horizontal", "Icon", "Icon #2", "White", etc.
    storageId: v.id("_storage"), // Convex file storage ID
    mimeType: v.string(), // "image/svg+xml", "image/png", etc.
    fileSize: v.optional(v.number()),
    // Preview metadata
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_platform", ["platformId"])
    .index("by_platform_name", ["platformId", "name"]),

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
    // Multiple phones - accepts both old format (string[]) and new format (object[])
    phones: v.optional(v.array(
      v.union(
        v.string(), // Old format: just the number
        v.object({
          label: v.string(), // "Mobile", "Office", "WhatsApp", etc.
          number: v.string(),
          isWhatsApp: v.optional(v.boolean()),
        })
      )
    )),
    // Location with address line 2
    address: v.optional(v.string()),
    address2: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    // Social handles (including non-monitored platforms) - just the username/handle
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
    // Which linked account's avatar to use as the competitor's display avatar
    displayAvatarAccountId: v.optional(v.id("accounts")),
    isActive: v.boolean(), // Master switch for competitor
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_market", ["marketId"])
    .index("by_type", ["type"])
    .index("by_active", ["isActive"]),

  // Social accounts to track (linked to competitors)
  accounts: defineTable({
    competitorId: v.optional(v.id("competitors")), // Link to parent competitor
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
    isActive: v.boolean(), // Individual account can be paused
    isPaused: v.optional(v.boolean()), // Explicit pause flag (separate from isActive)
    isMainAccount: v.optional(v.boolean()), // Main client account (e.g., Provivienda) - used for Portfolio Reach/Engagement Rate
    createdAt: v.number(),
    lastScrapedAt: v.optional(v.number()),
  })
    .index("by_platform", ["platform"])
    .index("by_market", ["marketId"])
    .index("by_competitor", ["competitorId"])
    .index("by_platform_username", ["platform", "username"])
    .index("by_main_account", ["isMainAccount"]),

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

  // Avatar history - stores all profile pictures with versioning
  avatars: defineTable({
    accountId: v.id("accounts"),
    storageId: v.id("_storage"), // Convex file storage ID
    originalUrl: v.string(), // Original URL from platform
    mimeType: v.string(),
    fileSize: v.optional(v.number()),
    isCurrent: v.boolean(), // Is this the current avatar?
    firstSeenAt: v.number(), // When we first saw this avatar
    lastSeenAt: v.number(), // Last time we saw this avatar in use
    archivedAt: v.optional(v.number()), // When it was replaced
  })
    .index("by_account", ["accountId"])
    .index("by_account_current", ["accountId", "isCurrent"]),

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

  // Schedule settings for automated scraping
  scheduleSettings: defineTable({
    platform: v.union(
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("youtube"),
      v.literal("all") // Global setting
    ),
    isEnabled: v.boolean(),
    frequency: v.union(
      v.literal("hourly"),
      v.literal("every_6_hours"),
      v.literal("every_12_hours"),
      v.literal("daily"),
      v.literal("weekly")
    ),
    preferredHour: v.number(), // 0-23 UTC
    preferredDays: v.optional(v.array(v.number())), // 0-6 (Sun-Sat) for weekly
    lastRunAt: v.optional(v.number()),
    nextScheduledAt: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_platform", ["platform"]),
});
