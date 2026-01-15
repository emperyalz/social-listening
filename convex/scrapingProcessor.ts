import { v } from "convex/values";
import { action, mutation, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const APIFY_BASE_URL = "https://api.apify.com/v2";

// ==================== INSTAGRAM RESULT PROCESSING ====================

export const processInstagramResults = mutation({
  args: {
    accountId: v.id("accounts"),
    results: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) throw new Error("Account not found");

    const today = new Date().toISOString().split("T")[0];
    let postsCreated = 0;
    let postsUpdated = 0;

    for (const item of args.results) {
      // Handle profile data
      if (item.followersCount !== undefined) {
        // Check if snapshot already exists for today
        const existingSnapshot = await ctx.db
          .query("accountSnapshots")
          .withIndex("by_account_date", (q) =>
            q.eq("accountId", args.accountId).eq("snapshotDate", today)
          )
          .first();

        if (!existingSnapshot) {
          await ctx.db.insert("accountSnapshots", {
            accountId: args.accountId,
            followersCount: item.followersCount || 0,
            followingCount: item.followingCount || 0,
            postsCount: item.postsCount || 0,
            snapshotDate: today,
            createdAt: Date.now(),
          });
        }

        // Update account with latest info
        await ctx.db.patch(args.accountId, {
          displayName: item.fullName || item.username,
          bio: item.biography,
          avatarUrl: item.profilePicUrl,
          lastScrapedAt: Date.now(),
        });
      }

      // Handle post data
      if (item.shortCode || item.id) {
        const platformPostId = item.shortCode || item.id;
        
        // Check if post exists
        const existingPost = await ctx.db
          .query("posts")
          .withIndex("by_platform_post_id", (q) =>
            q.eq("platform", "instagram").eq("platformPostId", platformPostId)
          )
          .first();

        // Extract hashtags from caption
        const caption = item.caption || "";
        const hashtags = caption.match(/#[\w\u0080-\uFFFF]+/g)?.map((h: string) => h.slice(1)) || [];
        const mentions = caption.match(/@[\w.]+/g)?.map((m: string) => m.slice(1)) || [];

        // Determine post type
        let postType: "image" | "video" | "carousel" | "reel" = "image";
        if (item.type === "Video" || item.isVideo) postType = "video";
        if (item.type === "Sidecar" || item.childPosts?.length > 0) postType = "carousel";
        if (item.productType === "clips" || item.type === "Reel") postType = "reel";

        const postData = {
          accountId: args.accountId,
          platform: "instagram" as const,
          platformPostId,
          postUrl: item.url || `https://www.instagram.com/p/${platformPostId}/`,
          postType,
          caption,
          hashtags,
          mentions,
          thumbnailUrl: item.displayUrl || item.thumbnailUrl,
          mediaUrls: item.images || (item.displayUrl ? [item.displayUrl] : []),
          videoDuration: item.videoDuration,
          postedAt: item.timestamp ? new Date(item.timestamp).getTime() : Date.now(),
          lastUpdatedAt: Date.now(),
        };

        let postId: Id<"posts">;
        
        if (existingPost) {
          await ctx.db.patch(existingPost._id, {
            ...postData,
            createdAt: existingPost.createdAt,
          });
          postId = existingPost._id;
          postsUpdated++;
        } else {
          postId = await ctx.db.insert("posts", {
            ...postData,
            createdAt: Date.now(),
          });
          postsCreated++;
        }

        // Create/update engagement snapshot
        const existingEngagement = await ctx.db
          .query("postSnapshots")
          .withIndex("by_post_date", (q) =>
            q.eq("postId", postId).eq("snapshotDate", today)
          )
          .first();

        const engagementData = {
          postId,
          likesCount: item.likesCount || 0,
          commentsCount: item.commentsCount || 0,
          viewsCount: item.videoViewCount || item.playCount,
          snapshotDate: today,
        };

        if (existingEngagement) {
          await ctx.db.patch(existingEngagement._id, {
            ...engagementData,
            createdAt: existingEngagement.createdAt,
          });
        } else {
          await ctx.db.insert("postSnapshots", {
            ...engagementData,
            createdAt: Date.now(),
          });
        }
      }
    }

    return { postsCreated, postsUpdated };
  },
});

// ==================== TIKTOK RESULT PROCESSING ====================

export const processTikTokResults = mutation({
  args: {
    accountId: v.id("accounts"),
    results: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) throw new Error("Account not found");

    const today = new Date().toISOString().split("T")[0];
    let postsCreated = 0;
    let postsUpdated = 0;

    for (const item of args.results) {
      // Handle profile/author data
      if (item.authorMeta || item.followerCount !== undefined) {
        const author = item.authorMeta || item;
        
        const existingSnapshot = await ctx.db
          .query("accountSnapshots")
          .withIndex("by_account_date", (q) =>
            q.eq("accountId", args.accountId).eq("snapshotDate", today)
          )
          .first();

        if (!existingSnapshot) {
          await ctx.db.insert("accountSnapshots", {
            accountId: args.accountId,
            followersCount: author.fans || author.followerCount || 0,
            followingCount: author.following || author.followingCount || 0,
            postsCount: author.video || author.videoCount || 0,
            likesCount: author.heart || author.heartCount || 0,
            snapshotDate: today,
            createdAt: Date.now(),
          });
        }

        await ctx.db.patch(args.accountId, {
          displayName: author.nickname || author.name,
          bio: author.signature || author.bio,
          avatarUrl: author.avatar || author.avatarUrl,
          lastScrapedAt: Date.now(),
        });
      }

      // Handle video data
      if (item.id || item.videoId) {
        const platformPostId = item.id || item.videoId;
        
        const existingPost = await ctx.db
          .query("posts")
          .withIndex("by_platform_post_id", (q) =>
            q.eq("platform", "tiktok").eq("platformPostId", platformPostId)
          )
          .first();

        const text = item.text || item.desc || "";
        const hashtags = item.hashtags?.map((h: any) => h.name || h) || 
                        text.match(/#[\w\u0080-\uFFFF]+/g)?.map((h: string) => h.slice(1)) || [];
        const mentions = text.match(/@[\w.]+/g)?.map((m: string) => m.slice(1)) || [];

        const postData = {
          accountId: args.accountId,
          platform: "tiktok" as const,
          platformPostId,
          postUrl: item.webVideoUrl || `https://www.tiktok.com/@${account.username}/video/${platformPostId}`,
          postType: "video" as const,
          caption: text,
          hashtags,
          mentions,
          thumbnailUrl: item.covers?.[0] || item.cover,
          mediaUrls: item.videoUrl ? [item.videoUrl] : [],
          videoDuration: item.videoMeta?.duration || item.duration,
          postedAt: item.createTime ? item.createTime * 1000 : Date.now(),
          lastUpdatedAt: Date.now(),
        };

        let postId: Id<"posts">;
        
        if (existingPost) {
          await ctx.db.patch(existingPost._id, {
            ...postData,
            createdAt: existingPost.createdAt,
          });
          postId = existingPost._id;
          postsUpdated++;
        } else {
          postId = await ctx.db.insert("posts", {
            ...postData,
            createdAt: Date.now(),
          });
          postsCreated++;
        }

        // Engagement snapshot
        const existingEngagement = await ctx.db
          .query("postSnapshots")
          .withIndex("by_post_date", (q) =>
            q.eq("postId", postId).eq("snapshotDate", today)
          )
          .first();

        const engagementData = {
          postId,
          likesCount: item.diggCount || item.likes || 0,
          commentsCount: item.commentCount || item.comments || 0,
          sharesCount: item.shareCount || item.shares,
          viewsCount: item.playCount || item.plays,
          snapshotDate: today,
        };

        if (existingEngagement) {
          await ctx.db.patch(existingEngagement._id, {
            ...engagementData,
            createdAt: existingEngagement.createdAt,
          });
        } else {
          await ctx.db.insert("postSnapshots", {
            ...engagementData,
            createdAt: Date.now(),
          });
        }
      }
    }

    return { postsCreated, postsUpdated };
  },
});

// ==================== YOUTUBE RESULT PROCESSING ====================

export const processYouTubeResults = mutation({
  args: {
    accountId: v.id("accounts"),
    results: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) throw new Error("Account not found");

    const today = new Date().toISOString().split("T")[0];
    let postsCreated = 0;
    let postsUpdated = 0;

    for (const item of args.results) {
      // Handle channel data
      if (item.subscriberCount !== undefined || item.channelName) {
        const existingSnapshot = await ctx.db
          .query("accountSnapshots")
          .withIndex("by_account_date", (q) =>
            q.eq("accountId", args.accountId).eq("snapshotDate", today)
          )
          .first();

        if (!existingSnapshot) {
          await ctx.db.insert("accountSnapshots", {
            accountId: args.accountId,
            followersCount: 0,
            followingCount: 0,
            postsCount: item.videoCount || 0,
            subscribersCount: item.subscriberCount,
            viewsCount: item.viewCount,
            snapshotDate: today,
            createdAt: Date.now(),
          });
        }

        await ctx.db.patch(args.accountId, {
          displayName: item.channelName || item.title,
          bio: item.channelDescription || item.description,
          avatarUrl: item.channelThumbnail || item.thumbnailUrl,
          lastScrapedAt: Date.now(),
        });
      }

      // Handle video data
      if (item.id || item.videoId) {
        const platformPostId = item.id || item.videoId;
        
        const existingPost = await ctx.db
          .query("posts")
          .withIndex("by_platform_post_id", (q) =>
            q.eq("platform", "youtube").eq("platformPostId", platformPostId)
          )
          .first();

        const title = item.title || "";
        const description = item.description || "";
        const fullText = `${title} ${description}`;
        const hashtags = fullText.match(/#[\w\u0080-\uFFFF]+/g)?.map((h: string) => h.slice(1)) || [];
        const mentions = fullText.match(/@[\w.]+/g)?.map((m: string) => m.slice(1)) || [];

        // Determine if it's a short
        const isShort = item.isShort || 
                       item.url?.includes("/shorts/") || 
                       (item.duration && item.duration <= 60);

        const postData = {
          accountId: args.accountId,
          platform: "youtube" as const,
          platformPostId,
          postUrl: item.url || `https://www.youtube.com/watch?v=${platformPostId}`,
          postType: isShort ? "short" as const : "video" as const,
          caption: title,
          hashtags,
          mentions,
          thumbnailUrl: item.thumbnailUrl || item.thumbnail,
          mediaUrls: [],
          videoDuration: item.duration,
          postedAt: item.date ? new Date(item.date).getTime() : Date.now(),
          lastUpdatedAt: Date.now(),
        };

        let postId: Id<"posts">;
        
        if (existingPost) {
          await ctx.db.patch(existingPost._id, {
            ...postData,
            createdAt: existingPost.createdAt,
          });
          postId = existingPost._id;
          postsUpdated++;
        } else {
          postId = await ctx.db.insert("posts", {
            ...postData,
            createdAt: Date.now(),
          });
          postsCreated++;
        }

        // Engagement snapshot
        const existingEngagement = await ctx.db
          .query("postSnapshots")
          .withIndex("by_post_date", (q) =>
            q.eq("postId", postId).eq("snapshotDate", today)
          )
          .first();

        const engagementData = {
          postId,
          likesCount: item.likes || 0,
          commentsCount: item.commentsCount || item.numberOfComments || 0,
          viewsCount: item.viewCount || item.views,
          snapshotDate: today,
        };

        if (existingEngagement) {
          await ctx.db.patch(existingEngagement._id, {
            ...engagementData,
            createdAt: existingEngagement.createdAt,
          });
        } else {
          await ctx.db.insert("postSnapshots", {
            ...engagementData,
            createdAt: Date.now(),
          });
        }
      }
    }

    return { postsCreated, postsUpdated };
  },
});

// ==================== POLL AND PROCESS RUNNING JOBS ====================

export const pollAndProcessJob = action({
  args: {
    jobId: v.id("scrapingJobs"),
  },
  handler: async (ctx, args) => {
    const apiToken = process.env.APIFY_API_TOKEN;
    if (!apiToken) throw new Error("APIFY_API_TOKEN not configured");

    // Get the job
    const job = await ctx.runQuery(api.scraping.getJob, { jobId: args.jobId });
    if (!job || !job.apifyRunId) {
      return { status: "error", message: "Job not found or no run ID" };
    }

    // Check status
    const statusResponse = await fetch(
      `${APIFY_BASE_URL}/actor-runs/${job.apifyRunId}?token=${apiToken}`
    );
    const statusData = await statusResponse.json();

    if (statusData.data.status === "RUNNING") {
      return { status: "running" };
    }

    if (statusData.data.status === "FAILED") {
      await ctx.runMutation(api.scraping.updateJob, {
        jobId: args.jobId,
        status: "failed",
        error: statusData.data.statusMessage || "Apify run failed",
        completedAt: Date.now(),
      });
      return { status: "failed" };
    }

    if (statusData.data.status === "SUCCEEDED") {
      // Fetch results
      const resultsResponse = await fetch(
        `${APIFY_BASE_URL}/actor-runs/${job.apifyRunId}/dataset/items?token=${apiToken}`
      );
      const results = await resultsResponse.json();

      // Process based on platform
      if (job.accountId && results.length > 0) {
        const account = await ctx.runQuery(api.accounts.get, { id: job.accountId });
        
        if (account) {
          let processResult;
          if (job.platform === "instagram") {
            processResult = await ctx.runMutation(api.scrapingProcessor.processInstagramResults, {
              accountId: job.accountId,
              results,
            });
          } else if (job.platform === "tiktok") {
            processResult = await ctx.runMutation(api.scrapingProcessor.processTikTokResults, {
              accountId: job.accountId,
              results,
            });
          } else if (job.platform === "youtube") {
            processResult = await ctx.runMutation(api.scrapingProcessor.processYouTubeResults, {
              accountId: job.accountId,
              results,
            });
          }

          await ctx.runMutation(api.scraping.updateJob, {
            jobId: args.jobId,
            status: "completed",
            completedAt: Date.now(),
            itemsScraped: results.length,
          });

          return { status: "completed", results: processResult, itemCount: results.length };
        }
      }

      // No account or no results
      await ctx.runMutation(api.scraping.updateJob, {
        jobId: args.jobId,
        status: "completed",
        completedAt: Date.now(),
        itemsScraped: results.length,
      });

      return { status: "completed", itemCount: results.length };
    }

    return { status: statusData.data.status };
  },
});

// Poll all running jobs
export const pollAllRunningJobs = action({
  args: {},
  handler: async (ctx) => {
    const runningJobs = await ctx.runQuery(api.scraping.getRunningJobs, {});
    
    const results = [];
    for (const job of runningJobs) {
      try {
        const result = await ctx.runAction(api.scrapingProcessor.pollAndProcessJob, {
          jobId: job._id,
        });
        results.push({ jobId: job._id, ...result });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.push({ jobId: job._id, status: "error", error: errorMessage });
      }
    }
    
    return results;
  },
});
