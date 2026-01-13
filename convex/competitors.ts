import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    marketId: v.optional(v.id("markets")),
    type: v.optional(
      v.union(
        v.literal("brokerage"),
        v.literal("individual_broker"),
        v.literal("developer"),
        v.literal("property_manager"),
        v.literal("investor"),
        v.literal("other")
      )
    ),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let competitors = await ctx.db.query("competitors").collect();

    if (args.marketId) {
      competitors = competitors.filter((c) => c.marketId === args.marketId);
    }
    if (args.type) {
      competitors = competitors.filter((c) => c.type === args.type);
    }
    if (args.isActive !== undefined) {
      competitors = competitors.filter((c) => c.isActive === args.isActive);
    }

    // Get market info and accounts for each competitor
    const competitorsWithData = await Promise.all(
      competitors.map(async (competitor) => {
        const market = await ctx.db.get(competitor.marketId);
        const accounts = await ctx.db
          .query("accounts")
          .withIndex("by_competitor", (q) => q.eq("competitorId", competitor._id))
          .collect();
        
        return { ...competitor, market, accounts };
      })
    );

    return competitorsWithData;
  },
});

export const getById = query({
  args: { id: v.id("competitors") },
  handler: async (ctx, args) => {
    const competitor = await ctx.db.get(args.id);
    if (!competitor) return null;

    const market = await ctx.db.get(competitor.marketId);
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_competitor", (q) => q.eq("competitorId", competitor._id))
      .collect();

    return { ...competitor, market, accounts };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("brokerage"),
      v.literal("individual_broker"),
      v.literal("developer"),
      v.literal("property_manager"),
      v.literal("investor"),
      v.literal("other")
    ),
    marketId: v.id("markets"),
    website: v.optional(v.string()),
    email: v.optional(v.string()),
    phones: v.optional(v.array(v.object({
      label: v.string(),
      number: v.string(),
      isWhatsApp: v.optional(v.boolean()),
    }))),
    address: v.optional(v.string()),
    address2: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    socialHandles: v.optional(v.object({
      instagram: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      youtube: v.optional(v.string()),
      facebook: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      twitter: v.optional(v.string()),
    })),
    notes: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const competitorId = await ctx.db.insert("competitors", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });

    // Auto-create tracked accounts for monitored platforms
    const socialHandles = args.socialHandles;
    if (socialHandles) {
      const platforms = ["instagram", "tiktok", "youtube"] as const;
      
      for (const platform of platforms) {
        const handle = socialHandles[platform];
        if (handle) {
          const cleanHandle = handle.replace(/^@/, "").trim();
          if (cleanHandle) {
            // Check if account already exists
            const existing = await ctx.db
              .query("accounts")
              .withIndex("by_platform_username", (q) =>
                q.eq("platform", platform).eq("username", cleanHandle)
              )
              .first();

            if (!existing) {
              let profileUrl = "";
              switch (platform) {
                case "instagram":
                  profileUrl = `https://www.instagram.com/${cleanHandle}`;
                  break;
                case "tiktok":
                  profileUrl = `https://www.tiktok.com/@${cleanHandle}`;
                  break;
                case "youtube":
                  profileUrl = `https://www.youtube.com/@${cleanHandle}`;
                  break;
              }

              await ctx.db.insert("accounts", {
                competitorId,
                platform,
                username: cleanHandle,
                profileUrl,
                marketId: args.marketId,
                companyName: args.name,
                accountType: args.type === "individual_broker" ? "individual_broker" 
                  : args.type === "developer" ? "developer" 
                  : args.type === "brokerage" ? "brokerage" 
                  : "other",
                isActive: true,
                isPaused: false,
                createdAt: Date.now(),
              });
            } else {
              // Link existing account to this competitor
              await ctx.db.patch(existing._id, { competitorId });
            }
          }
        }
      }
    }

    return competitorId;
  },
});

