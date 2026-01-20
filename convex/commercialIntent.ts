import { v } from "convex/values";
import { query } from "./_generated/server";

// ============================================
// COMMERCIAL INTENT INTELLIGENCE QUERIES
// The "Sales Hunter" / The "Money" Module
// ============================================

// Intent classification keywords
const INTENT_KEYWORDS = {
  // Tier 1: Interest - General positive engagement
  interest: [
    "cool", "nice", "love this", "love it", "amazing", "beautiful", "gorgeous",
    "stunning", "wow", "incredible", "awesome", "fire", "insane", "perfect",
    "want", "need", "dream", "goals", "😍", "🔥", "❤️", "💕", "😻", "🙌",
    "👏", "💯", "✨", "🤩", "interested", "following"
  ],
  // Tier 2: Inquiry - Questions indicating consideration
  inquiry: [
    "how to", "how do", "what is", "where is", "when", "which",
    "ingredients", "size", "sizes", "dimensions", "specs", "specification",
    "details", "info", "information", "tell me more", "more info",
    "how does", "does it", "can it", "is it", "are they", "what's the",
    "availability", "available", "in stock", "color", "colors", "options",
    "?"
  ],
  // Tier 3: High Intent - Ready to buy signals
  highIntent: [
    "price", "cost", "how much", "pricing", "buy", "purchase", "order",
    "link", "website", "store", "shop", "shipping", "ship to", "deliver",
    "delivery", "payment", "pay", "checkout", "cart", "discount", "code",
    "promo", "sale", "deal", "offer", "coupon", "where can i buy",
    "where to buy", "how to order", "how to purchase", "dm me", "dm'd",
    "sent dm", "check dm", "pls dm", "please dm", "restock", "back in stock",
    "💰", "💵", "💳", "🛒", "take my money"
  ]
};

// Classify a comment's intent tier
function classifyIntent(text: string): {
  tier: 1 | 2 | 3;
  tierName: "interest" | "inquiry" | "highIntent";
  matchedKeywords: string[];
} {
  const lowerText = text.toLowerCase();
  const matched: string[] = [];
  
  // Check Tier 3 first (highest priority)
  for (const keyword of INTENT_KEYWORDS.highIntent) {
    if (lowerText.includes(keyword.toLowerCase())) {
      matched.push(keyword);
    }
  }
  if (matched.length > 0) {
    return { tier: 3, tierName: "highIntent", matchedKeywords: matched };
  }
  
  // Check Tier 2
  for (const keyword of INTENT_KEYWORDS.inquiry) {
    if (lowerText.includes(keyword.toLowerCase())) {
      matched.push(keyword);
    }
  }
  if (matched.length > 0) {
    return { tier: 2, tierName: "inquiry", matchedKeywords: matched };
  }
  
  // Check Tier 1
  for (const keyword of INTENT_KEYWORDS.interest) {
    if (lowerText.includes(keyword.toLowerCase())) {
      matched.push(keyword);
    }
  }
  if (matched.length > 0) {
    return { tier: 1, tierName: "interest", matchedKeywords: matched };
  }
  
  // Default to Tier 1 if no matches (neutral)
  return { tier: 1, tierName: "interest", matchedKeywords: [] };
}

