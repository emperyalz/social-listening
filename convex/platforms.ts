import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Platform ID type
const platformIdValidator = v.union(
  v.literal("instagram"),
  v.literal("tiktok"),
  v.literal("youtube"),
  v.literal("facebook"),
  v.literal("linkedin"),
  v.literal("twitter")
);

type PlatformId = "instagram" | "tiktok" | "youtube" | "facebook" | "linkedin" | "twitter";

// Default platform configurations
const DEFAULT_PLATFORMS: Record<PlatformId, { displayName: string; primaryColor: string; secondaryColor: string }> = {
  instagram: { displayName: "Instagram", primaryColor: "#E1306C", secondaryColor: "#833AB4" },
  tiktok: { displayName: "TikTok", primaryColor: "#000000", secondaryColor: "#69C9D0" },
  youtube: { displayName: "YouTube", primaryColor: "#FF0000", secondaryColor: "#282828" },
  facebook: { displayName: "Facebook", primaryColor: "#1877F2", secondaryColor: "#4267B2" },
  linkedin: { displayName: "LinkedIn", primaryColor: "#0A66C2", secondaryColor: "#004182" },
  twitter: { displayName: "X (Twitter)", primaryColor: "#000000", secondaryColor: "#1DA1F2" },
};

// ============ PLATFORM QUERIES ============

// Get all platforms with their logos
export const list = query({
  args: {},
  handler: async (ctx) => {
    const platforms = await ctx.db.query("platforms").collect();

    // Get all logos for these platforms
    const platformsWithLogos = await Promise.all(
      platforms.map(async (platform) => {
        const logos = await ctx.db
          .query("platformLogos")
          .withIndex("by_platform", (q) => q.eq("platformId", platform.platformId))
          .collect();

        // Get URLs for logos
        const logosWithUrls = await Promise.all(
          logos.map(async (logo) => ({
            ...logo,
            url: await ctx.storage.getUrl(logo.storageId),
          }))
        );

        // Get selected logo for each context
        const getLogoById = (id: Id<"platformLogos"> | undefined) => {
          if (!id) return null;
          return logosWithUrls.find(l => l._id === id) || null;
        };

        return {
          ...platform,
          logos: logosWithUrls,
          selectedLogos: {
            avatar: getLogoById(platform.logoForAvatar),
            navigation: getLogoById(platform.logoForNavigation),
            filters: getLogoById(platform.logoForFilters),
            posts: getLogoById(platform.logoForPosts),
            competitors: getLogoById(platform.logoForCompetitors),
            dashboard: getLogoById(platform.logoForDashboard),
          },
        };
      })
    );

    return platformsWithLogos.sort((a, b) => a.displayOrder - b.displayOrder);
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

// Get a specific platform by platformId with logos
export const getByPlatformId = query({
  args: {
    platformId: platformIdValidator,
  },
  handler: async (ctx, args) => {
    const platform = await ctx.db
      .query("platforms")
      .withIndex("by_platform", (q) => q.eq("platformId", args.platformId))
      .first();

    if (!platform) return null;

    const logos = await ctx.db
      .query("platformLogos")
      .withIndex("by_platform", (q) => q.eq("platformId", platform.platformId))
      .collect();

    const logosWithUrls = await Promise.all(
      logos.map(async (logo) => ({
        ...logo,
        url: await ctx.storage.getUrl(logo.storageId),
      }))
    );

    return {
      ...platform,
      logos: logosWithUrls,
    };
  },
});

// Get logos for a specific platform
export const getLogosForPlatform = query({
  args: { platformId: platformIdValidator },
  handler: async (ctx, args) => {
    const logos = await ctx.db
      .query("platformLogos")
      .withIndex("by_platform", (q) => q.eq("platformId", args.platformId))
      .collect();

    return Promise.all(
      logos.map(async (logo) => ({
        ...logo,
        url: await ctx.storage.getUrl(logo.storageId),
      }))
    );
  },
});

// Get the logo URL for a specific context
export const getLogoForContext = query({
  args: {
    platformId: platformIdValidator,
    context: v.union(
      v.literal("avatar"),
      v.literal("navigation"),
      v.literal("filters"),
      v.literal("posts"),
      v.literal("competitors"),
      v.literal("dashboard")
    ),
  },
  handler: async (ctx, args) => {
    const platform = await ctx.db
      .query("platforms")
      .withIndex("by_platform", (q) => q.eq("platformId", args.platformId))
      .first();

    if (!platform) return null;

    const contextFieldMap: Record<string, keyof typeof platform> = {
      avatar: "logoForAvatar",
      navigation: "logoForNavigation",
      filters: "logoForFilters",
      posts: "logoForPosts",
      competitors: "logoForCompetitors",
      dashboard: "logoForDashboard",
    };

    const logoId = platform[contextFieldMap[args.context]] as Id<"platformLogos"> | undefined;
    if (!logoId) return null;

    const logo = await ctx.db.get(logoId);
    if (!logo) return null;

    return {
      ...logo,
      url: await ctx.storage.getUrl(logo.storageId),
    };
  },
});

// ============ PLATFORM MUTATIONS ============

// Initialize default platforms if they don't exist
export const initializeDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const existingPlatforms = await ctx.db.query("platforms").collect();
    const existingIds = new Set(existingPlatforms.map((p) => p.platformId));

    let order = existingPlatforms.length;
    const results = [];

    for (const [platformId, config] of Object.entries(DEFAULT_PLATFORMS)) {
      if (!existingIds.has(platformId as PlatformId)) {
        const id = await ctx.db.insert("platforms", {
          platformId: platformId as PlatformId,
          displayName: config.displayName,
          primaryColor: config.primaryColor,
          secondaryColor: config.secondaryColor,
          isActive: ["instagram", "tiktok", "youtube"].includes(platformId),
          displayOrder: order++,
          createdAt: Date.now(),
        });
        results.push({ platformId, status: "created", id });
      } else {
        const existing = existingPlatforms.find(p => p.platformId === platformId);
        results.push({ platformId, status: "exists", id: existing?._id });
      }
    }

    return results;
  },
});

