import { v } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

const APIFY_BASE_URL = "https://api.apify.com/v2";

// Actor IDs
const ACTORS = {
  instagram: "apify/instagram-scraper",
  instagramComments: "apify/instagram-comment-scraper",
  tiktok: "clockworks/tiktok-scraper",
  youtube: "streamers/youtube-scraper",
};

// Create a scraping job record
export const createJob = mutation({
  args: {
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
    accountId: v.optional(v.id("accounts")),
    marketId: v.optional(v.id("markets")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scrapingJobs", {
      ...args,
      status: "pending",
      startedAt: Date.now(),
    });
  },
});

export const updateJob = mutation({
  args: {
    jobId: v.id("scrapingJobs"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
    apifyRunId: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    itemsScraped: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { jobId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(jobId, filtered);
  },
});

export const getRecentJobs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scrapingJobs")
      .order("desc")
      .take(args.limit || 20);
  },
});

// ==================== INSTAGRAM SCRAPING ====================

export const scrapeInstagramProfile = action({
  args: {
    username: v.string(),
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    const apiToken = process.env.APIFY_API_TOKEN;
    if (!apiToken) throw new Error("APIFY_API_TOKEN not configured");

    // Create job record
    const jobId = await ctx.runMutation(internal.scraping.createJob, {
      platform: "instagram",
      jobType: "profile",
      accountId: args.accountId,
    });

    try {
      // Run the actor
      const response = await fetch(
        `${APIFY_BASE_URL}/acts/${encodeURIComponent(ACTORS.instagram)}/runs?token=${apiToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usernames: [args.username],
            resultsType: "details",
            resultsLimit: 50,
            searchType: "user",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Apify API error: ${response.statusText}`);
      }

      const runData = await response.json();

      await ctx.runMutation(internal.scraping.updateJob, {
        jobId,
        status: "running",
        apifyRunId: runData.data.id,
      });

      return { jobId, runId: runData.data.id };
    } catch (error: any) {
      await ctx.runMutation(internal.scraping.updateJob, {
        jobId,
        status: "failed",
        error: error.message,
        completedAt: Date.now(),
      });
      throw error;
    }
  },
});

export const scrapeInstagramPosts = action({
  args: {
    username: v.string(),
    accountId: v.id("accounts"),
    postsLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiToken = process.env.APIFY_API_TOKEN;
    if (!apiToken) throw new Error("APIFY_API_TOKEN not configured");

    const jobId = await ctx.runMutation(internal.scraping.createJob, {
      platform: "instagram",
      jobType: "posts",
      accountId: args.accountId,
    });

    try {
      const response = await fetch(
        `${APIFY_BASE_URL}/acts/${encodeURIComponent(ACTORS.instagram)}/runs?token=${apiToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usernames: [args.username],
            resultsType: "posts",
            resultsLimit: args.postsLimit || 30,
            searchType: "user",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Apify API error: ${response.statusText}`);
      }

      const runData = await response.json();

      await ctx.runMutation(internal.scraping.updateJob, {
        jobId,
        status: "running",
        apifyRunId: runData.data.id,
      });

      return { jobId, runId: runData.data.id };
    } catch (error: any) {
      await ctx.runMutation(internal.scraping.updateJob, {
        jobId,
        status: "failed",
        error: error.message,
        completedAt: Date.now(),
      });
      throw error;
    }
  },
});

// ==================== TIKTOK SCRAPING ====================

export const scrapeTikTokProfile = action({
  args: {
    username: v.string(),
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    const apiToken = process.env.APIFY_API_TOKEN;
    if (!apiToken) throw new Error("APIFY_API_TOKEN not configured");

    const jobId = await ctx.runMutation(internal.scraping.createJob, {
      platform: "tiktok",
      jobType: "profile",
      accountId: args.accountId,
    });

    try {
      const response = await fetch(
        `${APIFY_BASE_URL}/acts/${encodeURIComponent(ACTORS.tiktok)}/runs?token=${apiToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profiles: [args.username],
            resultsPerPage: 30,
            shouldDownloadVideos: false,
            shouldDownloadCovers: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Apify API error: ${response.statusText}`);
      }

      const runData = await response.json();

      await ctx.runMutation(internal.scraping.updateJob, {
        jobId,
        status: "running",
        apifyRunId: runData.data.id,
      });

      return { jobId, runId: runData.data.id };
    } catch (error: any) {
      await ctx.runMutation(internal.scraping.updateJob, {
        jobId,
        status: "failed",
        error: error.message,
        completedAt: Date.now(),
      });
      throw error;
    }
  },
});