export const update = mutation({
  args: {
    id: v.id("competitors"),
    name: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("brokerage"),
        v.literal("individual_broker"),
        v.literal("developer"),
        v.literal("property_manager"),
        v.literal("investor"),
        v.literal("other")
      )
    ),
    marketId: v.optional(v.id("markets")),
    website: v.optional(v.string()),
    email: v.optional(v.string()),
    phones: v.optional(v.array(v.object({
      label: v.string(),
      number: v.string(),
      isWhatsApp: v.optional(v.boolean()),
    }))),
    address: v.optional(v.string()),
    address2: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    socialHandles: v.optional(v.object({
      instagram: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      youtube: v.optional(v.string()),
      facebook: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      twitter: v.optional(v.string()),
    })),
    notes: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(filtered).length > 0) {
      await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
    }

    // If social handles changed, update/create accounts
    if (args.socialHandles) {
      const competitor = await ctx.db.get(id);
      if (!competitor) return;

      const platforms = ["instagram", "tiktok", "youtube"] as const;
      
      for (const platform of platforms) {
        const handle = args.socialHandles[platform];
        if (handle) {
          const cleanHandle = handle.replace(/^@/, "").trim();
          
          // Find existing account for this competitor and platform
          const existingForCompetitor = await ctx.db
            .query("accounts")
            .withIndex("by_competitor", (q) => q.eq("competitorId", id))
            .filter((q) => q.eq(q.field("platform"), platform))
            .first();

          if (existingForCompetitor) {
            // Update existing account
            let profileUrl = "";
            switch (platform) {
              case "instagram":
                profileUrl = `https://www.instagram.com/${cleanHandle}`;
                break;
              case "tiktok":
                profileUrl = `https://www.tiktok.com/@${cleanHandle}`;
                break;
              case "youtube":
                profileUrl = `https://www.youtube.com/@${cleanHandle}`;
                break;
            }
            await ctx.db.patch(existingForCompetitor._id, {
              username: cleanHandle,
              profileUrl,
            });
          } else if (cleanHandle) {
            // Create new account
            let profileUrl = "";
            switch (platform) {
              case "instagram":
                profileUrl = `https://www.instagram.com/${cleanHandle}`;
                break;
              case "tiktok":
                profileUrl = `https://www.tiktok.com/@${cleanHandle}`;
                break;
              case "youtube":
                profileUrl = `https://www.youtube.com/@${cleanHandle}`;
                break;
            }

            await ctx.db.insert("accounts", {
              competitorId: id,
              platform,
              username: cleanHandle,
              profileUrl,
              marketId: competitor.marketId,
              companyName: competitor.name,
              accountType: competitor.type === "individual_broker" ? "individual_broker" 
                : competitor.type === "developer" ? "developer" 
                : competitor.type === "brokerage" ? "brokerage" 
                : "other",
              isActive: true,
              createdAt: Date.now(),
            });
          }
        }
      }
    }

    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("competitors") },
  handler: async (ctx, args) => {
    // Get all accounts linked to this competitor
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_competitor", (q) => q.eq("competitorId", args.id))
      .collect();

    // Unlink accounts (don't delete, just remove competitor reference)
    for (const account of accounts) {
      await ctx.db.patch(account._id, { competitorId: undefined });
    }

    await ctx.db.delete(args.id);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const competitors = await ctx.db.query("competitors").collect();
    const accounts = await ctx.db.query("accounts").collect();

    const byType = competitors.reduce(
      (acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byMarket = competitors.reduce(
      (acc, c) => {
        const key = c.marketId;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const linkedAccounts = accounts.filter(a => a.competitorId).length;
    const unlinkedAccounts = accounts.filter(a => !a.competitorId).length;

    return {
      total: competitors.length,
      active: competitors.filter((c) => c.isActive).length,
      byType,
      byMarket,
      totalAccounts: accounts.length,
      linkedAccounts,
      unlinkedAccounts,
    };
  },
});

// Migration helper: Create competitors from existing accounts
export const migrateFromAccounts = mutation({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("accounts").collect();
    const created: string[] = [];
    const linked: string[] = [];

    // Group accounts by companyName and marketId
    const grouped: Record<string, typeof accounts> = {};
    
    for (const account of accounts) {
      if (account.competitorId) continue; // Already linked
      
      const key = `${account.companyName || account.username}-${account.marketId}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(account);
    }

    // Create competitors for each group
    for (const key of Object.keys(grouped)) {
      const groupAccounts = grouped[key];
      const firstAccount = groupAccounts[0];
      
      // Build social handles from accounts
      const socialHandles: Record<string, string> = {};
      for (const acc of groupAccounts) {
        socialHandles[acc.platform] = acc.username;
      }

      // Create competitor
      const competitorId = await ctx.db.insert("competitors", {
        name: firstAccount.companyName || firstAccount.username,
        type: firstAccount.accountType,
        marketId: firstAccount.marketId,
        socialHandles: socialHandles as any,
        isActive: true,
        createdAt: Date.now(),
      });

      created.push(firstAccount.companyName || firstAccount.username);

      // Link all accounts to this competitor
      for (const acc of groupAccounts) {
        await ctx.db.patch(acc._id, { competitorId });
        linked.push(acc.username);
      }
    }

    return {
      competitorsCreated: created.length,
      accountsLinked: linked.length,
      created,
      linked,
    };
  },
});

// Cleanup helper: Extract clean usernames from URLs in social handles and accounts
export const cleanupSocialHandles = mutation({
  args: {},
  handler: async (ctx) => {
    const competitors = await ctx.db.query("competitors").collect();
    const accounts = await ctx.db.query("accounts").collect();
    let competitorsUpdated = 0;
    let accountsUpdated = 0;

    // Helper to extract username from URL
    const extractHandle = (platform: string, input: string): string => {
      if (!input) return "";
      let cleaned = input.trim().replace(/^@/, "");
      
      // If it doesn't look like a URL, return as-is
      if (!cleaned.includes("/") && !cleaned.includes(".")) {
        return cleaned;
      }
      
      // Try to parse as URL
      try {
        let urlString = cleaned;
        if (!urlString.startsWith("http")) {
          urlString = "https://" + urlString;
        }
        const url = new URL(urlString);
        const pathname = url.pathname.replace(/\/$/, "");
        
        switch (platform) {
          case "instagram":
            const igParts = pathname.split("/").filter(Boolean);
            if (igParts.length > 0) return igParts[0];
            break;
          case "tiktok":
            const ttParts = pathname.split("/").filter(Boolean);
            if (ttParts.length > 0) return ttParts[0].replace(/^@/, "");
            break;
          case "youtube":
            if (pathname.startsWith("/@")) return pathname.slice(2);
            if (pathname.startsWith("/c/")) return pathname.slice(3);
            if (pathname.startsWith("/channel/")) return pathname.slice(9);
            const ytParts = pathname.split("/").filter(Boolean);
            if (ytParts.length > 0) return ytParts[0].replace(/^@/, "");
            break;
          case "facebook":
            const fbParts = pathname.split("/").filter(Boolean);
            if (fbParts.length > 0) return fbParts[0];
            break;
          case "linkedin":
            if (pathname.startsWith("/in/")) return "in/" + pathname.slice(4).split("/")[0];
            if (pathname.startsWith("/company/")) return "company/" + pathname.slice(9).split("/")[0];
            break;
          case "twitter":
            const xParts = pathname.split("/").filter(Boolean);
            if (xParts.length > 0) return xParts[0];
            break;
        }
      } catch (e) {}
      
      return cleaned;
    };

    // Clean competitor social handles
    for (const competitor of competitors) {
      if (!competitor.socialHandles) continue;
      
      const cleaned: Record<string, string | undefined> = {};
      let needsUpdate = false;
      
      for (const [platform, handle] of Object.entries(competitor.socialHandles)) {
        if (handle) {
          const cleanedHandle = extractHandle(platform, handle as string);
          cleaned[platform] = cleanedHandle;
          if (cleanedHandle !== handle) {
            needsUpdate = true;
          }
        }
      }
      
      if (needsUpdate) {
        await ctx.db.patch(competitor._id, { 
          socialHandles: cleaned as any,
          updatedAt: Date.now()
        });
        competitorsUpdated++;
      }
    }

    // Clean account usernames and profile URLs
    for (const account of accounts) {
      const cleanedUsername = extractHandle(account.platform, account.username);
      if (cleanedUsername !== account.username) {
        let profileUrl = "";
        switch (account.platform) {
          case "instagram":
            profileUrl = `https://www.instagram.com/${cleanedUsername}`;
            break;
          case "tiktok":
            profileUrl = `https://www.tiktok.com/@${cleanedUsername}`;
            break;
          case "youtube":
            if (cleanedUsername.startsWith("UC") && cleanedUsername.length > 20) {
              profileUrl = `https://www.youtube.com/channel/${cleanedUsername}`;
            } else {
              profileUrl = `https://www.youtube.com/@${cleanedUsername}`;
            }
            break;
        }
        
        await ctx.db.patch(account._id, { 
          username: cleanedUsername,
          profileUrl: profileUrl || account.profileUrl,
        });
        accountsUpdated++;
      }
      
      // Also ensure isPaused is set
      if (account.isPaused === undefined) {
        await ctx.db.patch(account._id, { isPaused: false });
      }
    }

    return {
      competitorsUpdated,
      accountsUpdated,
    };
  },
});
