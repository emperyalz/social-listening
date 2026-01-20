import { v } from "convex/values";
import { query } from "./_generated/server";

// ============================================
// CONTENT REVERSE-ENGINEERING QUERIES
// Analyze What Makes Top Content Work
// ============================================

// Content format patterns
const CONTENT_FORMATS = {
  carousel: ["swipe", "slide", "1/", "2/", "3/", "4/", "5/", "👆", "👉"],
  video: ["watch", "video", "clip", "reel", "🎥", "📹", "▶️"],
  tutorial: ["how to", "tutorial", "guide", "step", "tips", "learn", "diy"],
  behindTheScenes: ["behind the scenes", "bts", "making of", "sneak peek", "exclusive look"],
  userGenerated: ["repost", "feature", "@", "thanks to", "credit", "shoutout"],
  question: ["?", "what do you think", "tell me", "comment below", "vote", "poll"],
  announcement: ["new", "launching", "introducing", "announcing", "coming soon", "release"],
  lifestyle: ["morning", "routine", "day in", "life of", "vibes", "mood", "aesthetic"],
  promotional: ["sale", "offer", "discount", "limited", "exclusive", "shop now", "link in bio"],
  storytelling: ["story", "journey", "experience", "adventure", "remember", "once upon"],
};

// Hook patterns
const HOOK_PATTERNS = {
  question: { regex: /^[^.!]*\?/, weight: 1.2, label: "Opens with Question" },
  number: { regex: /^[\d]+|^(one|two|three|four|five|six|seven|eight|nine|ten)/i, weight: 1.1, label: "Number Hook" },
  how: { regex: /^how\s/i, weight: 1.15, label: "How-to Hook" },
  why: { regex: /^why\s/i, weight: 1.1, label: "Why Hook" },
  this: { regex: /^this\s/i, weight: 1.05, label: "This Hook" },
  emoji: { regex: /^[\u{1F300}-\u{1F9FF}]/u, weight: 1.0, label: "Emoji Lead" },
  urgent: { regex: /^(stop|wait|breaking|urgent|important)/i, weight: 1.25, label: "Urgency Hook" },
  personal: { regex: /^(i|my|we|our)\s/i, weight: 1.1, label: "Personal Hook" },
};

// CTA patterns
const CTA_PATTERNS = [
  { pattern: "link in bio", label: "Link in Bio" },
  { pattern: "comment below", label: "Comment CTA" },
  { pattern: "follow", label: "Follow CTA" },
  { pattern: "share", label: "Share CTA" },
  { pattern: "save", label: "Save CTA" },
  { pattern: "tag", label: "Tag CTA" },
  { pattern: "dm", label: "DM CTA" },
  { pattern: "like", label: "Like CTA" },
  { pattern: "shop", label: "Shop CTA" },
  { pattern: "click", label: "Click CTA" },
  { pattern: "subscribe", label: "Subscribe CTA" },
  { pattern: "book", label: "Booking CTA" },
];

