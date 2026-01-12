import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const list = query({
  args: {
    platform: v.optional(
      v.union(v.literal("instagram"), v.literal("tiktok"), v.literal("youtube"))
    ),
    marketId: v.optional(v.id("markets")),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("accounts");

    if (args.platform) {
      q = q.filter((q2) => q2.eq(q2.field("platform"), args.platform));
    }
    if (args.marketId) {
      q = q.filter((q2) => q2.eq(q2.field("marketId"), args.marketId));
    }

    const accounts = await q
      .filter((q2) => q2.eq(q2.field("isActive"), true))
      .collect();

    // Get market info for each account
    const accountsWithMarket = await Promise.all(
      accounts.map(async (account) => {
        const market = await ctx.db.get(account.marketId);
        return { ...account, market };
      })
    );

    return accountsWithMarket;
  },
});

export const getById = query({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.id);
    if (!account) return null;

    const market = await ctx.db.get(account.marketId);
    return { ...account, market };
  },
});

export const getByUsername = query({
  args: {
    platform: v.union(
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("youtube")
    ),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("accounts")
      .withIndex("by_platform_username", (q) =>
        q.eq("platform", args.platform).eq("username", args.username)
      )
      .first();
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    // Check if account already exists
    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_platform_username", (q) =>
        q.eq("platform", args.platform).eq("username", args.username)
      )
      .first();

    if (existing) {
      throw new Error(
        `Account ${args.username} on ${args.platform} already exists`
      );
    }

    return await ctx.db.insert("accounts", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("accounts"),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    companyName: v.optional(v.string()),
    accountType: v.optional(
      v.union(
        v.literal("brokerage"),
        v.literal("individual_broker"),
        v.literal("developer"),
        v.literal("other")
      )
    ),
    marketId: v.optional(v.id("markets")),
    isActive: v.optional(v.boolean()),
    lastScrapedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: false });
  },
});

export const bulkCreate = mutation({
  args: {
    accounts: v.array(
      v.object({
        platform: v.union(
          v.literal("instagram"),
          v.literal("tiktok"),
          v.literal("youtube")
        ),
        username: v.string(),
        profileUrl: v.string(),
        marketId: v.id("markets"),
        companyName: v.optional(v.string()),
        accountType: v.union(
          v.literal("brokerage"),
          v.literal("individual_broker"),
          v.literal("developer"),
          v.literal("other")
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = {
      created: [] as string[],
      skipped: [] as string[],
    };

    for (const account of args.accounts) {
      const existing = await ctx.db
        .query("accounts")
        .withIndex("by_platform_username", (q) =>
          q.eq("platform", account.platform).eq("username", account.username)
        )
        .first();

      if (existing) {
        results.skipped.push(`${account.platform}:${account.username}`);
        continue;
      }

      await ctx.db.insert("accounts", {
        ...account,
        isActive: true,
        createdAt: Date.now(),
      });
      results.created.push(`${account.platform}:${account.username}`);
    }

    return results;
  },
});

// Get accounts due for scraping (not scraped in last 20 hours)
export const getAccountsDueForScraping = query({
  args: {
    platform: v.optional(
      v.union(v.literal("instagram"), v.literal("tiktok"), v.literal("youtube"))
    ),
  },
  handler: async (ctx, args) => {
    const twentyHoursAgo = Date.now() - 20 * 60 * 60 * 1000;

    let accounts = await ctx.db
      .query("accounts")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (args.platform) {
      accounts = accounts.filter((a) => a.platform === args.platform);
    }

    // Filter to accounts that haven't been scraped recently
    return accounts.filter(
      (a) => !a.lastScrapedAt || a.lastScrapedAt < twentyHoursAgo
    );
  },
});

// Get account stats summary
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db
      .query("accounts")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const byPlatform = {
      instagram: accounts.filter((a) => a.platform === "instagram").length,
      tiktok: accounts.filter((a) => a.platform === "tiktok").length,
      youtube: accounts.filter((a) => a.platform === "youtube").length,
    };

    const markets = await ctx.db.query("markets").collect();
    const byMarket: Record<string, number> = {};
    for (const market of markets) {
      byMarket[market.name] = accounts.filter(
        (a) => a.marketId === market._id
      ).length;
    }

    return {
      total: accounts.length,
      byPlatform,
      byMarket,
    };
  },
});
