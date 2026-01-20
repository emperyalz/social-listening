import { v } from "convex/values";
import { query } from "./_generated/server";

// ============================================
// RESONANCE AUDIT QUERIES
// Strategy vs Reality Alignment Analysis
// ============================================

// Default strategy keywords (can be customized per client)
const DEFAULT_STRATEGY_CONCEPTS = {
  // Brand attributes
  brandAttributes: [
    { concept: "Luxury", keywords: ["luxury", "premium", "exclusive", "high-end", "elite", "upscale", "sophisticated"] },
    { concept: "Fast", keywords: ["fast", "quick", "rapid", "instant", "immediate", "speedy", "efficient"] },
    { concept: "Reliable", keywords: ["reliable", "trusted", "dependable", "consistent", "stable", "secure"] },
    { concept: "Innovative", keywords: ["innovative", "modern", "cutting-edge", "advanced", "new", "revolutionary"] },
    { concept: "Professional", keywords: ["professional", "expert", "experienced", "skilled", "qualified"] },
    { concept: "Affordable", keywords: ["affordable", "value", "budget", "economical", "competitive", "reasonable"] },
  ],
  // Target audience segments
  targetSegments: [
    { segment: "Luxury Investors", keywords: ["investment", "portfolio", "roi", "capital", "wealth", "high-net-worth"] },
    { segment: "First-Time Buyers", keywords: ["first home", "starter", "beginner", "new buyer", "first-time", "young"] },
    { segment: "Families", keywords: ["family", "kids", "children", "school", "bedroom", "space", "backyard"] },
    { segment: "Young Professionals", keywords: ["urban", "city", "downtown", "commute", "career", "modern", "trendy"] },
    { segment: "Retirees", keywords: ["retire", "peaceful", "quiet", "low-maintenance", "community", "senior"] },
  ],
  // Content themes
  contentThemes: [
    { theme: "Location", keywords: ["location", "neighborhood", "area", "district", "zone", "view", "beach", "ocean"] },
    { theme: "Amenities", keywords: ["pool", "gym", "spa", "amenities", "facilities", "parking", "security"] },
    { theme: "Price/Value", keywords: ["price", "value", "deal", "discount", "offer", "investment", "worth"] },
    { theme: "Lifestyle", keywords: ["lifestyle", "living", "experience", "comfort", "quality", "dream"] },
    { theme: "Architecture", keywords: ["design", "architecture", "style", "modern", "classic", "contemporary"] },
  ],
};

// Analyze text for concept presence
function analyzeTextForConcepts(
  text: string,
  concepts: { concept: string; keywords: string[] }[]
): { concept: string; score: number; matchedKeywords: string[] }[] {
  const lowerText = text.toLowerCase();
  
  return concepts.map(({ concept, keywords }) => {
    const matchedKeywords: string[] = [];
    let score = 0;
    
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        matchedKeywords.push(keyword);
        score += matches.length;
      }
    });
    
    return { concept, score, matchedKeywords };
  });
}

