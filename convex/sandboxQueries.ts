import { query } from "./_generated/server";
import { v } from "convex/values";

// Get latest scraping job info
export const getLatestScrapeInfo = query({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db
      .query("scrapingJobs")
      .filter((q) => q.eq(q.field("status"), "completed"))
      .order("desc")
      .take(10);
    
    const accountCount = (await ctx.db.query("accounts").collect()).length;
    const postCount = (await ctx.db.query("posts").collect()).length;
    const snapshotCount = (await ctx.db.query("postSnapshots").collect()).length;
    const accountSnapshotCount = (await ctx.db.query("accountSnapshots").collect()).length;
    
    return {
      latestJobs: jobs.map(j => ({
        platform: j.platform,
        jobType: j.jobType,
        status: j.status,
        completedAt: j.completedAt ? new Date(j.completedAt).toISOString() : null,
        itemsScraped: j.itemsScraped,
      })),
      totals: {
        accounts: accountCount,
        posts: postCount,
        postSnapshots: snapshotCount,
        accountSnapshots: accountSnapshotCount,
      }
    };
  },
});

// Export all data for a specific table
export const exportAccounts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("accounts").collect();
  },
});

export const exportPosts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const posts = await ctx.db.query("posts").order("desc").take(args.limit || 1000);
    return posts;
  },
});

export const exportPostSnapshots = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db.query("postSnapshots").order("desc").take(args.limit || 5000);
  },
});

export const exportAccountSnapshots = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("accountSnapshots").collect();
  },
});

export const exportCompetitors = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("competitors").collect();
  },
});

export const exportMarkets = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("markets").collect();
  },
});
