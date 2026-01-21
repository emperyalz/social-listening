import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get the organization profile
export const getOrganizationProfile = query({
  args: {},
  handler: async (ctx) => {
    // Get the first (and should be only) organization profile
    const profile = await ctx.db.query("organizationProfile").first();

    if (!profile) {
      return null;
    }

    // Get URLs for stored files
    let avatarUrl = null;
    let bannerUrl = null;

    if (profile.avatarStorageId) {
      avatarUrl = await ctx.storage.getUrl(profile.avatarStorageId);
    }

    if (profile.bannerStorageId) {
      bannerUrl = await ctx.storage.getUrl(profile.bannerStorageId);
    }

    // Get URLs for brand documents
    const brandDocumentsWithUrls = profile.brandDocuments
      ? await Promise.all(
          profile.brandDocuments.map(async (doc) => ({
            ...doc,
            url: await ctx.storage.getUrl(doc.storageId),
          }))
        )
      : [];

    // Get full competitor data for selected global competitors
    const selectedCompetitorIds = profile.selectedCompetitorIds || [];
    const selectedCompetitors = await Promise.all(
      selectedCompetitorIds.map(async (competitorId) => {
        const competitor = await ctx.db.get(competitorId);
        if (!competitor) return null;

        // Get market info
        const market = await ctx.db.get(competitor.marketId);

        // Get linked accounts
        const accounts = await ctx.db
          .query("accounts")
          .withIndex("by_competitor", (q) => q.eq("competitorId", competitor._id))
          .collect();

        // Get display avatar URL
        let displayAvatarUrl: string | undefined;
        if (competitor.displayAvatarAccountId) {
          const selectedAccount = accounts.find(a => a._id === competitor.displayAvatarAccountId);
          displayAvatarUrl = selectedAccount?.avatarUrl;
        } else if (accounts.length > 0) {
          const accountWithAvatar = accounts.find(a => a.avatarUrl);
          displayAvatarUrl = accountWithAvatar?.avatarUrl;
        }

        return {
          ...competitor,
          market,
          accounts,
          displayAvatarUrl,
        };
      })
    );

    // Filter out null values (deleted competitors)
    const validCompetitors = selectedCompetitors.filter(c => c !== null);

    return {
      ...profile,
      avatarUrl,
      bannerUrl,
      brandDocuments: brandDocumentsWithUrls,
      selectedCompetitors: validCompetitors,
    };
  },
});

// Save or update the organization profile
export const saveOrganizationProfile = mutation({
  args: {
    companyName: v.string(),
    legalName: v.optional(v.string()),
    taxId: v.optional(v.string()),
    hqLocation: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    socialConnections: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          handle: v.string(),
          connected: v.boolean(),
          icon: v.union(
            v.literal("instagram"),
            v.literal("youtube"),
            v.literal("tiktok"),
            v.literal("linkedin"),
            v.literal("facebook"),
            v.literal("twitter")
          ),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db.query("organizationProfile").first();

    if (existingProfile) {
      // Update existing profile (don't overwrite selectedCompetitorIds)
      await ctx.db.patch(existingProfile._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existingProfile._id;
    } else {
      // Create new profile
      const profileId = await ctx.db.insert("organizationProfile", {
        ...args,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return profileId;
    }
  },
});

// Add a competitor to the selected global competitors
export const addGlobalCompetitor = mutation({
  args: {
    competitorId: v.id("competitors"),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db.query("organizationProfile").first();

    if (existingProfile) {
      const currentIds = existingProfile.selectedCompetitorIds || [];

      // Don't add duplicates
      if (currentIds.includes(args.competitorId)) {
        return existingProfile._id;
      }

      // Limit to 5 global competitors
      if (currentIds.length >= 5) {
        throw new Error("Maximum of 5 global competitors allowed");
      }

      await ctx.db.patch(existingProfile._id, {
        selectedCompetitorIds: [...currentIds, args.competitorId],
        updatedAt: Date.now(),
      });
      return existingProfile._id;
    } else {
      // Create new profile with competitor
      const profileId = await ctx.db.insert("organizationProfile", {
        companyName: "",
        selectedCompetitorIds: [args.competitorId],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return profileId;
    }
  },
});

// Remove a competitor from the selected global competitors
export const removeGlobalCompetitor = mutation({
  args: {
    competitorId: v.id("competitors"),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db.query("organizationProfile").first();

    if (existingProfile && existingProfile.selectedCompetitorIds) {
      const updatedIds = existingProfile.selectedCompetitorIds.filter(
        (id) => id !== args.competitorId
      );

      await ctx.db.patch(existingProfile._id, {
        selectedCompetitorIds: updatedIds,
        updatedAt: Date.now(),
      });
    }
  },
});

// Generate upload URL for file storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Save avatar image
export const saveAvatar = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db.query("organizationProfile").first();

    if (existingProfile) {
      // Delete old avatar if exists
      if (existingProfile.avatarStorageId) {
        await ctx.storage.delete(existingProfile.avatarStorageId);
      }
      await ctx.db.patch(existingProfile._id, {
        avatarStorageId: args.storageId,
        updatedAt: Date.now(),
      });
    } else {
      // Create new profile with avatar
      await ctx.db.insert("organizationProfile", {
        companyName: "",
        avatarStorageId: args.storageId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Save banner image
export const saveBanner = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db.query("organizationProfile").first();

    if (existingProfile) {
      // Delete old banner if exists
      if (existingProfile.bannerStorageId) {
        await ctx.storage.delete(existingProfile.bannerStorageId);
      }
      await ctx.db.patch(existingProfile._id, {
        bannerStorageId: args.storageId,
        updatedAt: Date.now(),
      });
    } else {
      // Create new profile with banner
      await ctx.db.insert("organizationProfile", {
        companyName: "",
        bannerStorageId: args.storageId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Add a brand document
export const addBrandDocument = mutation({
  args: {
    name: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db.query("organizationProfile").first();

    const newDoc = {
      name: args.name,
      storageId: args.storageId,
      status: "pending" as const,
      uploadedAt: Date.now(),
    };

    if (existingProfile) {
      const currentDocs = existingProfile.brandDocuments || [];
      await ctx.db.patch(existingProfile._id, {
        brandDocuments: [...currentDocs, newDoc],
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("organizationProfile", {
        companyName: "",
        brandDocuments: [newDoc],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Remove a brand document
export const removeBrandDocument = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db.query("organizationProfile").first();

    if (existingProfile && existingProfile.brandDocuments) {
      // Delete from storage
      await ctx.storage.delete(args.storageId);

      // Remove from array
      const updatedDocs = existingProfile.brandDocuments.filter(
        (doc) => doc.storageId !== args.storageId
      );

      await ctx.db.patch(existingProfile._id, {
        brandDocuments: updatedDocs,
        updatedAt: Date.now(),
      });
    }
  },
});

// Update document status (for verification workflow)
export const updateDocumentStatus = mutation({
  args: {
    storageId: v.id("_storage"),
    status: v.union(v.literal("pending"), v.literal("verified"), v.literal("error")),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db.query("organizationProfile").first();

    if (existingProfile && existingProfile.brandDocuments) {
      const updatedDocs = existingProfile.brandDocuments.map((doc) =>
        doc.storageId === args.storageId ? { ...doc, status: args.status } : doc
      );

      await ctx.db.patch(existingProfile._id, {
        brandDocuments: updatedDocs,
        updatedAt: Date.now(),
      });
    }
  },
});