// Get resonance audit analysis
export const getResonanceAudit = query({
  args: {
    marketId: v.optional(v.id("markets")),
    platform: v.optional(
      v.union(v.literal("instagram"), v.literal("tiktok"), v.literal("youtube"))
    ),
    days: v.optional(v.number()),
    // Custom strategy concepts (would come from uploaded documents)
    customStrategyKeywords: v.optional(v.array(v.string())),
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
    
    // Get all comments for analysis
    const allComments = await ctx.db.query("comments").collect();
    const postIds = new Set(filteredPosts.map((p) => p._id));
    const relevantComments = allComments.filter((c) => postIds.has(c.postId));
    
    // Combine all content for analysis
    const captionContent = filteredPosts.map((p) => p.caption || "").join(" ");
    const commentContent = relevantComments.map((c) => c.text).join(" ");
    const allContent = captionContent + " " + commentContent;
    
    // ============================================
    // 1. STRATEGY HEX-GRID ANALYSIS
    // ============================================
    
    // Analyze brand attributes in content
    const brandAttributeAnalysis = analyzeTextForConcepts(
      allContent,
      DEFAULT_STRATEGY_CONCEPTS.brandAttributes
    );
    
    // Separate strategy (what we want) vs perception (what audience says)
    // For this demo, strategy is the top 3 concepts we want to emphasize
    // Perception is what actually appears in comments
    const strategyAttributes = ["Luxury", "Professional", "Innovative"]; // Target strategy
    const captionAnalysis = analyzeTextForConcepts(
      captionContent,
      DEFAULT_STRATEGY_CONCEPTS.brandAttributes
    );
    const commentAnalysis = analyzeTextForConcepts(
      commentContent,
      DEFAULT_STRATEGY_CONCEPTS.brandAttributes
    );
    
    // Build hex grid data
    const hexGridData = DEFAULT_STRATEGY_CONCEPTS.brandAttributes.map((attr) => {
      const inStrategy = strategyAttributes.includes(attr.concept);
      const captionScore = captionAnalysis.find((a) => a.concept === attr.concept)?.score || 0;
      const commentScore = commentAnalysis.find((a) => a.concept === attr.concept)?.score || 0;
      
      const isAligned = inStrategy && (captionScore > 0 || commentScore > 0);
      const hasError = inStrategy && captionScore === 0 && commentScore === 0;
      const isUnintended = !inStrategy && commentScore > 5; // Unexpected perception
      
      return {
        concept: attr.concept,
        inStrategy,
        captionPresence: captionScore,
        commentPresence: commentScore,
        totalPresence: captionScore + commentScore,
        status: hasError ? "error" : isUnintended ? "warning" : isAligned ? "aligned" : "neutral",
      };
    });
    
    // ============================================
    // 2. MESSAGING MATCH SCORE
    // ============================================
    
    // Calculate how well strategy keywords appear in user-generated content
    const strategyKeywords = strategyAttributes.flatMap(
      (attr) => DEFAULT_STRATEGY_CONCEPTS.brandAttributes.find((a) => a.concept === attr)?.keywords || []
    );
    
    let strategyKeywordMatches = 0;
    let totalStrategyKeywords = strategyKeywords.length;
    
    strategyKeywords.forEach((keyword) => {
      if (commentContent.toLowerCase().includes(keyword.toLowerCase())) {
        strategyKeywordMatches++;
      }
    });
    
    const messagingMatchScore = totalStrategyKeywords > 0
      ? Math.round((strategyKeywordMatches / totalStrategyKeywords) * 100)
      : 0;
    
    // ============================================
    // 3. SEGMENT GAP ANALYSIS
    // ============================================
    
    const segmentAnalysis = analyzeTextForConcepts(
      commentContent,
      DEFAULT_STRATEGY_CONCEPTS.targetSegments.map((s) => ({
        concept: s.segment,
        keywords: s.keywords,
      }))
    );
    
    // Target segments (what we want to reach)
    const targetSegments = ["Luxury Investors", "Young Professionals"];
    
    const segmentGapAnalysis = DEFAULT_STRATEGY_CONCEPTS.targetSegments.map((seg) => {
      const analysis = segmentAnalysis.find((a) => a.concept === seg.segment);
      const isTargeted = targetSegments.includes(seg.segment);
      const presence = analysis?.score || 0;
      
      let status: "on-target" | "under-target" | "over-performing" | "neutral";
      if (isTargeted && presence > 5) status = "on-target";
      else if (isTargeted && presence <= 5) status = "under-target";
      else if (!isTargeted && presence > 10) status = "over-performing";
      else status = "neutral";
      
      return {
        segment: seg.segment,
        isTargeted,
        presence,
        matchedKeywords: analysis?.matchedKeywords || [],
        status,
      };
    });
    
    // ============================================
    // 4. CONTENT THEME ANALYSIS
    // ============================================
    
    const themeAnalysis = analyzeTextForConcepts(
      allContent,
      DEFAULT_STRATEGY_CONCEPTS.contentThemes.map((t) => ({
        concept: t.theme,
        keywords: t.keywords,
      }))
    );
    
    const contentThemes = themeAnalysis
      .sort((a, b) => b.score - a.score)
      .map((theme) => ({
        theme: theme.concept,
        score: theme.score,
        matchedKeywords: theme.matchedKeywords,
        percentage: themeAnalysis.reduce((sum, t) => sum + t.score, 0) > 0
          ? Math.round((theme.score / themeAnalysis.reduce((sum, t) => sum + t.score, 0)) * 100)
          : 0,
      }));
    
    // ============================================
    // 5. ALIGNMENT ERRORS
    // ============================================
    
    const alignmentErrors = hexGridData
      .filter((h) => h.status === "error")
      .map((h) => ({
        type: "Strategy-Perception Gap",
        concept: h.concept,
        message: `"${h.concept}" is in your strategy but not reflected in audience comments`,
        severity: "high",
      }));
    
    const alignmentWarnings = hexGridData
      .filter((h) => h.status === "warning")
      .map((h) => ({
        type: "Unintended Perception",
        concept: h.concept,
        message: `Audience perceives "${h.concept}" strongly, but it's not in your core strategy`,
        severity: "medium",
      }));
    
    // ============================================
    // SUMMARY
    // ============================================
    
    const alignedCount = hexGridData.filter((h) => h.status === "aligned").length;
    const errorCount = hexGridData.filter((h) => h.status === "error").length;
    const warningCount = hexGridData.filter((h) => h.status === "warning").length;
    
    const overallAlignmentScore = strategyAttributes.length > 0
      ? Math.round((alignedCount / strategyAttributes.length) * 100)
      : 0;
    
    return {
      summary: {
        overallAlignmentScore,
        messagingMatchScore,
        alignedConcepts: alignedCount,
        alignmentErrors: errorCount,
        alignmentWarnings: warningCount,
        totalPostsAnalyzed: filteredPosts.length,
        totalCommentsAnalyzed: relevantComments.length,
      },
      hexGrid: hexGridData,
      segmentGapAnalysis,
      contentThemes,
      alignmentIssues: [...alignmentErrors, ...alignmentWarnings],
      strategyConfig: {
        targetAttributes: strategyAttributes,
        targetSegments,
        activeDocuments: ["Brandbook_v2.pdf", "Q3_Goals.docx"], // Placeholder
      },
      periodDays: daysAgo,
    };
  },
});