// Get commercial intent analysis
export const getCommercialIntentAnalysis = query({
  args: {
    marketId: v.optional(v.id("markets")),
    platform: v.optional(
      v.union(v.literal("instagram"), v.literal("tiktok"), v.literal("youtube"))
    ),
    days: v.optional(v.number()),
    averageOrderValue: v.optional(v.number()), // Client-configurable AOV
  },
  handler: async (ctx, args) => {
    const daysAgo = args.days || 30;
    const aov = args.averageOrderValue || 150; // Default $150 AOV
    const cutoffDate = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
    
    // Get active accounts
    let accounts = await ctx.db
      .query("accounts")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    if (args.marketId) {
      accounts = accounts.filter((a) => a.marketId === args.marketId);
    }
    if (args.platform) {
      accounts = accounts.filter((a) => a.platform === args.platform);
    }
    
    const accountIds = new Set(accounts.map((a) => a._id));
    
    // Get recent posts
    const posts = await ctx.db
      .query("posts")
      .filter((q) => q.gte(q.field("postedAt"), cutoffDate))
      .collect();
    
    const filteredPosts = posts.filter((p) => accountIds.has(p.accountId));
    const postIds = new Set(filteredPosts.map((p) => p._id));
    
    // Get all comments for these posts
    const allComments = await ctx.db.query("comments").collect();
    const relevantComments = allComments.filter((c) => postIds.has(c.postId));
    
    // Classify all comments
    const classifiedComments = relevantComments.map((comment) => {
      const classification = classifyIntent(comment.text);
      return {
        ...comment,
        intentTier: classification.tier,
        intentTierName: classification.tierName,
        matchedKeywords: classification.matchedKeywords,
      };
    });
    
    // Aggregate by tier
    const tierCounts = {
      interest: classifiedComments.filter((c) => c.intentTier === 1).length,
      inquiry: classifiedComments.filter((c) => c.intentTier === 2).length,
      highIntent: classifiedComments.filter((c) => c.intentTier === 3).length,
    };
    
    // Calculate estimated opportunity value
    const estimatedOpportunityValue = tierCounts.highIntent * aov;
    
    // Get hot leads (Tier 3 only)
    const hotLeads = classifiedComments
      .filter((c) => c.intentTier === 3)
      .sort((a, b) => b.postedAt - a.postedAt)
      .slice(0, 50);
    
    // Enrich hot leads with post and account info
    const enrichedHotLeads = await Promise.all(
      hotLeads.map(async (lead) => {
        const post = await ctx.db.get(lead.postId);
        const account = post ? await ctx.db.get(post.accountId) : null;
        
        return {
          id: lead._id,
          text: lead.text,
          authorUsername: lead.authorUsername,
          authorDisplayName: lead.authorDisplayName,
          likesCount: lead.likesCount,
          postedAt: lead.postedAt,
          matchedKeywords: lead.matchedKeywords,
          postUrl: post?.postUrl,
          postCaption: post?.caption?.slice(0, 100),
          platform: post?.platform,
          accountUsername: account?.username,
          commentId: lead.platformCommentId,
        };
      })
    );
    
    // Get trending intent keywords
    const keywordCounts: Record<string, number> = {};
    classifiedComments
      .filter((c) => c.intentTier >= 2)
      .forEach((c) => {
        c.matchedKeywords.forEach((kw) => {
          keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
        });
      });
    
    const trendingKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));
    
    // Calculate conversion funnel
    const totalComments = classifiedComments.length;
    const funnel = {
      total: totalComments,
      interest: {
        count: tierCounts.interest,
        percentage: totalComments > 0 ? (tierCounts.interest / totalComments) * 100 : 0,
      },
      inquiry: {
        count: tierCounts.inquiry,
        percentage: totalComments > 0 ? (tierCounts.inquiry / totalComments) * 100 : 0,
      },
      highIntent: {
        count: tierCounts.highIntent,
        percentage: totalComments > 0 ? (tierCounts.highIntent / totalComments) * 100 : 0,
      },
    };
    
    // Platform breakdown
    const platformBreakdown: Record<string, { interest: number; inquiry: number; highIntent: number }> = {};
    
    for (const comment of classifiedComments) {
      const post = filteredPosts.find((p) => p._id === comment.postId);
      if (post) {
        if (!platformBreakdown[post.platform]) {
          platformBreakdown[post.platform] = { interest: 0, inquiry: 0, highIntent: 0 };
        }
        platformBreakdown[post.platform][comment.intentTierName]++;
      }
    }
    
    return {
      summary: {
        totalCommentsAnalyzed: totalComments,
        highIntentLeads: tierCounts.highIntent,
        estimatedOpportunityValue,
        averageOrderValue: aov,
        conversionPotential: totalComments > 0 
          ? ((tierCounts.highIntent / totalComments) * 100).toFixed(2) 
          : "0",
      },
      funnel,
      hotLeads: enrichedHotLeads,
      trendingKeywords,
      platformBreakdown,
      periodDays: daysAgo,
    };
  },
});

