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
          website: v.optional(v.string()),
          email: v.optional(v.string()),
          phones: v.optional(v.array(
                  v.union(
                            v.string(),
                            v.object({
                                        label: v.string(),
                                        number: v.string(),
                                        isWhatsApp: v.optional(v.boolean()),
                            })
                          )
                )),
          address: v.optional(v.string()),
          address2: v.optional(v.string()),
          city: v.optional(v.string()),
          state: v.optional(v.string()),
          country: v.optional(v.string()),
          socialHandles: v.optional(v.object({
                  instagram: v.optional(v.string()),
                  tiktok: v.optional(v.string()),
                  youtube: v.optional(v.string()),
                  facebook: v.optional(v.string()),
                  linkedin: v.optional(v.string()),
                  twitter: v.optional(v.string()),
          })),
          notes: v.optional(v.string()),
          logoUrl: v.optional(v.string()),
          isActive: v.boolean(),
          createdAt: v.number(),
          updatedAt: v.optional(v.number()),
    })
      .index("by_market", ["marketId"])
      .index("by_type", ["type"])
      .index("by_active", ["isActive"]),

    accounts: defineTable({
          competitorId: v.optional(v.id("competitors")),
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
          marketId: v.id("markets"),
          companyName: v.optional(v.string()),
          accountType: v.union(
                  v.literal("brokerage"),
                  v.literal("individual_broker"),
                  v.literal("developer"),
                  v.literal("other")
                ),
          isActive: v.boolean(),
          isPaused: v.optional(v.boolean()),
          createdAt: v.number(),
          lastScrapedAt: v.optional(v.number()),
    })
      .index("by_platform", ["platform"])
      .index("by_market", ["marketId"])
      .index("by_competitor", ["competitorId"])
      .index("by_platform_username", ["platform", "username"]),

    accountSnapshots: defineTable({
          accountId: v.id("accounts"),
          followersCount: v.number(),
          followingCount: v.number(),
          postsCount: v.number(),
          likesCount: v.optional(v.number()),
          subscribersCount: v.optional(v.number()),
          viewsCount: v.optional(v.number()),
          snapshotDate: v.string(),
          createdAt: v.number(),
    })
      .index("by_account", ["accountId"])
      .index("by_account_date", ["accountId", "snapshotDate"]),

    posts: defineTable({
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
          createdAt: v.number(),
          lastUpdatedAt: v.number(),
    })
      .index("by_account", ["accountId"])
      .index("by_platform_post_id", ["platform", "platformPostId"])
      .index("by_posted_at", ["postedAt"]),

    postSnapshots: defineTable({
          postId: v.id("posts"),
          likesCount: v.number(),
          commentsCount: v.number(),
          sharesCount: v.optional(v.number()),
          viewsCount: v.optional(v.number()),
          savesCount: v.optional(v.number()),
          engagementRate: v.optional(v.number()),
          snapshotDate: v.string(),
          createdAt: v.number(),
    })
      .index("by_post", ["postId"])
      .index("by_post_date", ["postId", "snapshotDate"]),

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

    contentAnalysis: defineTable({
          postId: v.id("posts"),
          hasExteriorShot: v.boolean(),
          hasInteriorShot: v.boolean(),
          hasPeoplePresent: v.boolean(),
          peopleCount: v.optional(v.number()),
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
          productionQuality: v.union(
                  v.literal("professional"),
                  v.literal("semi_professional"),
                  v.literal("amateur")
                ),
          hasMusic: v.boolean(),
          hasVoiceover: v.boolean(),
          hasTextOverlay: v.boolean(),
          showsPrice: v.boolean(),
          showsLocation: v.boolean(),
          showsAmenities: v.boolean(),
          analysisConfidence: v.number(),
          rawAnalysis: v.optional(v.string()),
          analyzedAt: v.number(),
    }).index("by_post", ["postId"]),

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

    avatars: defineTable({
          accountId: v.id("accounts"),
          storageId: v.id("_storage"),
          originalUrl: v.string(),
          mimeType: v.string(),
          fileSize: v.optional(v.number()),
          isCurrent: v.boolean(),
          firstSeenAt: v.number(),
          lastSeenAt: v.number(),
          archivedAt: v.optional(v.number()),
    })
      .index("by_account", ["accountId"])
      .index("by_account_current", ["accountId", "isCurrent"]),

    insights: defineTable({
          accountId: v.id("accounts"),
          period: v.union(
                  v.literal("daily"),
                  v.literal("weekly"),
                  v.literal("monthly")
                ),
          periodDate: v.string(),
          postsPublished: v.number(),
          totalLikes: v.number(),
          totalComments: v.number(),
          totalViews: v.optional(v.number()),
          avgLikesPerPost: v.number(),
          avgCommentsPerPost: v.number(),
          avgEngagementRate: v.number(),
          followerGrowth: v.number(),
          followerGrowthRate: v.number(),
          bestPostId: v.optional(v.id("posts")),
          bestPostingHour: v.optional(v.number()),
          bestPostingDay: v.optional(v.string()),
          topHashtags: v.array(v.string()),
          avgVideoDuration: v.optional(v.number()),
          createdAt: v.number(),
    })
      .index("by_account_period", ["accountId", "ipmeproirotd "{] )d
e f i n e.Sicnhdeemxa(," bdye_faicnceoTuanbtl_ed a}t ef"r,o m[ ""accocnovuenxt/Isde"r,v e"rp"e;r
  iiomdpDoartte "{] )v, 
}} )f;rom "convex/values";

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
          website: v.optional(v.string()),
          email: v.optional(v.string()),
          phones: v.optional(v.array(
                  v.union(
                            v.string(),
                            v.object({
                                        label: v.string(),
                                        number: v.string(),
                                        isWhatsApp: v.optional(v.boolean()),
                            })
                          )
                )),
          address: v.optional(v.string()),
          address2: v.optional(v.string()),
          city: v.optional(v.string()),
          state: v.optional(v.string()),
          country: v.optional(v.string()),
          socialHandles: v.optional(v.object({
                  instagram: v.optional(v.string()),
                  tiktok: v.optional(v.string()),
                  youtube: v.optional(v.string()),
                  facebook: v.optional(v.string()),
                  linkedin: v.optional(v.string()),
                  twitter: v.optional(v.string()),
          })),
          notes: v.optional(v.string()),
          logoUrl: v.optional(v.string()),
          isActive: v.boolean(),
          createdAt: v.number(),
          updatedAt: v.optional(v.number()),
    })
      .index("by_market", ["marketId"])
      .index("by_type", ["type"])
      .index("by_active", ["isActive"]),

    accounts: defineTable({
          competitorId: v.optional(v.id("competitors")),
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
          marketId: v.id("markets"),
          companyName: v.optional(v.string()),
          accountType: v.union(
                  v.literal("brokerage"),
                  v.literal("individual_broker"),
                  v.literal("developer"),
                  v.literal("other")
                ),
          isActive: v.boolean(),
          isPaused: v.optional(v.boolean()),
          createdAt: v.number(),
          lastScrapedAt: v.optional(v.number()),
    })
      .index("by_platform", ["platform"])
      .index("by_market", ["marketId"])
      .index("by_competitor", ["competitorId"])
      .index("by_platform_username", ["platform", "username"]),

    accountSnapshots: defineTable({
          accountId: v.id("accounts"),
          followersCount: v.number(),
          followingCount: v.number(),
          postsCount: v.number(),
          likesCount: v.optional(v.number()),
          subscribersCount: v.optional(v.number()),
          viewsCount: v.optional(v.number()),
          snapshotDate: v.string(),
          createdAt: v.number(),
    })
      .index("by_account", ["accountId"])
      .index("by_account_date", ["accountId", "snapshotDate"]),

    posts: defineTable({
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
          createdAt: v.number(),
          lastUpdatedAt: v.number(),
    })
      .index("by_account", ["accountId"])
      .index("by_platform_post_id", ["platform", "platformPostId"])
      .index("by_posted_at", ["postedAt"]),

    postSnapshots: defineTable({
          postId: v.id("posts"),
          likesCount: v.number(),
          commentsCount: v.number(),
          sharesCount: v.optional(v.number()),
          viewsCount: v.optional(v.number()),
          savesCount: v.optional(v.number()),
          engagementRate: v.optional(v.number()),
          snapshotDate: v.string(),
          createdAt: v.number(),
    })
      .index("by_post", ["postId"])
      .index("by_post_date", ["postId", "snapshotDate"]),

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

    contentAnalysis: defineTable({
          postId: v.id("posts"),
          hasExteriorShot: v.boolean(),
          hasInteriorShot: v.boolean(),
          hasPeoplePresent: v.boolean(),
          peopleCount: v.optional(v.number()),
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
          productionQuality: v.union(
                  v.literal("professional"),
                  v.literal("semi_professional"),
                  v.literal("amateur")
                ),
          hasMusic: v.boolean(),
          hasVoiceover: v.boolean(),
          hasTextOverlay: v.boolean(),
          showsPrice: v.boolean(),
          showsLocation: v.boolean(),
          showsAmenities: v.boolean(),
          analysisConfidence: v.number(),
          rawAnalysis: v.optional(v.string()),
          analyzedAt: v.number(),
    }).index("by_post", ["postId"]),

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

    avatars: defineTable({
          accountId: v.id("accounts"),
          storageId: v.id("_storage"),
          originalUrl: v.string(),
          mimeType: v.string(),
          fileSize: v.optional(v.number()),
          isCurrent: v.boolean(),
          firstSeenAt: v.number(),
          lastSeenAt: v.number(),
          archivedAt: v.optional(v.number()),
    })
      .index("by_account", ["accountId"])
      .index("by_account_current", ["accountId", "isCurrent"]),

    insights: defineTable({
          accountId: v.id("accounts"),
          period: v.union(
                  v.literal("daily"),
                  v.literal("weekly"),
                  v.literal("monthly")
                ),
          periodDate: v.string(),
          postsPublished: v.number(),
          totalLikes: v.number(),
          totalComments: v.number(),
          totalViews: v.optional(v.number()),
          avgLikesPerPost: v.number(),
          avgCommentsPerPost: v.number(),
          avgEngagementRate: v.number(),
          followerGrowth: v.number(),
          followerGrowthRate: v.number(),
          bestPostId: v.optional(v.id("posts")),
          bestPostingHour: v.optional(v.number()),
          bestPostingDay: v.optional(v.string()),
          topHashtags: v.array(v.string()),
          avgVideoDuration: v.optional(v.number()),
          createdAt: v.number(),
    })
      .index("by_account_period", ["accountId", "period"])
      .index("by_account_date", ["accountId", "periodDate"]),
});
