import { v } from "convex/values";
import { action, mutation, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Helper to download and store avatar after processing results
async function downloadAvatarIfNeeded(
  ctx: any,
  accountId: Id<"accounts">,
  avatarUrl: string | undefined
) {
  if (!avatarUrl) return;

  // Skip if URL is already from Convex storage
  if (avatarUrl.includes("convex.cloud")) return;

  try {
    await ctx.runAction(api.avatars.downloadAndStoreAvatar, {
      accountId,
      avatarUrl,
    });
  } catch (error) {
    console.error("Failed to download avatar:", error);
  }
}

function parseDuration(duration: string | number | undefined): number | undefined {
  if (duration === undefined || duration === null) return undefined;
  if (typeof duration === "number") return duration;
  if (typeof duration === "string") {
    const parts = duration.split(":").map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    const num = parseFloat(duration);
    return isNaN(num) ? undefined : num;
  }
  return undefined;
}

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
          videoDuration: parseDuration(item.videoDuration),
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
          videoDuration: parseDuration(item.videoMeta?.duration || item.duration),
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
    let channelUpdated = false;

    // Helper to parse counts from strings like "1.5M" or "1,234"
    const parseCountValue = (val: string | number | undefined): number => {
      if (val === undefined || val === null) return 0;
      if (typeof val === 'number') return val;
      const str = String(val).replace(/,/g, '').replace(/subscribers?/i, '').trim();
      const match = str.match(/([\d.]+)\s*([KMB])?/i);
      if (!match) return 0;
      let num = parseFloat(match[1]);
      const suffix = (match[2] || '').toUpperCase();
      if (suffix === 'K') num *= 1000;
      else if (suffix === 'M') num *= 1000000;
      else if (suffix === 'B') num *= 1000000000;
      return Math.round(num);
    };

    // First pass: collect channel metadata from all items
    // Handles both youtube-channel-scraper and youtube-scraper output formats
    let bestSubscriberCount = 0;
    let bestVideoCount = 0;
    let bestViewCount = 0;
    let channelName = "";
    let channelAvatar = "";
    let channelDescription = "";

    for (const item of args.results) {
      // youtube-channel-scraper fields: subscriberCount, subscriberCountText, numberOfSubscribers
      // Also check: subscribers, subscribersCount, channelSubscribers
      const subCount = parseCountValue(
        item.subscriberCount ||
        item.subscriberCountText ||
        item.numberOfSubscribers ||
        item.subscribers ||
        item.subscribersCount ||
        item.channelSubscribers ||
        item.channelSubscriberCount
      );
      if (subCount > bestSubscriberCount) bestSubscriberCount = subCount;

      // Video count - youtube-channel-scraper uses videoCount or numberOfVideos
      const vidCount = parseCountValue(
        item.videoCount ||
        item.videosCount ||
        item.numberOfVideos ||
        item.videos
      );
      if (vidCount > bestVideoCount) bestVideoCount = vidCount;

      // Total channel views
      const viewCount = parseCountValue(
        item.channelTotalViews ||
        item.viewCount ||
        item.totalViews ||
        item.views ||
        item.channelViews
      );
      if (viewCount > bestViewCount) bestViewCount = viewCount;

      // Channel name - youtube-channel-scraper uses channelName or name
      if (!channelName) {
        channelName = item.channelName || item.channelTitle || item.uploaderName ||
                      item.name || item.title || item.author || "";
      }

      // Channel avatar - youtube-channel-scraper uses avatar or thumbnail
      if (!channelAvatar) {
        channelAvatar = item.channelThumbnail || item.channelAvatar || item.uploaderAvatar ||
                        item.avatar || item.thumbnail || item.profilePicture ||
                        item.avatarUrl || item.profileImageUrl || "";
      }

      // Channel description
      if (!channelDescription) {
        channelDescription = item.channelDescription || item.uploaderDescription ||
                            item.description || item.about || "";
      }
    }

    console.log(`YouTube processing: Found ${args.results.length} items, subscribers=${bestSubscriberCount}, videos=${bestVideoCount}, channelName=${channelName}`);

    // Create/update account snapshot with aggregated channel data
    if (bestSubscriberCount > 0 || bestVideoCount > 0 || channelName) {
      const existingSnapshot = await ctx.db
        .query("accountSnapshots")
        .withIndex("by_account_date", (q) =>
          q.eq("accountId", args.accountId).eq("snapshotDate", today)
        )
        .first();

      if (!existingSnapshot) {
        await ctx.db.insert("accountSnapshots", {
          accountId: args.accountId,
          followersCount: 0, // YouTube doesn't use followers
          followingCount: 0,
          postsCount: bestVideoCount,
          subscribersCount: bestSubscriberCount,
          viewsCount: bestViewCount,
          snapshotDate: today,
          createdAt: Date.now(),
        });
      } else if (bestSubscriberCount > 0) {
        // Update existing snapshot if we have better subscriber data
        await ctx.db.patch(existingSnapshot._id, {
          subscribersCount: bestSubscriberCount,
          postsCount: bestVideoCount || existingSnapshot.postsCount,
          viewsCount: bestViewCount || existingSnapshot.viewsCount,
        });
      }

      // Update account info
      if (channelName || channelAvatar) {
        await ctx.db.patch(args.accountId, {
          ...(channelName && { displayName: channelName }),
          ...(channelDescription && { bio: channelDescription }),
          ...(channelAvatar && { avatarUrl: channelAvatar }),
          lastScrapedAt: Date.now(),
        });
      }

      channelUpdated = true;
    }

    // Second pass: process each video item
    let videosProcessed = 0;
    for (const item of args.results) {
      // Skip if this looks like pure channel data without video info
      // Channel-only items typically have subscriberCount but no video id/url
      const hasVideoIndicators = item.id || item.videoId || item.videoUrl ||
                                 (item.url && (item.url.includes('/watch') || item.url.includes('/shorts')));

      if (!hasVideoIndicators && !item.title) {
        console.log(`Skipping item - no video indicators:`, JSON.stringify(item).substring(0, 200));
        continue;
      }

      // Extract video ID from various possible fields
      let platformPostId = item.id || item.videoId || item.video_id;

      // If no direct ID, try to extract from URL
      if (!platformPostId && item.url) {
        const urlMatch = item.url.match(/(?:v=|\/shorts\/|\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (urlMatch) platformPostId = urlMatch[1];
      }

      // Also try videoUrl field
      if (!platformPostId && item.videoUrl) {
        const urlMatch = item.videoUrl.match(/(?:v=|\/shorts\/|\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (urlMatch) platformPostId = urlMatch[1];
      }

      // Handle video data - must have an ID
      if (platformPostId) {
        const existingPost = await ctx.db
          .query("posts")
          .withIndex("by_platform_post_id", (q) =>
            q.eq("platform", "youtube").eq("platformPostId", platformPostId)
          )
          .first();

        const title = item.title || "";
        const description = item.description || item.text || "";
        const fullText = `${title} ${description}`;
        const hashtags = fullText.match(/#[\w\u0080-\uFFFF]+/g)?.map((h: string) => h.slice(1)) || [];
        const mentions = fullText.match(/@[\w.]+/g)?.map((m: string) => m.slice(1)) || [];

        // Determine if it's a short
        const isShort = item.isShort ||
                       item.type === 'short' ||
                       item.url?.includes("/shorts/") ||
                       (item.duration && typeof item.duration === 'number' && item.duration <= 60);

        // Parse duration - could be seconds, "MM:SS", or "HH:MM:SS"
        const duration = parseDuration(item.duration || item.lengthSeconds);

        // Get thumbnail - various possible field names
        const thumbnailUrl = item.thumbnailUrl ||
                            item.thumbnail ||
                            item.thumbnails?.[0]?.url ||
                            (platformPostId ? `https://img.youtube.com/vi/${platformPostId}/hqdefault.jpg` : undefined);

        // Parse upload date
        let postedAt = Date.now();
        if (item.date) {
          postedAt = new Date(item.date).getTime();
        } else if (item.uploadDate) {
          postedAt = new Date(item.uploadDate).getTime();
        } else if (item.publishedAt) {
          postedAt = new Date(item.publishedAt).getTime();
        }

        const postData = {
          accountId: args.accountId,
          platform: "youtube" as const,
          platformPostId,
          postUrl: item.url || `https://www.youtube.com/watch?v=${platformPostId}`,
          postType: isShort ? "short" as const : "video" as const,
          caption: title,
          hashtags,
          mentions,
          thumbnailUrl,
          mediaUrls: [],
          videoDuration: duration,
          postedAt,
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

        // Parse view/like counts - could be numbers or strings like "1.5M"
        const parseCount = (val: string | number | undefined): number => {
          if (val === undefined || val === null) return 0;
          if (typeof val === 'number') return val;
          const match = String(val).replace(/,/g, '').match(/([\d.]+)([KMB])?/i);
          if (!match) return 0;
          let num = parseFloat(match[1]);
          const suffix = (match[2] || '').toUpperCase();
          if (suffix === 'K') num *= 1000;
          else if (suffix === 'M') num *= 1000000;
          else if (suffix === 'B') num *= 1000000000;
          return Math.round(num);
        };

        // Engagement snapshot
        const existingEngagement = await ctx.db
          .query("postSnapshots")
          .withIndex("by_post_date", (q) =>
            q.eq("postId", postId).eq("snapshotDate", today)
          )
          .first();

        const engagementData = {
          postId,
          likesCount: parseCount(item.likes || item.likeCount || item.likesCount),
          commentsCount: parseCount(item.commentsCount || item.numberOfComments || item.commentCount),
          viewsCount: parseCount(item.viewCount || item.views || item.viewsCount),
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

        videosProcessed++;
      }
    }

    console.log(`YouTube processing complete: ${postsCreated} created, ${postsUpdated} updated, ${videosProcessed} total processed`);
    return { postsCreated, postsUpdated, channelUpdated, subscribersFound: bestSubscriberCount };
  },
});

// ==================== POLL AND PROCESS RUNNING JOBS ====================

export const pollAndProcessJob: ReturnType<typeof action> = action({
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

          // Download and store avatar after processing
          const updatedAccount = await ctx.runQuery(api.accounts.get, { id: job.accountId });
          if (updatedAccount?.avatarUrl) {
            await downloadAvatarIfNeeded(ctx, job.accountId, updatedAccount.avatarUrl);
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
export const pollAllRunningJobs: ReturnType<typeof action> = action({
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