// Get intent trends over time
export const getIntentTrends = query({
  args: {
    marketId: v.optional(v.id("markets")),
    platform: v.optional(
      v.union(v.literal("instagram"), v.literal("tiktok"), v.literal("youtube"))
    ),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysAgo = args.days || 30;
    const cutoffDate = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
    
    // Get active accounts
    let accounts = await ctx.db
      .query("accounts")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    if (args.marketId) {
      accounts = accounts.filter((a) => a.marketId === args.marketId);
    }
    if (args.platform) {
      accounts = accounts.filter((a) => a.platform === args.platform);
    }
    
    const accountIds = new Set(accounts.map((a) => a._id));
    
    // Get recent posts
    const posts = await ctx.db
      .query("posts")
      .filter((q) => q.gte(q.field("postedAt"), cutoffDate))
      .collect();
    
    const filteredPosts = posts.filter((p) => accountIds.has(p.accountId));
    const postIds = new Set(filteredPosts.map((p) => p._id));
    
    // Get all comments
    const allComments = await ctx.db.query("comments").collect();
    const relevantComments = allComments.filter((c) => postIds.has(c.postId));
    
    // Group by day
    const dailyData: Record<string, { interest: number; inquiry: number; highIntent: number }> = {};
    
    for (let i = 0; i < daysAgo; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      dailyData[dateStr] = { interest: 0, inquiry: 0, highIntent: 0 };
    }
    
    for (const comment of relevantComments) {
      const classification = classifyIntent(comment.text);
      const dateStr = new Date(comment.postedAt).toISOString().split("T")[0];
      
      if (dailyData[dateStr]) {
        dailyData[dateStr][classification.tierName]++;
      }
    }
    
    // Convert to array and sort by date
    const trends = Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        ...data,
        total: data.interest + data.inquiry + data.highIntent,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return trends;
  },
});

// Get top performing posts by intent signals
export const getTopIntentPosts = query({
  args: {
    marketId: v.optional(v.id("markets")),
    platform: v.optional(
      v.union(v.literal("instagram"), v.literal("tiktok"), v.literal("youtube"))
    ),
    days: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysAgo = args.days || 30;
    const limit = args.limit || 10;
    const cutoffDate = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
    
    // Get active accounts
    let accounts = await ctx.db
      .query("accounts")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    if (args.marketId) {
      accounts = accounts.filter((a) => a.marketId === args.marketId);
    }
    if (args.platform) {
      accounts = accounts.filter((a) => a.platform === args.platform);
    }
    
    const accountIds = new Set(accounts.map((a) => a._id));
    const accountMap = new Map(accounts.map((a) => [a._id, a]));
    
    // Get recent posts
    const posts = await ctx.db
      .query("posts")
      .filter((q) => q.gte(q.field("postedAt"), cutoffDate))
      .collect();
    
    const filteredPosts = posts.filter((p) => accountIds.has(p.accountId));
    
    // Get all comments
    const allComments = await ctx.db.query("comments").collect();
    
    // Calculate intent score for each post
    const postScores = filteredPosts.map((post) => {
      const postComments = allComments.filter((c) => c.postId === post._id);
      let intentScore = 0;
      let highIntentCount = 0;
      let inquiryCount = 0;
      
      for (const comment of postComments) {
        const classification = classifyIntent(comment.text);
        // Weight: Tier 3 = 3 points, Tier 2 = 2 points, Tier 1 = 1 point
        intentScore += classification.tier;
        if (classification.tier === 3) highIntentCount++;
        if (classification.tier === 2) inquiryCount++;
      }
      
      const account = accountMap.get(post.accountId);
      
      return {
        postId: post._id,
        postUrl: post.postUrl,
        caption: post.caption?.slice(0, 150),
        thumbnailUrl: post.thumbnailUrl,
        platform: post.platform,
        postedAt: post.postedAt,
        accountUsername: account?.username,
        totalComments: postComments.length,
        highIntentCount,
        inquiryCount,
        intentScore,
      };
    });
    
    // Sort by intent score and return top posts
    return postScores
      .sort((a, b) => b.intentScore - a.intentScore)
      .slice(0, limit);
  },
});