// Get alignment trends over time
export const getAlignmentTrends = query({
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
    
    // Get recent posts grouped by day
    const posts = await ctx.db
      .query("posts")
      .filter((q) => q.gte(q.field("postedAt"), cutoffDate))
      .collect();
    
    const filteredPosts = posts.filter((p) => accountIds.has(p.accountId));
    
    // Group by day and calculate daily alignment
    const dailyData: Record<string, { posts: number; alignmentScore: number }> = {};
    
    for (let i = 0; i < daysAgo; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      dailyData[dateStr] = { posts: 0, alignmentScore: 0 };
    }
    
    // Count posts per day (simplified trend)
    filteredPosts.forEach((post) => {
      const dateStr = new Date(post.postedAt).toISOString().split("T")[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].posts++;
        // Simplified alignment score calculation
        const hasStrategyKeywords = (post.caption || "").toLowerCase().includes("luxury") ||
          (post.caption || "").toLowerCase().includes("professional");
        dailyData[dateStr].alignmentScore += hasStrategyKeywords ? 80 : 40;
      }
    });
    
    // Average alignment scores
    Object.keys(dailyData).forEach((date) => {
      if (dailyData[date].posts > 0) {
        dailyData[date].alignmentScore = Math.round(
          dailyData[date].alignmentScore / dailyData[date].posts
        );
      }
    });
    
    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        posts: data.posts,
        alignmentScore: data.alignmentScore,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

// Get top performing aligned content
export const getTopAlignedContent = query({
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
    
    // Strategy keywords to check
    const strategyKeywords = ["luxury", "premium", "exclusive", "professional", "expert", "innovative", "modern"];
    
    // Score posts by alignment
    const scoredPosts = await Promise.all(
      filteredPosts.map(async (post) => {
        const caption = (post.caption || "").toLowerCase();
        let alignmentScore = 0;
        const matchedKeywords: string[] = [];
        
        strategyKeywords.forEach((keyword) => {
          if (caption.includes(keyword)) {
            alignmentScore += 10;
            matchedKeywords.push(keyword);
          }
        });
        
        // Get engagement data
        const snapshot = await ctx.db
          .query("postSnapshots")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .order("desc")
          .first();
        
        const account = accountMap.get(post.accountId);
        
        return {
          postId: post._id,
          postUrl: post.postUrl,
          caption: post.caption?.slice(0, 150),
          thumbnailUrl: post.thumbnailUrl,
          platform: post.platform,
          postedAt: post.postedAt,
          accountUsername: account?.username,
          alignmentScore,
          matchedKeywords,
          likes: snapshot?.likesCount || 0,
          comments: snapshot?.commentsCount || 0,
          engagement: (snapshot?.likesCount || 0) + (snapshot?.commentsCount || 0),
        };
      })
    );
    
    // Return top aligned posts with best engagement
    return scoredPosts
      .filter((p) => p.alignmentScore > 0)
      .sort((a, b) => {
        // Sort by alignment first, then by engagement
        if (b.alignmentScore !== a.alignmentScore) {
          return b.alignmentScore - a.alignmentScore;
        }
        return b.engagement - a.engagement;
      })
      .slice(0, limit);
  },
});
