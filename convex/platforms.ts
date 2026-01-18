import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Platform ID type
const platformIdValidator = v.union(
  v.literal("instagram"),
  v.literal("tiktok"),
  v.literal("youtube"),
  v.literal("facebook"),
  v.literal("linkedin"),
  v.literal("twitter")
);

// Get all platforms
export const list = query({
  args: {},
  handler: async (ctx) => {
    const platforms = await ctx.db.query("platforms").collect();
    // Sort by displayOrder
    return platforms.sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

// Get active platforms only
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const platforms = await ctx.db
      .query("platforms")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    return platforms.sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

// Get a specific platform by platformId
export const getByPlatformId = query({
  args: {
    platformId: platformIdValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("platforms")
      .withIndex("by_platform", (q) => q.eq("platformId", args.platformId))
      .first();
  },
});

// Get platforms for a specific display context
export const getForContext = query({
  args: {
    context: v.union(
      v.literal("navigation"),
      v.literal("filters"),
      v.literal("posts"),
      v.literal("competitors")
    ),
  },
  handler: async (ctx, args) => {
    const platforms = await ctx.db
      .query("platforms")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Filter based on context
    const filtered = platforms.filter((p) => {
      switch (args.context) {
        case "navigation":
          return p.showInNavigation;
        case "filters":
          return p.showInFilters;
        case "posts":
          return p.showInPosts;
        case "competitors":
          return p.showInCompetitors;
        default:
          return true;
      }
    });

    return filtered.sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

// Create or update a platform (upsert)
export const upsert = mutation({
  args: {
    platformId: platformIdValidator,
    displayName: v.string(),
    logoHorizontal: v.optional(v.string()),
    logoVertical: v.optional(v.string()),
    logoIcon: v.optional(v.string()),
    logoWhite: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    secondaryColor: v.optional(v.string()),
    isActive: v.boolean(),
    displayOrder: v.number(),
    showInNavigation: v.boolean(),
    showInFilters: v.boolean(),
    showInPosts: v.boolean(),
    showInCompetitors: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("platforms")
      .withIndex("by_platform", (q) => q.eq("platformId", args.platformId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("platforms", {
        ...args,
        createdAt: Date.now(),
      });
    }
  },
});

// Update only the logos for a platform
export const updateLogos = mutation({
  args: {
    platformId: platformIdValidator,
    logoHorizontal: v.optional(v.string()),
    logoVertical: v.optional(v.string()),
    logoIcon: v.optional(v.string()),
    logoWhite: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("platforms")
      .withIndex("by_platform", (q) => q.eq("platformId", args.platformId))
      .first();

    if (!existing) {
      throw new Error(`Platform ${args.platformId} not found`);
    }

    const updates: Record<string, string | number | undefined> = {
      updatedAt: Date.now(),
    };

    if (args.logoHorizontal !== undefined) updates.logoHorizontal = args.logoHorizontal;
    if (args.logoVertical !== undefined) updates.logoVertical = args.logoVertical;
    if (args.logoIcon !== undefined) updates.logoIcon = args.logoIcon;
    if (args.logoWhite !== undefined) updates.logoWhite = args.logoWhite;

    await ctx.db.patch(existing._id, updates);
    return existing._id;
  },
});

// Update display settings for a platform
export const updateDisplaySettings = mutation({
  args: {
    platformId: platformIdValidator,
    isActive: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
    showInNavigation: v.optional(v.boolean()),
    showInFilters: v.optional(v.boolean()),
    showInPosts: v.optional(v.boolean()),
    showInCompetitors: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("platforms")
      .withIndex("by_platform", (q) => q.eq("platformId", args.platformId))
      .first();

    if (!existing) {
      throw new Error(`Platform ${args.platformId} not found`);
    }

    const updates: Record<string, boolean | number | undefined> = {
      updatedAt: Date.now(),
    };

    if (args.isActive !== undefined) updates.isActive = args.isActive;
    if (args.displayOrder !== undefined) updates.displayOrder = args.displayOrder;
    if (args.showInNavigation !== undefined) updates.showInNavigation = args.showInNavigation;
    if (args.showInFilters !== undefined) updates.showInFilters = args.showInFilters;
    if (args.showInPosts !== undefined) updates.showInPosts = args.showInPosts;
    if (args.showInCompetitors !== undefined) updates.showInCompetitors = args.showInCompetitors;

    await ctx.db.patch(existing._id, updates);
    return existing._id;
  },
});

// Initialize default platforms (run once to set up)
export const initializeDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const defaults = [
      {
        platformId: "instagram" as const,
        displayName: "Instagram",
        primaryColor: "#E1306C",
        secondaryColor: "#833AB4",
        displayOrder: 1,
      },
      {
        platformId: "tiktok" as const,
        displayName: "TikTok",
        primaryColor: "#000000",
        secondaryColor: "#69C9D0",
        displayOrder: 2,
      },
      {
        platformId: "youtube" as const,
        displayName: "YouTube",
        primaryColor: "#FF0000",
        secondaryColor: "#282828",
        displayOrder: 3,
      },
      {
        platformId: "facebook" as const,
        displayName: "Facebook",
        primaryColor: "#1877F2",
        secondaryColor: "#4267B2",
        displayOrder: 4,
      },
      {
        platformId: "linkedin" as const,
        displayName: "LinkedIn",
        primaryColor: "#0A66C2",
        secondaryColor: "#004182",
        displayOrder: 5,
      },
      {
        platformId: "twitter" as const,
        displayName: "X (Twitter)",
        primaryColor: "#000000",
        secondaryColor: "#1DA1F2",
        displayOrder: 6,
      },
    ];

    const results = [];
    for (const platform of defaults) {
      const existing = await ctx.db
        .query("platforms")
        .withIndex("by_platform", (q) => q.eq("platformId", platform.platformId))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("platforms", {
          ...platform,
          isActive: ["instagram", "tiktok", "youtube"].includes(platform.platformId),
          showInNavigation: true,
          showInFilters: true,
          showInPosts: true,
          showInCompetitors: true,
          createdAt: Date.now(),
        });
        results.push({ platformId: platform.platformId, status: "created", id });
      } else {
        results.push({ platformId: platform.platformId, status: "exists", id: existing._id });
      }
    }

    return results;
  },
});

// Delete a platform
export const remove = mutation({
  args: {
    platformId: platformIdValidator,
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("platforms")
      .withIndex("by_platform", (q) => q.eq("platformId", args.platformId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }
    return false;
  },
});
