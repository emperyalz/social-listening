import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("markets")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("markets").collect();
  },
});

export const getById = query({
  args: { id: v.id("markets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    country: v.string(),
    city: v.string(),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("markets", {
      ...args,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("markets"),
    name: v.optional(v.string()),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    timezone: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("markets") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const seedMarkets = mutation({
  args: {},
  handler: async (ctx) => {
    const existingMarkets = await ctx.db.query("markets").collect();
    if (existingMarkets.length > 0) {
      return { message: "Markets already seeded", count: existingMarkets.length };
    }

    const defaultMarkets = [
      { name: "Panama City", country: "Panama", city: "Panama City", timezone: "America/Panama" },
      { name: "CDMX", country: "Mexico", city: "Mexico City", timezone: "America/Mexico_City" },
      { name: "Bogota", country: "Colombia", city: "Bogota", timezone: "America/Bogota" },
      { name: "Medellin", country: "Colombia", city: "Medellin", timezone: "America/Bogota" },
      { name: "Los Angeles", country: "USA", city: "Los Angeles", timezone: "America/Los_Angeles" },
      { name: "New York City", country: "USA", city: "New York", timezone: "America/New_York" },
      { name: "Miami", country: "USA", city: "Miami", timezone: "America/New_York" },
    ];

    for (const market of defaultMarkets) {
      await ctx.db.insert("markets", { ...market, isActive: true });
    }

    return { message: "Markets seeded successfully", count: defaultMarkets.length };
  },
});
