import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";

// Process Instagram data from Apify
export const ingestInstagramData = mutation({
  args: {
    accountId: v.id("accounts"),
    profileData: v.optional(
      v.object({
        followersCount: v.number(),
        followsCount: v.number(),
        postsCount: v.number(),
        biography: v.optional(v.string()),
        fullName: v.optional(v.string()),
        profilePicUrl: v.optional(v.string()),
      })
    ),
    posts: v.array(
      v.object({
        id: v.string(),
        shortCode: v.string(),
        url: v.string(),
        type: v.string(),
        caption: v.optional(v.string()),
        hashtags: v.array(v.string()),
        mentions: v.array(v.string()),
        likesCount: v.number(),
        commentsCount: v.number(),
        videoViewCount: v.optional(v.number()),
        timestamp: v.string(),
        displayUrl: v.optional(v.string()),
        videoUrl: v.optional(v.string()),
        images: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const results = { postsCreated: 0, postsUpdated: 0, snapshotsCreated: 0 };

    // Update account profile if provided
    if (args.profileData) {
      await ctx.db.patch(args.accountId, {
        displayName: args.profileData.fullName,
        avatarUrl: args.profileData.profilePicUrl,
        bio: args.profileData.biography,
        lastScrapedAt: Date.now(),
      });

      // Record account snapshot
      const existingSnapshot = await ctx.db
        .query("accountSnapshots")
        .withIndex("by_account_date", (q) =>
          q.eq("accountId", args.accountId).eq("snapshotDate", today)
        )
        .first();

      if (!existingSnapshot) {
        await ctx.db.insert("accountSnapshots", {
          accountId: args.accountId,
          followersCount: args.profileData.followersCount,
          followingCount: args.profileData.followsCount,
          postsCount: args.profileData.postsCount,
          snapshotDate: today,
          createdAt: Date.now(),
        });
      }
    }

    // Process posts
    for (const post of args.posts) {
      // Determine post type
      let postType: "image" | "video" | "carousel" | "reel" = "image";
      if (post.type === "Video") postType = "video";
      else if (post.type === "Sidecar") postType = "carousel";
      else if (post.type === "Reel" || post.videoUrl) postType = "reel";

      // Check if post exists
      const existingPost = await ctx.db
        .query("posts")
        .withIndex("by_platform_post_id", (q) =>
          q.eq("platform", "instagram").eq("platformPostId", post.id)
        )
        .first();

      let postId;
      if (existingPost) {
        // Update existing post
        await ctx.db.patch(existingPost._id, {
          caption: post.caption,
          hashtags: post.hashtags,
          mentions: post.mentions,
          lastUpdatedAt: Date.now(),
        });
        postId = existingPost._id;
        results.postsUpdated++;
      } else {
        // Create new post
        const mediaUrls = post.images || [];
        if (post.videoUrl) mediaUrls.push(post.videoUrl);
        if (post.displayUrl && !mediaUrls.includes(post.displayUrl)) {
          mediaUrls.push(post.displayUrl);
        }

        postId = await ctx.db.insert("posts", {
          accountId: args.accountId,
          platform: "instagram",
          platformPostId: post.id,
          postUrl: post.url,
          postType,
          caption: post.caption,
          hashtags: post.hashtags,
          mentions: post.mentions,
          thumbnailUrl: post.displayUrl,
          mediaUrls,
          postedAt: new Date(post.timestamp).getTime(),
          createdAt: Date.now(),
          lastUpdatedAt: Date.now(),
        });
        results.postsCreated++;
      }

      // Record engagement snapshot
      const existingPostSnapshot = await ctx.db
        .query("postSnapshots")
        .withIndex("by_post_date", (q) =>
          q.eq("postId", postId).eq("snapshotDate", today)
        )
        .first();

      if (!existingPostSnapshot) {
        await ctx.db.insert("postSnapshots", {
          postId,
          likesCount: post.likesCount,
          commentsCount: post.commentsCount,
          viewsCount: post.videoViewCount,
          snapshotDate: today,
          createdAt: Date.now(),
        });
        results.snapshotsCreated++;
      }
    }

    return results;
  },
});

// Process TikTok data from Apify
export const ingestTikTokData = mutation({
  args: {
    accountId: v.id("accounts"),
    profileData: v.optional(
      v.object({
        fans: v.number(),
        following: v.number(),
        heart: v.number(),
        video: v.number(),
        nickname: v.optional(v.string()),
        signature: v.optional(v.string()),
        avatarThumb: v.optional(v.string()),
      })
    ),
    videos: v.array(
      v.object({
        id: v.string(),
        webVideoUrl: v.string(),
        desc: v.optional(v.string()),
        hashtags: v.array(v.object({ name: v.string() })),
        mentions: v.optional(v.array(v.string())),
        diggCount: v.number(),
        commentCount: v.number(),
        shareCount: v.number(),
        playCount: v.number(),
        createTime: v.number(),
        coverUrl: v.optional(v.string()),
        videoUrl: v.optional(v.string()),
        duration: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const results = { postsCreated: 0, postsUpdated: 0, snapshotsCreated: 0 };

    // Update account profile
    if (args.profileData) {
      await ctx.db.patch(args.accountId, {
        displayName: args.profileData.nickname,
        avatarUrl: args.profileData.avatarThumb,
        bio: args.profileData.signature,
        lastScrapedAt: Date.now(),
      });

      // Record account snapshot
      const existingSnapshot = await ctx.db
        .query("accountSnapshots")
        .withIndex("by_account_date", (q) =>
          q.eq("accountId", args.accountId).eq("snapshotDate", today)
        )
        .first();

      if (!existingSnapshot) {
        await ctx.db.insert("accountSnapshots", {
          accountId: args.accountId,
          followersCount: args.profileData.fans,
          followingCount: args.profileData.following,
          postsCount: args.profileData.video,
          likesCount: args.profileData.heart,
          snapshotDate: today,
          createdAt: Date.now(),
        });
      }
    }

    // Process videos
    for (const video of args.videos) {
      const hashtags = video.hashtags.map((h) => h.name);

      const existingPost = await ctx.db
        .query("posts")
        .withIndex("by_platform_post_id", (q) =>
          q.eq("platform", "tiktok").eq("platformPostId", video.id)
        )
        .first();

      let postId;
      if (existingPost) {
        await ctx.db.patch(existingPost._id, {
          caption: video.desc,
          hashtags,
          lastUpdatedAt: Date.now(),
        });
        postId = existingPost._id;
        results.postsUpdated++;
      } else {
        const mediaUrls = [];
        if (video.videoUrl) mediaUrls.push(video.videoUrl);

        postId = await ctx.db.insert("posts", {
          accountId: args.accountId,
          platform: "tiktok",
          platformPostId: video.id,
          postUrl: video.webVideoUrl,
          postType: "video",
          caption: video.desc,
          hashtags,
          mentions: video.mentions || [],
          thumbnailUrl: video.coverUrl,
          mediaUrls,
          videoDuration: video.duration,
          postedAt: video.createTime * 1000,
          createdAt: Date.now(),
          lastUpdatedAt: Date.now(),
        });
        results.postsCreated++;
      }

      // Record engagement snapshot
      const existingPostSnapshot = await ctx.db
        .query("postSnapshots")
        .withIndex("by_post_date", (q) =>
          q.eq("postId", postId).eq("snapshotDate", today)
        )
        .first();

      if (!existingPostSnapshot) {
        await ctx.db.insert("postSnapshots", {
          postId,
          likesCount: video.diggCount,
          commentsCount: video.commentCount,
          sharesCount: video.shareCount,
          viewsCount: video.playCount,
          snapshotDate: today,
          createdAt: Date.now(),
        });
        results.snapshotsCreated++;
      }
    }

    return results;
  },
});

// Process YouTube data from Apify
export const ingestYouTubeData = mutation({
  args: {
    accountId: v.id("accounts"),
    channelData: v.optional(
      v.object({
        subscriberCount: v.number(),
        videoCount: v.number(),
        viewCount: v.number(),
        channelName: v.optional(v.string()),
        description: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
      })
    ),
    videos: v.array(
      v.object({
        id: v.string(),
        url: v.string(),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        viewCount: v.number(),
        likes: v.number(),
        commentsCount: v.number(),
        date: v.string(),
        thumbnailUrl: v.optional(v.string()),
        duration: v.optional(v.string()),
        isShort: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const results = { postsCreated: 0, postsUpdated: 0, snapshotsCreated: 0 };

    // Update channel profile
    if (args.channelData) {
      await ctx.db.patch(args.accountId, {
        displayName: args.channelData.channelName,
        avatarUrl: args.channelData.thumbnailUrl,
        bio: args.channelData.description,
        lastScrapedAt: Date.now(),
      });

      // Record account snapshot
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
          postsCount: args.channelData.videoCount,
          subscribersCount: args.channelData.subscriberCount,
          viewsCount: args.channelData.viewCount,
          snapshotDate: today,
          createdAt: Date.now(),
        });
      }
    }

    // Process videos
    for (const video of args.videos) {
      // Extract hashtags from description
      const hashtagRegex = /#(\w+)/g;
      const hashtags: string[] = [];
      let match;
      const descText = video.description || "";
      while ((match = hashtagRegex.exec(descText)) !== null) {
        hashtags.push(match[1]);
      }

      const existingPost = await ctx.db
        .query("posts")
        .withIndex("by_platform_post_id", (q) =>
          q.eq("platform", "youtube").eq("platformPostId", video.id)
        )
        .first();

      let postId;
      if (existingPost) {
        await ctx.db.patch(existingPost._id, {
          caption: video.title,
          hashtags,
          lastUpdatedAt: Date.now(),
        });
        postId = existingPost._id;
        results.postsUpdated++;
      } else {
        // Parse duration (PT4M13S -> seconds)
        let durationSeconds: number | undefined;
        if (video.duration) {
          const durationMatch = video.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
          if (durationMatch) {
            const hours = parseInt(durationMatch[1] || "0");
            const minutes = parseInt(durationMatch[2] || "0");
            const seconds = parseInt(durationMatch[3] || "0");
            durationSeconds = hours * 3600 + minutes * 60 + seconds;
          }
        }

        postId = await ctx.db.insert("posts", {
          accountId: args.accountId,
          platform: "youtube",
          platformPostId: video.id,
          postUrl: video.url,
          postType: video.isShort ? "short" : "video",
          caption: video.title,
          hashtags,
          mentions: [],
          thumbnailUrl: video.thumbnailUrl,
          mediaUrls: [],
          videoDuration: durationSeconds,
          postedAt: new Date(video.date).getTime(),
          createdAt: Date.now(),
          lastUpdatedAt: Date.now(),
        });
        results.postsCreated++;
      }

      // Record engagement snapshot
      const existingPostSnapshot = await ctx.db
        .query("postSnapshots")
        .withIndex("by_post_date", (q) =>
          q.eq("postId", postId).eq("snapshotDate", today)
        )
        .first();

      if (!existingPostSnapshot) {
        await ctx.db.insert("postSnapshots", {
          postId,
          likesCount: video.likes,
          commentsCount: video.commentsCount,
          viewsCount: video.viewCount,
          snapshotDate: today,
          createdAt: Date.now(),
        });
        results.snapshotsCreated++;
      }
    }

    return results;
  },
});

// Ingest comments
export const ingestComments = mutation({
  args: {
    postId: v.id("posts"),
    comments: v.array(
      v.object({
        id: v.string(),
        text: v.string(),
        ownerUsername: v.string(),
        ownerFullName: v.optional(v.string()),
        likesCount: v.number(),
        repliesCount: v.optional(v.number()),
        timestamp: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    let created = 0;

    for (const comment of args.comments) {
      const existing = await ctx.db
        .query("comments")
        .withIndex("by_platform_id", (q) =>
          q.eq("platformCommentId", comment.id)
        )
        .first();

      if (!existing) {
        await ctx.db.insert("comments", {
          postId: args.postId,
          platformCommentId: comment.id,
          authorUsername: comment.ownerUsername,
          authorDisplayName: comment.ownerFullName,
          text: comment.text,
          likesCount: comment.likesCount,
          repliesCount: comment.repliesCount,
          isReply: false,
          postedAt: comment.timestamp,
          createdAt: Date.now(),
        });
        created++;
      }
    }

    return { created };
  },
});
