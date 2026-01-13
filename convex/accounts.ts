import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    platform: v.optional(
      v.union(v.literal("instagram"), v.literal("tiktok"), v.literal("youtube"))
    ),
    marketId: v.optional(v.id("markets")),
    competitorId: v.optional(v.id("competitors")),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let accounts = await ctx.db.query("accounts").collect();

    if (args.platform) {
      accounts = accounts.filter((a) => a.platform === args.platform);
    }
    if (args.marketId) {
      accounts = accounts.filter((a) => a.marketId === args.marketId);
    }
    if (args.competitorId) {
      accounts = accounts.filter((a) => a.competitorId === args.competitorId);
    }
    if (args.isActive !== undefined) {
      accounts = accounts.filter((a) => a.isActive === args.isActive);
    }

    // Get market and competitor info for each account
    const accountsWithData = await Promise.all(
      accounts.map(async (account) => {
        const market = await ctx.db.get(account.marketId);
        const competitor = account.competitorId 
          ? await ctx.db.get(account.competitorId) 
          : null;
        return { ...account, market, competitor };
      })
    );

    return accountsWithData;
  },
});

export const getById = query({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
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
    profileUrl: v.string(),
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
      throw new Error(`Account @${args.username} already exists`);
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
    username: v.optional(v.string()),
    profileUrl: v.optional(v.string()),
    displayName: v.optional(v.string()),
    marketId: v.optional(v.id("markets")),
    companyName: v.optional(v.string()),
    accountType: v.optional(
      v.union(
        v.literal("brokerage"),
        v.literal("individual_broker"),
        v.literal("developer"),
        v.literal("other")
      )
    ),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(filteredUpdates).length > 0) {
      await ctx.db.patch(id, filteredUpdates);
    }
    
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateLastScraped = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { lastScrapedAt: Date.now() });
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("accounts").collect();

    const byPlatform = accounts.reduce(
      (acc, a) => {
        acc[a.platform] = (acc[a.platform] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byMarket = accounts.reduce(
      (acc, a) => {
        const key = a.marketId;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: accounts.length,
      active: accounts.filter((a) => a.isActive).length,
      byPlatform,
      byMarket,
    };
  },
});

export const getAccountsDueForScraping = query({
  args: {
    platform: v.union(
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("youtube")
    ),
    hoursThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const threshold = (args.hoursThreshold || 24) * 60 * 60 * 1000;
    const cutoff = Date.now() - threshold;

    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_platform", (q) => q.eq("platform", args.platform))
      .collect();

    return accounts.filter(
      (a) => a.isActive && (!a.lastScrapedAt || a.lastScrapedAt < cutoff)
    );
  },
});

// Bulk operations
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
    const results = [];
    for (const account of args.accounts) {
      // Check if exists
      const existing = await ctx.db
        .query("accounts")
        .withIndex("by_platform_username", (q) =>
          q.eq("platform", account.platform).eq("username", account.username)
        )
        .first();

      if (!existing) {
        const id = await ctx.db.insert("accounts", {
          ...account,
          isActive: true,
          createdAt: Date.now(),
        });
        results.push({ username: account.username, id, status: "created" });
      } else {
        results.push({
          username: account.username,
          id: existing._id,
          status: "exists",
        });
      }
    }
    return results;
  },
});