// Update platform settings (colors, display name, active status)
export const update = mutation({
  args: {
    id: v.id("platforms"),
    displayName: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    secondaryColor: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const platform = await ctx.db.get(id);
    if (!platform) throw new Error("Platform not found");

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(id, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Set which logo to use for a specific context
export const setLogoForContext = mutation({
  args: {
    platformId: v.id("platforms"),
    context: v.union(
      v.literal("avatar"),
      v.literal("navigation"),
      v.literal("filters"),
      v.literal("posts"),
      v.literal("competitors"),
      v.literal("dashboard")
    ),
    logoId: v.union(v.id("platformLogos"), v.null()), // null to clear
  },
  handler: async (ctx, args) => {
    const platform = await ctx.db.get(args.platformId);
    if (!platform) throw new Error("Platform not found");

    // Verify the logo belongs to this platform if provided
    if (args.logoId) {
      const logo = await ctx.db.get(args.logoId);
      if (!logo || logo.platformId !== platform.platformId) {
        throw new Error("Logo not found or doesn't belong to this platform");
      }
    }

    const fieldMap: Record<string, string> = {
      avatar: "logoForAvatar",
      navigation: "logoForNavigation",
      filters: "logoForFilters",
      posts: "logoForPosts",
      competitors: "logoForCompetitors",
      dashboard: "logoForDashboard",
    };

    await ctx.db.patch(args.platformId, {
      [fieldMap[args.context]]: args.logoId || undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ============ LOGO MUTATIONS ============

// Generate upload URL for logo
export const generateLogoUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Create a new logo after upload
export const createLogo = mutation({
  args: {
    platformId: platformIdValidator,
    name: v.string(),
    storageId: v.id("_storage"),
    mimeType: v.string(),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if a logo with this name already exists for this platform
    const existing = await ctx.db
      .query("platformLogos")
      .withIndex("by_platform_name", (q) =>
        q.eq("platformId", args.platformId).eq("name", args.name)
      )
      .first();

    if (existing) {
      throw new Error(`A logo named "${args.name}" already exists for this platform`);
    }

    const logoId = await ctx.db.insert("platformLogos", {
      platformId: args.platformId,
      name: args.name,
      storageId: args.storageId,
      mimeType: args.mimeType,
      fileSize: args.fileSize,
      createdAt: Date.now(),
    });

    return logoId;
  },
});

// Update logo name
export const updateLogoName = mutation({
  args: {
    id: v.id("platformLogos"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const logo = await ctx.db.get(args.id);
    if (!logo) throw new Error("Logo not found");

    // Check for duplicate name
    const existing = await ctx.db
      .query("platformLogos")
      .withIndex("by_platform_name", (q) =>
        q.eq("platformId", logo.platformId).eq("name", args.name)
      )
      .first();

    if (existing && existing._id !== args.id) {
      throw new Error(`A logo named "${args.name}" already exists for this platform`);
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Delete a logo
export const deleteLogo = mutation({
  args: { id: v.id("platformLogos") },
  handler: async (ctx, args) => {
    const logo = await ctx.db.get(args.id);
    if (!logo) throw new Error("Logo not found");

    // Find platform and clear references to this logo
    const platform = await ctx.db
      .query("platforms")
      .withIndex("by_platform", (q) => q.eq("platformId", logo.platformId))
      .first();

    if (platform) {
      const updates: Record<string, undefined> = {};

      if (platform.logoForAvatar === args.id) updates.logoForAvatar = undefined;
      if (platform.logoForNavigation === args.id) updates.logoForNavigation = undefined;
      if (platform.logoForFilters === args.id) updates.logoForFilters = undefined;
      if (platform.logoForPosts === args.id) updates.logoForPosts = undefined;
      if (platform.logoForCompetitors === args.id) updates.logoForCompetitors = undefined;
      if (platform.logoForDashboard === args.id) updates.logoForDashboard = undefined;

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(platform._id, { ...updates, updatedAt: Date.now() });
      }
    }

    // Delete the file from storage
    await ctx.storage.delete(logo.storageId);

    // Delete the logo record
    await ctx.db.delete(args.id);

    return { success: true };
  },
});

// Replace logo file (keeps same ID and name, but updates file)
export const replaceLogoFile = mutation({
  args: {
    id: v.id("platformLogos"),
    storageId: v.id("_storage"),
    mimeType: v.string(),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const logo = await ctx.db.get(args.id);
    if (!logo) throw new Error("Logo not found");

    // Delete old file
    await ctx.storage.delete(logo.storageId);

    // Update with new file
    await ctx.db.patch(args.id, {
      storageId: args.storageId,
      mimeType: args.mimeType,
      fileSize: args.fileSize,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