// ==================== YOUTUBE SCRAPING ====================

export const scrapeYouTubeChannel = action({
  args: {
    channelUrl: v.string(),
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    const apiToken = process.env.APIFY_API_TOKEN;
    if (!apiToken) throw new Error("APIFY_API_TOKEN not configured");

    const jobId = await ctx.runMutation(internal.scraping.createJob, {
      platform: "youtube",
      jobType: "profile",
      accountId: args.accountId,
    });

    try {
      const response = await fetch(
        `${APIFY_BASE_URL}/acts/${encodeURIComponent(ACTORS.youtube)}/runs?token=${apiToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startUrls: [{ url: args.channelUrl }],
            maxResults: 50,
            maxResultsShorts: 20,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Apify API error: ${response.statusText}`);
      }

      const runData = await response.json();

      await ctx.runMutation(internal.scraping.updateJob, {
        jobId,
        status: "running",
        apifyRunId: runData.data.id,
      });

      return { jobId, runId: runData.data.id };
    } catch (error: any) {
      await ctx.runMutation(internal.scraping.updateJob, {
        jobId,
        status: "failed",
        error: error.message,
        completedAt: Date.now(),
      });
      throw error;
    }
  },
});

// ==================== CHECK RUN STATUS & PROCESS RESULTS ====================

export const checkAndProcessRun = action({
  args: {
    runId: v.string(),
    jobId: v.id("scrapingJobs"),
  },
  handler: async (ctx, args) => {
    const apiToken = process.env.APIFY_API_TOKEN;
    if (!apiToken) throw new Error("APIFY_API_TOKEN not configured");

    // Check run status
    const statusResponse = await fetch(
      `${APIFY_BASE_URL}/actor-runs/${args.runId}?token=${apiToken}`
    );
    const statusData = await statusResponse.json();

    if (statusData.data.status === "RUNNING") {
      return { status: "running" };
    }

    if (statusData.data.status === "FAILED") {
      await ctx.runMutation(internal.scraping.updateJob, {
        jobId: args.jobId,
        status: "failed",
        error: "Apify run failed",
        completedAt: Date.now(),
      });
      return { status: "failed" };
    }

    if (statusData.data.status === "SUCCEEDED") {
      // Fetch results
      const resultsResponse = await fetch(
        `${APIFY_BASE_URL}/actor-runs/${args.runId}/dataset/items?token=${apiToken}`
      );
      const results = await resultsResponse.json();

      await ctx.runMutation(internal.scraping.updateJob, {
        jobId: args.jobId,
        status: "completed",
        completedAt: Date.now(),
        itemsScraped: results.length,
      });

      return { status: "completed", results };
    }

    return { status: statusData.data.status };
  },
});

// ==================== BATCH SCRAPING ====================

export const scrapeAllAccounts = action({
  args: {
    platform: v.union(
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("youtube")
    ),
  },
  handler: async (ctx, args) => {
    // Get accounts due for scraping
    const accounts = await ctx.runQuery(
      internal.accounts.getAccountsDueForScraping,
      { platform: args.platform }
    );

    const results = [];

    for (const account of accounts) {
      try {
        let result;
        if (args.platform === "instagram") {
          result = await ctx.runAction(internal.scraping.scrapeInstagramPosts, {
            username: account.username,
            accountId: account._id,
          });
        } else if (args.platform === "tiktok") {
          result = await ctx.runAction(internal.scraping.scrapeTikTokProfile, {
            username: account.username,
            accountId: account._id,
          });
        } else if (args.platform === "youtube") {
          result = await ctx.runAction(internal.scraping.scrapeYouTubeChannel, {
            channelUrl: account.profileUrl,
            accountId: account._id,
          });
        }
        results.push({ account: account.username, ...result });
      } catch (error: any) {
        results.push({
          account: account.username,
          error: error.message,
        });
      }
    }

    return results;
  },
});
