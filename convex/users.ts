import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user by email
export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return user;
  },
});

// Check if user is an Orwell Admin
export const isOrwellAdmin = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    return user?.role === "orwellAdmin" && user?.isActive === true;
  },
});

// Get all Orwell Admins
export const getOrwellAdmins = query({
  args: {},
  handler: async (ctx) => {
    const admins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "orwellAdmin"))
      .collect();
    
    return admins.filter((admin) => admin.isActive);
  },
});

// Create a new user
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    role: v.union(
      v.literal("orwellAdmin"),
      v.literal("clientAdmin"),
      v.literal("clientUser")
    ),
    organizationId: v.optional(v.id("organizationProfile")),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const now = Date.now();
    const id = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      role: args.role,
      organizationId: args.organizationId,
      isActive: true,
      createdAt: now,
    });
    
    return id;
  },
});

// Update user role
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("orwellAdmin"),
      v.literal("clientAdmin"),
      v.literal("clientUser")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: now,
    });
  },
});

// Update user's last login
export const updateLastLogin = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (user) {
      const now = Date.now();
      await ctx.db.patch(user._id, {
        lastLoginAt: now,
        updatedAt: now,
      });
    }
  },
});

// Deactivate user
export const deactivateUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.userId, {
      isActive: false,
      updatedAt: now,
    });
  },
});

// Reactivate user
export const reactivateUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.userId, {
      isActive: true,
      updatedAt: now,
    });
  },
});

// Initialize demo Orwell Admin (for development)
export const initDemoOrwellAdmin = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existingUser) {
      // Update to Orwell Admin if not already
      if (existingUser.role !== "orwellAdmin") {
        await ctx.db.patch(existingUser._id, {
          role: "orwellAdmin",
          updatedAt: Date.now(),
        });
      }
      return existingUser._id;
    }

    // Create new Orwell Admin
    const now = Date.now();
    const id = await ctx.db.insert("users", {
      email: args.email,
      name: args.name || "Orwell Admin",
      role: "orwellAdmin",
      isActive: true,
      createdAt: now,
    });
    
    return id;
  },
});
