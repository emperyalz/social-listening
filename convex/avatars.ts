import { v } from "convex/values";
import { mutation, query, action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Generate upload URL for client-side uploads
export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

// Get the current avatar for an account
export const getCurrentAvatar = query({
    args: { accountId: v.id("accounts") },
    handler: async (ctx, args) => {
          const avatar = await ctx.db
            .query("avatars")
            .withIndex("by_account_current", (q) =>
                      q.eq("accountId", args.accountId).eq("isCurrent", true)
                             )
            .first();

      if (avatar) {
              const url = await ctx.storage.getUrl(avatar.storageId);
              return { ...avatar, url };
      }
          return null;
    },
});

// Get avatar history for an account
export const getAvatarHistory = query({
    args: { accountId: v.id("accounts") },
    handler: async (ctx, args) => {
          const avatars = await ctx.db
            .query("avatars")
            .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
            .order("desc")
            .collect();

      // Add URLs to all avatars
      return Promise.all(
              avatars.map(async (avatar) => {
                        const url = await ctx.storage.getUrl(avatar.storageId);
                        return { ...avatar, url };
              })
            );
    },
});

// Store a new avatar (called after file is uploaded)
export const storeAvatar = mutation({
    args: {
          accountId: v.id("accounts"),
          storageId: v.id("_storage"),
          originalUrl: v.string(),
          mimeType: v.string(),
          fileSize: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
          const now = Date.now();

      // Check if we have an existing current avatar
      const existingCurrent = await ctx.db
            .query("avatars")
            .withIndex("by_account_current", (q) =>
                      q.eq("accountId", args.accountId).eq("isCurrent", true)
                             )
            .first();

      // If there's an existing avatar with the same original URL, just update lastSeenAt
      if (existingCurrent && existingCurrent.originalUrl === args.originalUrl) {
              await ctx.db.patch(existingCurrent._id, { lastSeenAt: now });
              return existingCurrent._id;
      }

      // Mark existing current avatar as archived
      if (existingCurrent) {
              await ctx.db.patch(existingCurrent._id, {
                        isCurrent: false,
                        archivedAt: now,
              });
      }

      // Create new avatar record
      const avatarId = await ctx.db.insert("avatars", {
              accountId: args.accountId,
              storageId: args.storageId,
              originalUrl: args.originalUrl,
              mimeType: args.mimeType,
              fileSize: args.fileSize,
              isCurrent: true,
              firstSeenAt: now,
              lastSeenAt: now,
      });

      // Update account with stored avatar URL
      const url = await ctx.storage.getUrl(args.storageId);
          if (url) {
                  await ctx.db.patch(args.accountId, { avatarUrl: url });
          }

      return avatarId;
    },
});

// Internal mutation to store avatar after downloading
export const storeAvatarInternal = internalMutation({
    args: {
          accountId: v.id("accounts"),
          storageId: v.id("_storage"),
          originalUrl: v.string(),
          mimeType: v.string(),
          fileSize: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
          const now = Date.now();

      // Check if we have an existing current avatar
      const existingCurrent = await ctx.db
            .query("avatars")
            .withIndex("by_account_current", (q) =>
                      q.eq("accountId", args.accountId).eq("isCurrent", true)
                             )
            .first();

      // If there's an existing avatar with the same original URL, just update lastSeenAt
      if (existingCurrent && existingCurrent.originalUrl === args.originalUrl) {
              await ctx.db.patch(existingCurrent._id, { lastSeenAt: now });
              // Still update the account avatarUrl to use stored version
            const url = await ctx.storage.getUrl(existingCurrent.storageId);
              if (url) {
                        await ctx.db.patch(args.accountId, { avatarUrl: url });
              }
              return existingCurrent._id;
      }

      // Mark existing current avatar as archived
      if (existingCurrent) {
              await ctx.db.patch(existingCurrent._id, {
                        isCurrent: false,
                        archivedAt: now,
              });
      }

      // Create new avatar record
      const avatarId = await ctx.db.insert("avatars", {
              accountId: args.accountId,
              storageId: args.storageId,
              originalUrl: args.originalUrl,
              mimeType: args.mimeType,
              fileSize: args.fileSize,
              isCurrent: true,
              firstSeenAt: now,
              lastSeenAt: now,
      });

      // Update account with stored avatar URL
      const url = await ctx.storage.getUrl(args.storageId);
          if (url) {
                  await ctx.db.patch(args.accountId, { avatarUrl: url });
          }

      return avatarId;
    },
});

// Action to download and store an avatar from a URL
export const downloadAndStoreAvatar = action({
    args: {
          accountId: v.id("accounts"),
          avatarUrl: v.string(),
    },
    handler: async (ctx, args) => {
          if (!args.avatarUrl) {
                  return { success: false, error: "No avatar URL provided" };
          }

      try {
              // Download the image
            const response = await fetch(args.avatarUrl);
              if (!response.ok) {
                        return { success: false, error: `Failed to fetch: ${response.status}` };
              }

            const contentType = response.headers.get("content-type") || "image/jpeg";
              const blob = await response.blob();

            // Upload to Convex storage
            const storageId = await ctx.storage.store(blob);

            // Store avatar record
            await ctx.runMutation(internal.avatars.storeAvatarInternal, {
                      accountId: args.accountId,
                      storageId,
                      originalUrl: args.avatarUrl,
                      mimeType: contentType,
                      fileSize: blob.size,
            });

            return { success: true, storageId };
      } catch (error: any) {
      console.error("Error downloading avatar:", error);
              return { success: false, error: error.message };
      }
    },
});

// Process all accounts and download their avatars
export const processAllAvatars: ReturnType<typeof action> = action({
    args: {
          platform: v.optional(
                  v.union(v.literal("instagram"), v.literal("tiktok"), v.literal("youtube"))
                ),
    },
    handler: async (ctx, args): Promise<Array<{
          accountId: Id<"accounts">;
          username: string;
          status?: string;
          reason?: string;
          success?: boolean;
          error?: string;
          storageId?: Id<"_storage">;
    }>> => {
          // Get all accounts
      const accounts = await ctx.runQuery(api.accounts.list, {
              platform: args.platform,
      });

      const results: Array<{
              accountId: Id<"accounts">;
              username: string;
              status?: string;
              reason?: string;
              success?: boolean;
              error?: string;
              storageId?: Id<"_storage">;
      }> = [];

      for (const account of accounts) {
              // Skip if no avatar URL
            if (!account.avatarUrl) {
                      results.push({
                                  accountId: account._id,
                                  username: account.username,
                                  status: "skipped",
                                  reason: "No avatar URL",
                      });
                      continue;
            }

            // Skip if avatar is already stored in Convex (check if URL is from convex)
            if (account.avatarUrl.includes("convex.cloud")) {
                      results.push({
                                  accountId: account._id,
                                  username: account.username,
                                  status: "skipped",
                                  reason: "Already stored",
                      });
                      continue;
            }

            // Download and store
            const result = await ctx.runAction(api.avatars.downloadAndStoreAvatar, {
                      accountId: account._id,
                      avatarUrl: account.avatarUrl,
            });

            results.push({
                      accountId: account._id,
                      username: account.username,
                      ...result,
            });
      }

      return results;
    },
});

// Get stored URL for an account (to use instead of expired CDN URLs)
export const getStoredAvatarUrl = query({
    args: { accountId: v.id("accounts") },
    handler: async (ctx, args) => {
          const avatar = await ctx.db
            .query("avatars")
            .withIndex("by_account_current", (q) =>
                      q.eq("accountId", args.accountId).eq("isCurrent", true)
                             )
            .first();

      if (avatar) {
              return await ctx.storage.getUrl(avatar.storageId);
      }
          return null;
    },
});
