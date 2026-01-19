import { action, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";

// Helper to parse duration strings like "1:30" or "PT1M30S"
function parseDuration(duration: string | number | undefined): number | undefined {
  if (duration === undefined || duration === null) return undefined;
  if (typeof duration === "number") return duration;
  if (typeof duration === "string") {
    // Handle "mm:ss" format
    const parts = duration.split(":");
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    // Handle ISO 8601 duration format (PT1M30S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (match) {
      const hours = parseInt(match[1] || "0");
      const minutes = parseInt(match[2] || "0");
      const seconds = parseInt(match[3] || "0");
      return hours * 3600 + minutes * 60 + seconds;
    }
  }
  return undefined;
}

// ==================== INSTAGRAM RESULT PROCESSING ====================
export const processInstagramResults = mutation({
  args: {
    jobId: v.id("scrapingJobs"),
    accountId: v.id("accounts"),
    results: v.any(),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    let postsCreated = 0;
    let postsUpdated = 0;

    // Get the account for username
    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    // Handle Apify results - could be an array directly or nested in results
    const items = Array.isArray(args.results) ? args.results : args.results?.items || [];

    // Process profile data first (if available)
    if (items.length > 0) {
      // Try to find profile data in the first item or look for a dedicated profile item
      const profileData = items.find((item: any) => 
        item.profilePicUrl || item.fullName || item.followersCount !== undefined
      );

      if (profileData) {
        // Update account profile info
        await ctx.db.patch(args.accountId, {
          displayName: profileData.fullName || profileData.name || account.displayName,
          avatarUrl: profileData.profilePicUrl || profileData.profilePicUrlHD || account.avatarUrl,
          bio: profileData.biography || profileData.bio || account.bio,
          lastScrapedAt: Date.now(),
        });

        // Create/update daily snapshot for profile stats
        if (profileData.followersCount !== undefined) {
          const existingSnapshot = await ctx.db
            .query("accountSnapshots")
            .withIndex("by_account_date", (q) =>
              q.eq("accountId", args.accountId).eq("snapshotDate", today)
            )
            .first();

          const snapshotData = {
            accountId: args.accountId,
            followersCount: profileData.followersCount || profileData.followers || 0,
            followingCount: profileData.followingCount || profileData.following || 0,
            postsCount: profileData.postsCount || profileData.posts || 0,
            snapshotDate: today,
          };

          if (existingSnapshot) {
            await ctx.db.patch(existingSnapshot._id, {
              ...snapshotData,
              createdAt: existingSnapshot.createdAt,
            });
          } else {
            await ctx.db.insert("accountSnapshots", {
              ...snapshotData,
              createdAt: Date.now(),
            });
          }
        }
      }
    }

    // Process posts
    for (const item of items) {
      // Skip non-post items (profile data, etc.)
      if (!item.shortCode && !item.id && !item.pk) continue;

      const platformPostId = item.shortCode || item.id || item.pk?.toString();
      if (!platformPostId) continue;

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

      // Build mediaUrls array - include video URL and display images
      const mediaUrls: string[] = [];
      if (item.videoUrl) {
        // Add video URL first for videos/reels
        mediaUrls.push(item.videoUrl);
      }
      // Add display URL (cover/thumbnail for videos) - important for thumbnail display
      if (item.displayUrl && !mediaUrls.includes(item.displayUrl)) {
        mediaUrls.push(item.displayUrl);
      }
      // Add additional images from carousel/sidecar posts
      if (item.images && Array.isArray(item.images)) {
        for (const imgUrl of item.images) {
          if (!mediaUrls.includes(imgUrl)) {
            mediaUrls.push(imgUrl);
          }
        }
      }

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
        mediaUrls,
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

    return { postsCreated, postsUpdated };
  },
});

// ==================== TIKTOK RESULT PROCESSING ====================
export const processTikTokResults = mutation({
  args: {
    jobId: v.id("scrapingJobs"),
    accountId: v.id("accounts"),
    results: v.any(),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    let postsCreated = 0;
    let postsUpdated = 0;

    // Get the account
    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    // Handle Apify results
    const items = Array.isArray(args.results) ? args.results : args.results?.items || [];

    // Process items
    for (const item of items) {
      // Handle author/profile data
      const author = item.author || item.authorMeta;
      if (author) {
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

        // Build mediaUrls array with video and cover images
        const tiktokMediaUrls: string[] = [];
        if (item.videoUrl) {
          tiktokMediaUrls.push(item.videoUrl);
        }
        // Add cover images as fallback thumbnails
        if (item.covers && Array.isArray(item.covers)) {
          tiktokMediaUrls.push(...item.covers);
        } else if (item.cover) {
          tiktokMediaUrls.push(item.cover);
        }

        const postData = {
          accountId: args.accountId,
          platform: "tiktok" as const,
          platformPostId,
          postUrl: item.webVideoUrl || `https://www.tiktok.com/@${account.username}/video/${platformPostId}`,
          postType: "video" as const,
          caption: text,
          hashtags,
          mentions,
          thumbnailUrl: item.covers?.[0] || item.cover || item.originCover,
          mediaUrls: tiktokMediaUrls,
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

        // Create/update engagement snapshot
        const stats = item.stats || item;
        const existingEngagement = await ctx.db
          .query("postSnapshots")
          .withIndex("by_post_date", (q) =>
            q.eq("postId", postId).eq("snapshotDate", today)
          )
          .first();

        const engagementData = {
          postId,
          likesCount: stats.diggCount || stats.likes || 0,
          commentsCount: stats.commentCount || stats.comments || 0,
          sharesCount: stats.shareCount || stats.shares,
          viewsCount: stats.playCount || stats.views,
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

      // Handle profile stats
      if (item.authorStats || item.stats?.followerCount !== undefined) {
        const stats = item.authorStats || item.stats;
        const existingSnapshot = await ctx.db
          .query("accountSnapshots")
          .withIndex("by_account_date", (q) =>
            q.eq("accountId", args.accountId).eq("snapshotDate", today)
          )
          .first();

        const snapshotData = {
          accountId: args.accountId,
          followersCount: stats.followerCount || stats.followers || 0,
          followingCount: stats.followingCount || stats.following || 0,
          postsCount: stats.videoCount || 0,
          snapshotDate: today,
        };

        if (existingSnapshot) {
          await ctx.db.patch(existingSnapshot._id, {
            ...snapshotData,
            createdAt: existingSnapshot.createdAt,
          });
        } else {
          await ctx.db.insert("accountSnapshots", {
            ...snapshotData,
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
    jobId: v.id("scrapingJobs"),
    accountId: v.id("accounts"),
    results: v.any(),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    let postsCreated = 0;
    let postsUpdated = 0;

    // Get the account
    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    // Handle Apify results
    const items = Array.isArray(args.results) ? args.results : args.results?.items || [];

    console.log(`[YouTube] Processing ${items.length} items for account ${account.username}`);

    // First check if we have channel data at the root level
    if (args.results && !Array.isArray(args.results) && (args.results.channelName || args.results.channelDescription)) {
      console.log(`[YouTube] Found channel data at root level for ${args.results.channelName}`);
      await ctx.db.patch(args.accountId, {
        displayName: args.results.channelName || account.displayName,
        bio: args.results.channelDescription || account.bio,
        avatarUrl: args.results.channelProfilePicture || account.avatarUrl,
        lastScrapedAt: Date.now(),
      });

      // Create snapshot if we have subscriber data
      if (args.results.numberOfSubscribers !== undefined) {
        const existingSnapshot = await ctx.db
          .query("accountSnapshots")
          .withIndex("by_account_date", (q) =>
            q.eq("accountId", args.accountId).eq("snapshotDate", today)
          )
          .first();

        const snapshotData = {
          accountId: args.accountId,
          followersCount: args.results.numberOfSubscribers || 0,
          followingCount: 0,
          postsCount: args.results.numberOfVideos || 0,
          snapshotDate: today,
        };

        if (existingSnapshot) {
          await ctx.db.patch(existingSnapshot._id, {
            ...snapshotData,
            createdAt: existingSnapshot.createdAt,
          });
        } else {
          await ctx.db.insert("accountSnapshots", {
            ...snapshotData,
            createdAt: Date.now(),
          });
        }
      }
    }

    // Process video items
    for (const item of items) {
      // Debug log to see what data we're getting
      console.log(`[YouTube] Item keys: ${Object.keys(item).join(", ")}`);
      console.log(`[YouTube] Item id: ${item.id}, videoId: ${item.videoId}, url: ${item.url}`);

      // Check if this is a valid video item
      const hasVideoIndicators = item.id || item.videoId || item.videoUrl || 
                                (item.url && (item.url.includes('/watch?v=') || 
                                             item.url.includes('/shorts/') || 
                                             item.url.includes('youtu.be')));

      // Handle channel data at item level (YouTube scraper sometimes returns channel info in each item)
      if (item.channelName || item.channelDescription) {
        console.log(`[YouTube] Found channel data: ${item.channelName}`);
        await ctx.db.patch(args.accountId, {
          displayName: item.channelName || account.displayName,
          bio: item.channelDescription || account.bio,
          avatarUrl: item.channelProfilePicture || account.avatarUrl,
          lastScrapedAt: Date.now(),
        });
      }

      // Skip non-video items
      if (!hasVideoIndicators) {
        console.log(`[YouTube] Skipping non-video item`);
        continue;
      }

      // Extract video ID from various possible fields
      let platformPostId = item.id || item.videoId;
      
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

      // Special handling for Shorts - they might come with a different structure
      if (!platformPostId && item.title && item.viewCountText) {
        // This might be a shorts item, try the viewUrl or shortUrl
        const shortUrl = item.viewUrl || item.shortUrl || item.url;
        if (shortUrl) {
          const shortMatch = shortUrl.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
          if (shortMatch) platformPostId = shortMatch[1];
        }
      }

      if (!platformPostId) {
        console.log(`[YouTube] Could not extract video ID from item:`, JSON.stringify(item).substring(0, 500));
        continue;
      }

      console.log(`[YouTube] Processing video: ${platformPostId}`);

      const existingPost = await ctx.db
        .query("posts")
        .withIndex("by_platform_post_id", (q) =>
          q.eq("platform", "youtube").eq("platformPostId", platformPostId)
        )
        .first();

      const title = item.title || item.text || "";
      const description = item.description || "";
      const hashtags = (title + " " + description).match(/#[\w\u0080-\uFFFF]+/g)?.map((h: string) => h.slice(1)) || [];
      const mentions = (title + " " + description).match(/@[\w.]+/g)?.map((m: string) => m.slice(1)) || [];

      // Determine post type
      const isShort = item.url?.includes("/shorts/") || item.isShort || 
                      (item.duration && parseDuration(item.duration) && (parseDuration(item.duration) || 0) <= 60);
      const postType = isShort ? "short" : "video";

      // Build the video URL
      const videoUrl = item.url || `https://www.youtube.com/watch?v=${platformPostId}`;

      // Get thumbnail - YouTube videos have predictable thumbnail URLs
      const thumbnailUrl = item.thumbnailUrl || item.thumbnail || 
                          `https://img.youtube.com/vi/${platformPostId}/hqdefault.jpg`;

      const postData = {
        accountId: args.accountId,
        platform: "youtube" as const,
        platformPostId,
        postUrl: item.url || `https://www.youtube.com/watch?v=${platformPostId}`,
        postType: postType as "video" | "short",
        caption: title + (description ? "\n\n" + description : ""),
        hashtags,
        mentions,
        thumbnailUrl,
        mediaUrls: [],
        videoDuration: parseDuration(item.duration),
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
        console.log(`[YouTube] Updated post: ${platformPostId}`);
      } else {
        postId = await ctx.db.insert("posts", {
          ...postData,
          createdAt: Date.now(),
        });
        postsCreated++;
        console.log(`[YouTube] Created post: ${platformPostId}`);
      }

      // Create/update engagement snapshot
      // Handle various view count formats
      let viewCount = item.viewCount || item.views || 0;
      if (typeof viewCount === "string") {
        // Parse "1.2M views" or "1,234 views" format
        viewCount = parseInt(viewCount.replace(/[^\d]/g, "")) || 0;
      }

      let likeCount = item.likes || item.likeCount || 0;
      let commentCount = item.commentsCount || item.numberOfComments || 0;

      const existingEngagement = await ctx.db
        .query("postSnapshots")
        .withIndex("by_post_date", (q) =>
          q.eq("postId", postId).eq("snapshotDate", today)
        )
        .first();

      const engagementData = {
        postId,
        likesCount: likeCount,
        commentsCount: commentCount,
        viewsCount: viewCount,
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

      // Handle profile stats from video items (YouTube sometimes includes channel stats per video)
      if (item.numberOfSubscribers !== undefined) {
        const existingSnapshot = await ctx.db
          .query("accountSnapshots")
          .withIndex("by_account_date", (q) =>
            q.eq("accountId", args.accountId).eq("snapshotDate", today)
          )
          .first();

        const snapshotData = {
          accountId: args.accountId,
          followersCount: item.numberOfSubscribers || 0,
          followingCount: 0,
          postsCount: item.numberOfVideos || 0,
          snapshotDate: today,
        };

        if (existingSnapshot) {
          await ctx.db.patch(existingSnapshot._id, {
            ...snapshotData,
            createdAt: existingSnapshot.createdAt,
          });
        } else {
          await ctx.db.insert("accountSnapshots", {
            ...snapshotData,
            createdAt: Date.now(),
          });
        }
      }
    }

    console.log(`[YouTube] Finished processing: ${postsCreated} created, ${postsUpdated} updated`);
    return { postsCreated, postsUpdated };
  },
});

// ==================== POLLING / STATUS CHECKING ====================
export const pollAllRunningJobs = action({
  args: {},
  handler: async (ctx) => {
    // Get all running jobs
    const runningJobs = await ctx.runQuery(api.scraping.getRunningJobs, {});
    
    const results = [];
    
    for (const job of runningJobs) {
      if (!job.apifyRunId) continue;
      
      try {
        // Check run status from Apify
        const statusResponse = await fetch(
          `https://api.apify.com/v2/actor-runs/${job.apifyRunId}?token=${process.env.APIFY_API_TOKEN}`
        );
        
        if (!statusResponse.ok) {
          console.error(`Failed to fetch status for run ${job.apifyRunId}`);
          continue;
        }
        
        const statusData = await statusResponse.json();
        const status = statusData.data?.status;
        
        if (status === "SUCCEEDED") {
          // Fetch the dataset results
          const datasetId = statusData.data?.defaultDatasetId;
          if (datasetId) {
            const dataResponse = await fetch(
              `https://api.apify.com/v2/datasets/${datasetId}/items?token=${process.env.APIFY_API_TOKEN}`
            );
            
            if (dataResponse.ok) {
              const data = await dataResponse.json();
              
              // Process results based on platform
              if (job.platform === "instagram") {
                await ctx.runMutation(internal.scrapingProcessor.processInstagramResults, {
                  jobId: job._id,
                  accountId: job.accountId,
                  results: data,
                });
              } else if (job.platform === "tiktok") {
                await ctx.runMutation(internal.scrapingProcessor.processTikTokResults, {
                  jobId: job._id,
                  accountId: job.accountId,
                  results: data,
                });
              } else if (job.platform === "youtube") {
                await ctx.runMutation(internal.scrapingProcessor.processYouTubeResults, {
                  jobId: job._id,
                  accountId: job.accountId,
                  results: data,
                });
              }
              
              // Mark job as completed
              await ctx.runMutation(api.scraping.completeJob, {
                jobId: job._id,
                itemsScraped: Array.isArray(data) ? data.length : 0,
              });
              
              results.push({ jobId: job._id, status: "completed", items: Array.isArray(data) ? data.length : 0 });
            }
          }
        } else if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
          // Mark job as failed
          await ctx.runMutation(api.scraping.failJob, {
            jobId: job._id,
            error: `Apify run ${status.toLowerCase()}`,
          });
          results.push({ jobId: job._id, status: "failed", error: status });
        } else {
          // Still running
          results.push({ jobId: job._id, status: "running" });
        }
      } catch (error) {
        console.error(`Error polling job ${job._id}:`, error);
        results.push({ jobId: job._id, status: "error", error: String(error) });
      }
    }
    
    return results;
  },
});

// Export internal mutations for use by actions
export const internal_processInstagramResults = processInstagramResults;
export const internal_processTikTokResults = processTikTokResults;
export const internal_processYouTubeResults = processYouTubeResults;