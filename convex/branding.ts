import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get the active platform branding configuration
export const getActiveBranding = query({
  args: {},
  handler: async (ctx) => {
    const branding = await ctx.db
      .query("platformBranding")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();
    
    if (!branding) {
      // Return default Orwell branding if none configured
      return {
        platformName: "Orwell",
        primaryColor: "#28A963",
        logoLightUrl: "/orwell-logo.svg",
        logoDarkUrl: "/orwell-logo-white.svg",
        isDefault: true,
      };
    }

    // Get logo URLs from storage if they exist
    let logoLightUrl = "/orwell-logo.svg";
    let logoDarkUrl = "/orwell-logo-white.svg";
    let logoIconUrl = null;
    let faviconUrl = null;

    if (branding.logoLightStorageId) {
      logoLightUrl = await ctx.storage.getUrl(branding.logoLightStorageId) || logoLightUrl;
    }
    if (branding.logoDarkStorageId) {
      logoDarkUrl = await ctx.storage.getUrl(branding.logoDarkStorageId) || logoDarkUrl;
    }
    if (branding.logoIconStorageId) {
      logoIconUrl = await ctx.storage.getUrl(branding.logoIconStorageId);
    }
    if (branding.faviconStorageId) {
      faviconUrl = await ctx.storage.getUrl(branding.faviconStorageId);
    }

    return {
      ...branding,
      logoLightUrl,
      logoDarkUrl,
      logoIconUrl,
      faviconUrl,
      isDefault: false,
    };
  },
});

// Get all branding configurations (for admin view)
export const getAllBranding = query({
  args: {},
  handler: async (ctx) => {
    const brandings = await ctx.db.query("platformBranding").collect();
    
    // Enhance each branding with logo URLs
    const enhancedBrandings = await Promise.all(
      brandings.map(async (branding) => {
        let logoLightUrl = null;
        let logoDarkUrl = null;
        let logoIconUrl = null;
        let faviconUrl = null;

        if (branding.logoLightStorageId) {
          logoLightUrl = await ctx.storage.getUrl(branding.logoLightStorageId);
        }
        if (branding.logoDarkStorageId) {
          logoDarkUrl = await ctx.storage.getUrl(branding.logoDarkStorageId);
        }
        if (branding.logoIconStorageId) {
          logoIconUrl = await ctx.storage.getUrl(branding.logoIconStorageId);
        }
        if (branding.faviconStorageId) {
          faviconUrl = await ctx.storage.getUrl(branding.faviconStorageId);
        }

        return {
          ...branding,
          logoLightUrl,
          logoDarkUrl,
          logoIconUrl,
          faviconUrl,
        };
      })
    );

    return enhancedBrandings;
  },
});

// Create or update platform branding
export const upsertBranding = mutation({
  args: {
    id: v.optional(v.id("platformBranding")),
    platformName: v.string(),
    tagline: v.optional(v.string()),
    primaryColor: v.string(),
    secondaryColor: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    logoLightStorageId: v.optional(v.id("_storage")),
    logoDarkStorageId: v.optional(v.id("_storage")),
    logoIconStorageId: v.optional(v.id("_storage")),
    faviconStorageId: v.optional(v.id("_storage")),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // If setting this as active, deactivate others first
    if (args.isActive) {
      const activeBrandings = await ctx.db
        .query("platformBranding")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .collect();
      
      for (const branding of activeBrandings) {
        if (!args.id || branding._id !== args.id) {
          await ctx.db.patch(branding._id, { isActive: false, updatedAt: now });
        }
      }
    }

    if (args.id) {
      // Update existing
      await ctx.db.patch(args.id, {
        platformName: args.platformName,
        tagline: args.tagline,
        primaryColor: args.primaryColor,
        secondaryColor: args.secondaryColor,
        accentColor: args.accentColor,
        logoLightStorageId: args.logoLightStorageId,
        logoDarkStorageId: args.logoDarkStorageId,
        logoIconStorageId: args.logoIconStorageId,
        faviconStorageId: args.faviconStorageId,
        isActive: args.isActive,
        updatedAt: now,
      });
      return args.id;
    } else {
      // Create new
      const id = await ctx.db.insert("platformBranding", {
        platformName: args.platformName,
        tagline: args.tagline,
        primaryColor: args.primaryColor,
        secondaryColor: args.secondaryColor,
        accentColor: args.accentColor,
        logoLightStorageId: args.logoLightStorageId,
        logoDarkStorageId: args.logoDarkStorageId,
        logoIconStorageId: args.logoIconStorageId,
        faviconStorageId: args.faviconStorageId,
        isActive: args.isActive,
        createdAt: now,
        updatedAt: now,
      });
      return id;
    }
  },
});

// Delete a branding configuration
export const deleteBranding = mutation({
  args: {
    id: v.id("platformBranding"),
  },
  handler: async (ctx, args) => {
    const branding = await ctx.db.get(args.id);
    if (!branding) {
      throw new Error("Branding configuration not found");
    }

    // Delete associated storage files
    if (branding.logoLightStorageId) {
      await ctx.storage.delete(branding.logoLightStorageId);
    }
    if (branding.logoDarkStorageId) {
      await ctx.storage.delete(branding.logoDarkStorageId);
    }
    if (branding.logoIconStorageId) {
      await ctx.storage.delete(branding.logoIconStorageId);
    }
    if (branding.faviconStorageId) {
      await ctx.storage.delete(branding.faviconStorageId);
    }

    await ctx.db.delete(args.id);
  },
});

// Generate upload URL for logo files
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