// Analyze content structure
function analyzeContentStructure(caption: string): {
  format: string;
  hookType: string | null;
  hookStrength: number;
  hasCTA: boolean;
  ctaTypes: string[];
  hashtagCount: number;
  mentionCount: number;
  emojiCount: number;
  wordCount: number;
  lineCount: number;
  hasListFormat: boolean;
  readingTime: number;
} {
  const lowerCaption = caption.toLowerCase();
  
  // Detect format
  let detectedFormat = "standard";
  for (const [format, indicators] of Object.entries(CONTENT_FORMATS)) {
    if (indicators.some((ind) => lowerCaption.includes(ind.toLowerCase()))) {
      detectedFormat = format;
      break;
    }
  }
  
  // Detect hook type
  let hookType: string | null = null;
  let hookStrength = 1.0;
  for (const [type, config] of Object.entries(HOOK_PATTERNS)) {
    if (config.regex.test(caption.trim())) {
      hookType = config.label;
      hookStrength = config.weight;
      break;
    }
  }
  
  // Detect CTAs
  const ctaTypes: string[] = [];
  for (const cta of CTA_PATTERNS) {
    if (lowerCaption.includes(cta.pattern)) {
      ctaTypes.push(cta.label);
    }
  }
  
  // Count elements
  const hashtagCount = (caption.match(/#\w+/g) || []).length;
  const mentionCount = (caption.match(/@\w+/g) || []).length;
  const emojiCount = (caption.match(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;
  const wordCount = caption.split(/\s+/).filter((w) => w.length > 0).length;
  const lineCount = caption.split(/\n/).filter((l) => l.trim().length > 0).length;
  const hasListFormat = /(\n[-•*]|\n\d+\.)/.test(caption);
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed
  
  return {
    format: detectedFormat,
    hookType,
    hookStrength,
    hasCTA: ctaTypes.length > 0,
    ctaTypes,
    hashtagCount,
    mentionCount,
    emojiCount,
    wordCount,
    lineCount,
    hasListFormat,
    readingTime,
  };
}

// Main content reverse-engineering query
export const getContentAnalysis = query({
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
    const accountMap = new Map(accounts.map((a) => [a._id, a]));
    
    // Get recent posts with engagement
    const posts = await ctx.db
      .query("posts")
      .filter((q) => q.gte(q.field("postedAt"), cutoffDate))
      .collect();
    
    const filteredPosts = posts.filter((p) => accountIds.has(p.accountId));
    
    // Get snapshots for engagement data
    const postsWithEngagement = await Promise.all(
      filteredPosts.map(async (post) => {
        const snapshot = await ctx.db
          .query("postSnapshots")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .order("desc")
          .first();
        
        const account = accountMap.get(post.accountId);
        const engagement = (snapshot?.likesCount || 0) + (snapshot?.commentsCount || 0);
        
        return {
          ...post,
          account,
          likes: snapshot?.likesCount || 0,
          comments: snapshot?.commentsCount || 0,
          engagement,
          engagementRate: account?.followerCount 
            ? ((engagement / account.followerCount) * 100).toFixed(2)
            : "0",
        };
      })
    );
    
    // Sort by engagement
    const sortedPosts = postsWithEngagement.sort((a, b) => b.engagement - a.engagement);
    
    // Analyze top performing posts
    const topPercentile = Math.ceil(sortedPosts.length * 0.25); // Top 25%
    const topPosts = sortedPosts.slice(0, topPercentile);
    const bottomPosts = sortedPosts.slice(-topPercentile);
    
    // ============================================
    // 1. FORMAT ANALYSIS
    // ============================================
    
    const formatPerformance: Record<string, { count: number; totalEngagement: number; avgEngagement: number }> = {};
    
    sortedPosts.forEach((post) => {
      const structure = analyzeContentStructure(post.caption || "");
      if (!formatPerformance[structure.format]) {
        formatPerformance[structure.format] = { count: 0, totalEngagement: 0, avgEngagement: 0 };
      }
      formatPerformance[structure.format].count++;
      formatPerformance[structure.format].totalEngagement += post.engagement;
    });
    
    // Calculate averages
    Object.keys(formatPerformance).forEach((format) => {
      formatPerformance[format].avgEngagement = Math.round(
        formatPerformance[format].totalEngagement / formatPerformance[format].count
      );
    });
    
    const formatAnalysis = Object.entries(formatPerformance)
      .map(([format, data]) => ({ format, ...data }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);
    
    // ============================================
    // 2. HOOK ANALYSIS
    // ============================================
    
    const hookPerformance: Record<string, { count: number; totalEngagement: number; avgEngagement: number }> = {};
    
    sortedPosts.forEach((post) => {
      const structure = analyzeContentStructure(post.caption || "");
      const hookLabel = structure.hookType || "No Hook";
      
      if (!hookPerformance[hookLabel]) {
        hookPerformance[hookLabel] = { count: 0, totalEngagement: 0, avgEngagement: 0 };
      }
      hookPerformance[hookLabel].count++;
      hookPerformance[hookLabel].totalEngagement += post.engagement;
    });
    
    Object.keys(hookPerformance).forEach((hook) => {
      hookPerformance[hook].avgEngagement = Math.round(
        hookPerformance[hook].totalEngagement / hookPerformance[hook].count
      );
    });
    
    const hookAnalysis = Object.entries(hookPerformance)
      .map(([hook, data]) => ({ hook, ...data }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);
    
    // ============================================
    // 3. OPTIMAL LENGTH ANALYSIS
    // ============================================
    
    const lengthBuckets = [
      { label: "Very Short (0-50)", min: 0, max: 50 },
      { label: "Short (51-150)", min: 51, max: 150 },
      { label: "Medium (151-300)", min: 151, max: 300 },
      { label: "Long (301-500)", min: 301, max: 500 },
      { label: "Very Long (500+)", min: 501, max: Infinity },
    ];
    
    const lengthAnalysis = lengthBuckets.map((bucket) => {
      const postsInBucket = sortedPosts.filter((post) => {
        const wordCount = (post.caption || "").split(/\s+/).length;
        return wordCount >= bucket.min && wordCount <= bucket.max;
      });
      
      const totalEngagement = postsInBucket.reduce((sum, p) => sum + p.engagement, 0);
      
      return {
        label: bucket.label,
        count: postsInBucket.length,
        avgEngagement: postsInBucket.length > 0 
          ? Math.round(totalEngagement / postsInBucket.length) 
          : 0,
      };
    });
    
    // ============================================
    // 4. HASHTAG ANALYSIS
    // ============================================
    
    const hashtagBuckets = [
      { label: "None (0)", min: 0, max: 0 },
      { label: "Minimal (1-5)", min: 1, max: 5 },
      { label: "Moderate (6-15)", min: 6, max: 15 },
      { label: "Heavy (16-25)", min: 16, max: 25 },
      { label: "Maxed (26+)", min: 26, max: Infinity },
    ];
    
    const hashtagAnalysis = hashtagBuckets.map((bucket) => {
      const postsInBucket = sortedPosts.filter((post) => {
        const hashtagCount = ((post.caption || "").match(/#\w+/g) || []).length;
        return hashtagCount >= bucket.min && hashtagCount <= bucket.max;
      });
      
      const totalEngagement = postsInBucket.reduce((sum, p) => sum + p.engagement, 0);
      
      return {
        label: bucket.label,
        count: postsInBucket.length,
        avgEngagement: postsInBucket.length > 0 
          ? Math.round(totalEngagement / postsInBucket.length) 
          : 0,
      };
    });
    
    // ============================================
    // 5. CTA EFFECTIVENESS
    // ============================================
    
    const ctaPerformance: Record<string, { count: number; totalEngagement: number; avgEngagement: number }> = {
      "No CTA": { count: 0, totalEngagement: 0, avgEngagement: 0 },
    };
    
    sortedPosts.forEach((post) => {
      const structure = analyzeContentStructure(post.caption || "");
      
      if (structure.ctaTypes.length === 0) {
        ctaPerformance["No CTA"].count++;
        ctaPerformance["No CTA"].totalEngagement += post.engagement;
      } else {
        structure.ctaTypes.forEach((cta) => {
          if (!ctaPerformance[cta]) {
            ctaPerformance[cta] = { count: 0, totalEngagement: 0, avgEngagement: 0 };
          }
          ctaPerformance[cta].count++;
          ctaPerformance[cta].totalEngagement += post.engagement;
        });
      }
    });
    
    Object.keys(ctaPerformance).forEach((cta) => {
      if (ctaPerformance[cta].count > 0) {
        ctaPerformance[cta].avgEngagement = Math.round(
          ctaPerformance[cta].totalEngagement / ctaPerformance[cta].count
        );
      }
    });
    
    const ctaAnalysis = Object.entries(ctaPerformance)
      .map(([cta, data]) => ({ cta, ...data }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);
    
    // ============================================
    // 6. TOP VS BOTTOM COMPARISON
    // ============================================
    
    const analyzeGroup = (posts: typeof sortedPosts) => {
      const structures = posts.map((p) => analyzeContentStructure(p.caption || ""));
      
      return {
        avgWordCount: Math.round(
          structures.reduce((sum, s) => sum + s.wordCount, 0) / structures.length || 0
        ),
        avgHashtags: Math.round(
          structures.reduce((sum, s) => sum + s.hashtagCount, 0) / structures.length || 0
        ),
        avgEmojis: Math.round(
          structures.reduce((sum, s) => sum + s.emojiCount, 0) / structures.length || 0
        ),
        ctaUsage: Math.round(
          (structures.filter((s) => s.hasCTA).length / structures.length) * 100 || 0
        ),
        questionHooks: Math.round(
          (structures.filter((s) => s.hookType === "Opens with Question").length / structures.length) * 100 || 0
        ),
        listFormat: Math.round(
          (structures.filter((s) => s.hasListFormat).length / structures.length) * 100 || 0
        ),
      };
    };
    
    const topPerformersStats = topPosts.length > 0 ? analyzeGroup(topPosts) : null;
    const bottomPerformersStats = bottomPosts.length > 0 ? analyzeGroup(bottomPosts) : null;
    
    // ============================================
    // 7. TOP PERFORMING POSTS
    // ============================================
    
    const topPostsDetailed = topPosts.slice(0, 10).map((post) => {
      const structure = analyzeContentStructure(post.caption || "");
      return {
        postId: post._id,
        postUrl: post.postUrl,
        caption: post.caption?.slice(0, 200),
        thumbnailUrl: post.thumbnailUrl,
        platform: post.platform,
        postedAt: post.postedAt,
        accountUsername: post.account?.username,
        likes: post.likes,
        comments: post.comments,
        engagement: post.engagement,
        engagementRate: post.engagementRate,
        format: structure.format,
        hookType: structure.hookType,
        hasCTA: structure.hasCTA,
        wordCount: structure.wordCount,
        hashtagCount: structure.hashtagCount,
      };
    });
    
    // ============================================
    // 8. POSTING TIME ANALYSIS
    // ============================================
    
    const hourlyPerformance: Record<number, { count: number; totalEngagement: number }> = {};
    const dayOfWeekPerformance: Record<number, { count: number; totalEngagement: number }> = {};
    
    sortedPosts.forEach((post) => {
      const date = new Date(post.postedAt);
      const hour = date.getHours();
      const day = date.getDay();
      
      if (!hourlyPerformance[hour]) {
        hourlyPerformance[hour] = { count: 0, totalEngagement: 0 };
      }
      hourlyPerformance[hour].count++;
      hourlyPerformance[hour].totalEngagement += post.engagement;
      
      if (!dayOfWeekPerformance[day]) {
        dayOfWeekPerformance[day] = { count: 0, totalEngagement: 0 };
      }
      dayOfWeekPerformance[day].count++;
      dayOfWeekPerformance[day].totalEngagement += post.engagement;
    });
    
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    const bestHours = Object.entries(hourlyPerformance)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        label: `${parseInt(hour)}:00`,
        avgEngagement: data.count > 0 ? Math.round(data.totalEngagement / data.count) : 0,
        postCount: data.count,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 5);
    
    const bestDays = Object.entries(dayOfWeekPerformance)
      .map(([day, data]) => ({
        day: parseInt(day),
        label: dayNames[parseInt(day)],
        avgEngagement: data.count > 0 ? Math.round(data.totalEngagement / data.count) : 0,
        postCount: data.count,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);
    
    return {
      summary: {
        totalPostsAnalyzed: sortedPosts.length,
        avgEngagement: sortedPosts.length > 0
          ? Math.round(sortedPosts.reduce((sum, p) => sum + p.engagement, 0) / sortedPosts.length)
          : 0,
        topFormat: formatAnalysis[0]?.format || "N/A",
        bestHook: hookAnalysis[0]?.hook || "N/A",
        optimalLength: lengthAnalysis.sort((a, b) => b.avgEngagement - a.avgEngagement)[0]?.label || "N/A",
        bestCTA: ctaAnalysis.filter((c) => c.cta !== "No CTA")[0]?.cta || "N/A",
      },
      formatAnalysis,
      hookAnalysis,
      lengthAnalysis,
      hashtagAnalysis,
      ctaAnalysis,
      comparison: {
        topPerformers: topPerformersStats,
        bottomPerformers: bottomPerformersStats,
      },
      topPosts: topPostsDetailed,
      timingAnalysis: {
        bestHours,
        bestDays,
      },
      periodDays: daysAgo,
    };
  },
});

// Get winning formula summary
export const getWinningFormula = query({
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
    
    // Get engagement data
    const postsWithEngagement = await Promise.all(
      filteredPosts.map(async (post) => {
        const snapshot = await ctx.db
          .query("postSnapshots")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .order("desc")
          .first();
        
        return {
          ...post,
          engagement: (snapshot?.likesCount || 0) + (snapshot?.commentsCount || 0),
        };
      })
    );
    
    // Get top 10% posts
    const sortedPosts = postsWithEngagement.sort((a, b) => b.engagement - a.engagement);
    const topPosts = sortedPosts.slice(0, Math.ceil(sortedPosts.length * 0.1));
    
    if (topPosts.length === 0) {
      return {
        formula: null,
        confidence: 0,
      };
    }
    
    // Analyze top posts to find common patterns
    const patterns = topPosts.map((post) => analyzeContentStructure(post.caption || ""));
    
    // Find most common attributes
    const formatCounts: Record<string, number> = {};
    const hookCounts: Record<string, number> = {};
    const ctaCounts: Record<string, number> = {};
    
    let totalWordCount = 0;
    let totalHashtags = 0;
    let totalEmojis = 0;
    let ctaCount = 0;
    
    patterns.forEach((p) => {
      formatCounts[p.format] = (formatCounts[p.format] || 0) + 1;
      if (p.hookType) {
        hookCounts[p.hookType] = (hookCounts[p.hookType] || 0) + 1;
      }
      p.ctaTypes.forEach((cta) => {
        ctaCounts[cta] = (ctaCounts[cta] || 0) + 1;
      });
      totalWordCount += p.wordCount;
      totalHashtags += p.hashtagCount;
      totalEmojis += p.emojiCount;
      if (p.hasCTA) ctaCount++;
    });
    
    const topFormat = Object.entries(formatCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "standard";
    const topHook = Object.entries(hookCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const topCTA = Object.entries(ctaCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    
    return {
      formula: {
        format: topFormat,
        hook: topHook,
        cta: topCTA,
        avgWordCount: Math.round(totalWordCount / patterns.length),
        avgHashtags: Math.round(totalHashtags / patterns.length),
        avgEmojis: Math.round(totalEmojis / patterns.length),
        ctaUsagePercent: Math.round((ctaCount / patterns.length) * 100),
      },
      confidence: Math.min(100, topPosts.length * 10), // More data = higher confidence
      sampleSize: topPosts.length,
    };
  },
});
