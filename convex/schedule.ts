import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Platform type
type Platform = "instagram" | "tiktok" | "youtube" | "all";
type Frequency = "hourly" | "every_6_hours" | "every_12_hours" | "daily" | "weekly";

// Get all schedule settings
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("scheduleSettings").collect();
  },
});

// Get schedule settings for a specific platform
export const getByPlatform = query({
  args: {
    platform: v.union(
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("youtube"),
      v.literal("all")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scheduleSettings")
      .withIndex("by_platform", (q) => q.eq("platform", args.platform))
      .first();
  },
});

// Create or update schedule settings
export const upsert = mutation({
  args: {
    platform: v.union(
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("youtube"),
      v.literal("all")
    ),
    isEnabled: v.boolean(),
    frequency: v.union(
      v.literal("hourly"),
      v.literal("every_6_hours"),
      v.literal("every_12_hours"),
      v.literal("daily"),
      v.literal("weekly")
    ),
    preferredHour: v.number(),
    preferredDays: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("scheduleSettings")
      .withIndex("by_platform", (q) => q.eq("platform", args.platform))
      .first();

    const nextScheduledAt = calculateNextRun(
      args.frequency,
      args.preferredHour,
      args.preferredDays
    );

    if (existing) {
      await ctx.db.patch(existing._id, {
        isEnabled: args.isEnabled,
        frequency: args.frequency,
        preferredHour: args.preferredHour,
        preferredDays: args.preferredDays,
        nextScheduledAt,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("scheduleSettings", {
        platform: args.platform,
        isEnabled: args.isEnabled,
        frequency: args.frequency,
        preferredHour: args.preferredHour,
        preferredDays: args.preferredDays,
        nextScheduledAt,
        updatedAt: Date.now(),
      });
    }
  },
});

// Toggle enabled status
export const toggleEnabled = mutation({
  args: {
    platform: v.union(
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("youtube"),
      v.literal("all")
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("scheduleSettings")
      .withIndex("by_platform", (q) => q.eq("platform", args.platform))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isEnabled: !existing.isEnabled,
        updatedAt: Date.now(),
      });
      return !existing.isEnabled;
    }
    return false;
  },
});

// Update last run time
export const updateLastRun = mutation({
  args: {
    platform: v.union(
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("youtube"),
      v.literal("all")
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("scheduleSettings")
      .withIndex("by_platform", (q) => q.eq("platform", args.platform))
      .first();

    if (existing) {
      const nextScheduledAt = calculateNextRun(
        existing.frequency,
        existing.preferredHour,
        existing.preferredDays
      );

      await ctx.db.patch(existing._id, {
        lastRunAt: Date.now(),
        nextScheduledAt,
        updatedAt: Date.now(),
      });
    }
  },
});

// Initialize default settings if none exist
export const initializeDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("scheduleSettings").collect();

    if (existing.length === 0) {
      // Create default "all platforms" setting
      await ctx.db.insert("scheduleSettings", {
        platform: "all",
        isEnabled: true,
        frequency: "daily",
        preferredHour: 6, // 6 AM UTC
        updatedAt: Date.now(),
        nextScheduledAt: calculateNextRun("daily", 6, undefined),
      });
    }

    return { initialized: existing.length === 0 };
  },
});

// Helper function to calculate next run time
function calculateNextRun(
  frequency: Frequency,
  preferredHour: number,
  preferredDays?: number[]
): number {
  const now = new Date();
  const next = new Date(now);

  // Set to preferred hour
  next.setUTCHours(preferredHour, 0, 0, 0);

  switch (frequency) {
    case "hourly":
      // Next hour
      next.setUTCHours(now.getUTCHours() + 1, 0, 0, 0);
      break;

    case "every_6_hours":
      // Next 6-hour mark (0, 6, 12, 18)
      const sixHourBlock = Math.floor(now.getUTCHours() / 6);
      next.setUTCHours((sixHourBlock + 1) * 6, 0, 0, 0);
      if (next <= now) {
        next.setUTCHours(next.getUTCHours() + 6);
      }
      break;

    case "every_12_hours":
      // Next 12-hour mark
      if (now.getUTCHours() < preferredHour) {
        next.setUTCHours(preferredHour, 0, 0, 0);
      } else if (now.getUTCHours() < preferredHour + 12) {
        next.setUTCHours(preferredHour + 12, 0, 0, 0);
      } else {
        next.setDate(next.getDate() + 1);
        next.setUTCHours(preferredHour, 0, 0, 0);
      }
      break;

    case "daily":
      // If we've passed the preferred hour today, schedule for tomorrow
      if (now.getUTCHours() >= preferredHour) {
        next.setDate(next.getDate() + 1);
      }
      break;

    case "weekly":
      // Find next preferred day
      if (preferredDays && preferredDays.length > 0) {
        const currentDay = now.getUTCDay();
        const sortedDays = [...preferredDays].sort((a, b) => a - b);

        // Find the next day
        let nextDay = sortedDays.find(d => d > currentDay);
        if (!nextDay && currentDay === sortedDays[sortedDays.length - 1] && now.getUTCHours() < preferredHour) {
          nextDay = currentDay;
        }
        if (!nextDay) {
          nextDay = sortedDays[0];
          next.setDate(next.getDate() + (7 - currentDay + nextDay));
        } else {
          next.setDate(next.getDate() + (nextDay - currentDay));
        }
      } else {
        // Default to next week same day
        next.setDate(next.getDate() + 7);
      }
      break;
  }

  return next.getTime();
}
