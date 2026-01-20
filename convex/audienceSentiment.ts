import { v } from "convex/values";
import { query } from "./_generated/server";

// ============================================
// AUDIENCE & SENTIMENT DEEP DIVE QUERIES
// Comprehensive Audience & Sentiment Analysis
// ============================================

// Sentiment keywords and weights
const SENTIMENT_LEXICON = {
  positive: [
    { word: "love", weight: 3 },
    { word: "amazing", weight: 3 },
    { word: "beautiful", weight: 2 },
    { word: "perfect", weight: 3 },
    { word: "excellent", weight: 3 },
    { word: "awesome", weight: 2 },
    { word: "great", weight: 2 },
    { word: "wonderful", weight: 2 },
    { word: "fantastic", weight: 2 },
    { word: "incredible", weight: 2 },
    { word: "best", weight: 2 },
    { word: "good", weight: 1 },
    { word: "nice", weight: 1 },
    { word: "happy", weight: 2 },
    { word: "excited", weight: 2 },
    { word: "stunning", weight: 3 },
    { word: "gorgeous", weight: 3 },
    { word: "obsessed", weight: 2 },
    { word: "want", weight: 1 },
    { word: "need", weight: 1 },
    { word: "dream", weight: 2 },
    { word: "fire", weight: 2 },
    { word: "wow", weight: 2 },
    { word: "yes", weight: 1 },
    { word: "recommend", weight: 2 },
    { word: "impressed", weight: 2 },
  ],
  negative: [
    { word: "hate", weight: -3 },
    { word: "terrible", weight: -3 },
    { word: "awful", weight: -3 },
    { word: "bad", weight: -2 },
    { word: "worst", weight: -3 },
    { word: "ugly", weight: -2 },
    { word: "disappointed", weight: -2 },
    { word: "disappointing", weight: -2 },
    { word: "overpriced", weight: -2 },
    { word: "expensive", weight: -1 },
    { word: "scam", weight: -3 },
    { word: "fake", weight: -2 },
    { word: "poor", weight: -2 },
    { word: "waste", weight: -2 },
    { word: "never", weight: -1 },
    { word: "avoid", weight: -2 },
    { word: "horrible", weight: -3 },
    { word: "trash", weight: -3 },
    { word: "boring", weight: -1 },
    { word: "meh", weight: -1 },
    { word: "nope", weight: -1 },
    { word: "no", weight: -1 },
    { word: "problem", weight: -1 },
    { word: "issue", weight: -1 },
  ],
  // Emoji sentiment
  positiveEmoji: ["❤️", "😍", "🔥", "💕", "💯", "👏", "✨", "🙌", "😊", "🥰", "💜", "💙", "💚", "🤩", "😘"],
  negativeEmoji: ["😡", "😤", "👎", "💔", "😢", "😞", "🙄", "😒", "😑", "🤮", "🤢", "👿"],
};

// Engagement type indicators
const ENGAGEMENT_TYPES = {
  question: ["?", "how", "what", "where", "when", "why", "who", "which", "can you", "could you", "do you"],
  purchase: ["buy", "purchase", "order", "price", "cost", "available", "where to", "ship", "delivery", "dm me", "link"],
  compliment: ["love", "beautiful", "amazing", "gorgeous", "stunning", "perfect", "obsessed", "need", "want"],
  suggestion: ["should", "would be", "try", "consider", "maybe", "what if", "suggest"],
  share: ["share", "tag", "friend", "show", "check out", "look at"],
  support: ["thank", "thanks", "appreciate", "helpful", "great work", "keep up"],
};

// Analyze sentiment of text
function analyzeSentiment(text: string): {
  score: number;
  label: "positive" | "negative" | "neutral";
  confidence: number;
  positiveWords: string[];
  negativeWords: string[];
} {
  const lowerText = text.toLowerCase();
  let score = 0;
  const positiveWords: string[] = [];
  const negativeWords: string[] = [];
  
  // Check word sentiment
  SENTIMENT_LEXICON.positive.forEach(({ word, weight }) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = lowerText.match(regex);
    if (matches) {
      score += weight * matches.length;
      positiveWords.push(word);
    }
  });
  
  SENTIMENT_LEXICON.negative.forEach(({ word, weight }) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = lowerText.match(regex);
    if (matches) {
      score += weight * matches.length;
      negativeWords.push(word);
    }
  });
  
  // Check emoji sentiment
  SENTIMENT_LEXICON.positiveEmoji.forEach((emoji) => {
    const count = (text.match(new RegExp(emoji, "g")) || []).length;
    if (count > 0) {
      score += count * 2;
      positiveWords.push(emoji);
    }
  });
  
  SENTIMENT_LEXICON.negativeEmoji.forEach((emoji) => {
    const count = (text.match(new RegExp(emoji, "g")) || []).length;
    if (count > 0) {
      score -= count * 2;
      negativeWords.push(emoji);
    }
  });
  
  // Calculate label and confidence
  const totalIndicators = positiveWords.length + negativeWords.length;
  const confidence = totalIndicators > 0 
    ? Math.min(100, Math.round((totalIndicators / 5) * 100))
    : 20;
  
  const label: "positive" | "negative" | "neutral" = 
    score > 1 ? "positive" : score < -1 ? "negative" : "neutral";
  
  return {
    score,
    label,
    confidence,
    positiveWords,
    negativeWords,
  };
}

// Classify engagement type
function classifyEngagement(text: string): string[] {
  const lowerText = text.toLowerCase();
  const types: string[] = [];
  
  for (const [type, indicators] of Object.entries(ENGAGEMENT_TYPES)) {
    if (indicators.some((ind) => lowerText.includes(ind))) {
      types.push(type);
    }
  }
  
  return types.length > 0 ? types : ["general"];
}

// Main audience sentiment analysis query
export const getAudienceSentiment = query({
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
    
    // ============================================
    // 1. OVERALL SENTIMENT ANALYSIS
    // ============================================
    
    const commentSentiments = relevantComments.map((comment) => {
      const sentiment = analyzeSentiment(comment.text);
      const engagementTypes = classifyEngagement(comment.text);
      
      return {
        ...comment,
        sentiment,
        engagementTypes,
      };
    });
    
    const positiveComments = commentSentiments.filter((c) => c.sentiment.label === "positive");
    const negativeComments = commentSentiments.filter((c) => c.sentiment.label === "negative");
    const neutralComments = commentSentiments.filter((c) => c.sentiment.label === "neutral");
    
    const totalComments = commentSentiments.length;
    const sentimentDistribution = {
      positive: { 
        count: positiveComments.length, 
        percentage: totalComments > 0 ? Math.round((positiveComments.length / totalComments) * 100) : 0 
      },
      negative: { 
        count: negativeComments.length, 
        percentage: totalComments > 0 ? Math.round((negativeComments.length / totalComments) * 100) : 0 
      },
      neutral: { 
        count: neutralComments.length, 
        percentage: totalComments > 0 ? Math.round((neutralComments.length / totalComments) * 100) : 0 
      },
    };
    
    // Calculate overall sentiment score (0-100 scale)
    const avgScore = totalComments > 0
      ? commentSentiments.reduce((sum, c) => sum + c.sentiment.score, 0) / totalComments
      : 0;
    const normalizedSentimentScore = Math.round(Math.max(0, Math.min(100, 50 + avgScore * 5)));
    
    // ============================================
    // 2. ENGAGEMENT TYPE BREAKDOWN
    // ============================================
    
    const engagementBreakdown: Record<string, { count: number; percentage: number; examples: string[] }> = {};
    
    commentSentiments.forEach((comment) => {
      comment.engagementTypes.forEach((type) => {
        if (!engagementBreakdown[type]) {
          engagementBreakdown[type] = { count: 0, percentage: 0, examples: [] };
        }
        engagementBreakdown[type].count++;
        if (engagementBreakdown[type].examples.length < 3) {
          engagementBreakdown[type].examples.push(comment.text.slice(0, 100));
        }
      });
    });
    
    // Calculate percentages
    Object.keys(engagementBreakdown).forEach((type) => {
      engagementBreakdown[type].percentage = totalComments > 0
        ? Math.round((engagementBreakdown[type].count / totalComments) * 100)
        : 0;
    });
    
    // ============================================
    // 3. TOP SENTIMENT WORDS
    // ============================================
    
    const wordFrequency: Record<string, { count: number; sentiment: "positive" | "negative" }> = {};
    
    commentSentiments.forEach((comment) => {
      comment.sentiment.positiveWords.forEach((word) => {
        if (!wordFrequency[word]) {
          wordFrequency[word] = { count: 0, sentiment: "positive" };
        }
        wordFrequency[word].count++;
      });
      comment.sentiment.negativeWords.forEach((word) => {
        if (!wordFrequency[word]) {
          wordFrequency[word] = { count: 0, sentiment: "negative" };
        }
        wordFrequency[word].count++;
      });
    });
    
    const topSentimentWords = Object.entries(wordFrequency)
      .map(([word, data]) => ({ word, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
    
    // ============================================
    // 4. SENTIMENT BY PLATFORM
    // ============================================
    
    const platformSentiment: Record<string, { positive: number; negative: number; neutral: number; total: number }> = {};
    
    commentSentiments.forEach((comment) => {
      const post = filteredPosts.find((p) => p._id === comment.postId);
      if (post) {
        const platform = post.platform;
        if (!platformSentiment[platform]) {
          platformSentiment[platform] = { positive: 0, negative: 0, neutral: 0, total: 0 };
        }
        platformSentiment[platform][comment.sentiment.label]++;
        platformSentiment[platform].total++;
      }
    });
    
    const platformBreakdown = Object.entries(platformSentiment).map(([platform, data]) => ({
      platform,
      positive: data.total > 0 ? Math.round((data.positive / data.total) * 100) : 0,
      negative: data.total > 0 ? Math.round((data.negative / data.total) * 100) : 0,
      neutral: data.total > 0 ? Math.round((data.neutral / data.total) * 100) : 0,
      total: data.total,
    }));
    
    // ============================================
    // 5. MOST ENGAGED COMMENTERS
    // ============================================
    
    const commenterStats: Record<string, { 
      username: string; 
      comments: number; 
      avgSentiment: number; 
      totalLikes: number;
      sentimentLabel: "positive" | "negative" | "neutral";
    }> = {};
    
    commentSentiments.forEach((comment) => {
      const username = comment.username || "Anonymous";
      if (!commenterStats[username]) {
        commenterStats[username] = { 
          username, 
          comments: 0, 
          avgSentiment: 0, 
          totalLikes: 0,
          sentimentLabel: "neutral",
        };
      }
      commenterStats[username].comments++;
      commenterStats[username].avgSentiment += comment.sentiment.score;
      commenterStats[username].totalLikes += comment.likesCount || 0;
    });
    
    // Calculate averages and labels
    Object.keys(commenterStats).forEach((username) => {
      const stats = commenterStats[username];
      stats.avgSentiment = stats.comments > 0 ? stats.avgSentiment / stats.comments : 0;
      stats.sentimentLabel = stats.avgSentiment > 1 ? "positive" : stats.avgSentiment < -1 ? "negative" : "neutral";
    });
    
    const topCommenters = Object.values(commenterStats)
      .sort((a, b) => b.comments - a.comments)
      .slice(0, 10);
    
    // ============================================
    // 6. COMMENTS REQUIRING ATTENTION
    // ============================================
    
    // Questions that might need responses
    const unansweredQuestions = commentSentiments
      .filter((c) => c.engagementTypes.includes("question"))
      .slice(0, 10)
      .map((c) => ({
        text: c.text.slice(0, 200),
        username: c.username,
        postedAt: c.postedAt,
        likes: c.likesCount || 0,
      }));
    
    // Purchase intent comments
    const purchaseIntent = commentSentiments
      .filter((c) => c.engagementTypes.includes("purchase"))
      .slice(0, 10)
      .map((c) => ({
        text: c.text.slice(0, 200),
        username: c.username,
        postedAt: c.postedAt,
        sentiment: c.sentiment.label,
      }));
    
    // Negative comments that need attention
    const negativeAttention = commentSentiments
      .filter((c) => c.sentiment.label === "negative" && c.sentiment.score < -2)
      .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
      .slice(0, 10)
      .map((c) => ({
        text: c.text.slice(0, 200),
        username: c.username,
        postedAt: c.postedAt,
        likes: c.likesCount || 0,
        negativeWords: c.sentiment.negativeWords,
      }));
    
    // ============================================
    // 7. SENTIMENT BY POST
    // ============================================
    
    const postSentiments = await Promise.all(
      filteredPosts.slice(0, 20).map(async (post) => {
        const postComments = commentSentiments.filter((c) => c.postId === post._id);
        const avgSentiment = postComments.length > 0
          ? postComments.reduce((sum, c) => sum + c.sentiment.score, 0) / postComments.length
          : 0;
        
        const snapshot = await ctx.db
          .query("postSnapshots")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .order("desc")
          .first();
        
        const account = accountMap.get(post.accountId);
        
        return {
          postId: post._id,
          postUrl: post.postUrl,
          caption: post.caption?.slice(0, 100),
          thumbnailUrl: post.thumbnailUrl,
          platform: post.platform,
          postedAt: post.postedAt,
          accountUsername: account?.username,
          commentCount: postComments.length,
          avgSentimentScore: avgSentiment,
          sentimentLabel: avgSentiment > 1 ? "positive" : avgSentiment < -1 ? "negative" : "neutral",
          likes: snapshot?.likesCount || 0,
        };
      })
    );
    
    // Sort by comment count
    const sortedPostSentiments = postSentiments.sort((a, b) => b.commentCount - a.commentCount);
    
    return {
      summary: {
        totalComments: totalComments,
        overallSentimentScore: normalizedSentimentScore,
        sentimentLabel: normalizedSentimentScore >= 60 ? "Positive" : normalizedSentimentScore <= 40 ? "Negative" : "Neutral",
        positivePercentage: sentimentDistribution.positive.percentage,
        negativePercentage: sentimentDistribution.negative.percentage,
        totalPostsAnalyzed: filteredPosts.length,
      },
      sentimentDistribution,
      engagementBreakdown: Object.entries(engagementBreakdown)
        .map(([type, data]) => ({ type, ...data }))
        .sort((a, b) => b.count - a.count),
      topSentimentWords,
      platformBreakdown,
      topCommenters,
      attentionRequired: {
        questions: unansweredQuestions,
        purchaseIntent,
        negativeComments: negativeAttention,
      },
      postSentiments: sortedPostSentiments,
      periodDays: daysAgo,
    };
  },
});

// Get sentiment trends over time
export const getSentimentTrends = query({
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
    
    // Get comments
    const allComments = await ctx.db.query("comments").collect();
    const relevantComments = allComments.filter((c) => postIds.has(c.postId));
    
    // Group by day
    const dailyData: Record<string, { 
      positive: number; 
      negative: number; 
      neutral: number; 
      total: number;
      avgScore: number;
    }> = {};
    
    // Initialize days
    for (let i = 0; i < daysAgo; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      dailyData[dateStr] = { positive: 0, negative: 0, neutral: 0, total: 0, avgScore: 0 };
    }
    
    // Analyze comments by day
    relevantComments.forEach((comment) => {
      const dateStr = new Date(comment.postedAt).toISOString().split("T")[0];
      if (dailyData[dateStr]) {
        const sentiment = analyzeSentiment(comment.text);
        dailyData[dateStr][sentiment.label]++;
        dailyData[dateStr].total++;
        dailyData[dateStr].avgScore += sentiment.score;
      }
    });
    
    // Calculate daily averages
    Object.keys(dailyData).forEach((date) => {
      if (dailyData[date].total > 0) {
        dailyData[date].avgScore = dailyData[date].avgScore / dailyData[date].total;
      }
    });
    
    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        ...data,
        positivePercent: data.total > 0 ? Math.round((data.positive / data.total) * 100) : 0,
        negativePercent: data.total > 0 ? Math.round((data.negative / data.total) * 100) : 0,
        sentimentScore: Math.round(Math.max(0, Math.min(100, 50 + data.avgScore * 5))),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

// Get common topics/themes in comments
export const getCommentTopics = query({
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
    
    // Get comments
    const allComments = await ctx.db.query("comments").collect();
    const relevantComments = allComments.filter((c) => postIds.has(c.postId));
    
    // Common topic keywords
    const topics = [
      { name: "Price/Value", keywords: ["price", "cost", "expensive", "cheap", "worth", "value", "affordable", "deal"] },
      { name: "Quality", keywords: ["quality", "material", "build", "durable", "sturdy", "premium", "cheap"] },
      { name: "Location", keywords: ["location", "area", "neighborhood", "view", "beach", "ocean", "city", "downtown"] },
      { name: "Service", keywords: ["service", "support", "help", "response", "team", "staff", "agent"] },
      { name: "Design", keywords: ["design", "style", "look", "aesthetic", "modern", "classic", "beautiful"] },
      { name: "Availability", keywords: ["available", "stock", "when", "wait", "ship", "delivery", "sold out"] },
      { name: "Comparison", keywords: ["better", "worse", "versus", "vs", "compared", "difference", "similar"] },
      { name: "Experience", keywords: ["experience", "visit", "tour", "stay", "enjoyed", "loved", "hated"] },
    ];
    
    const topicAnalysis = topics.map((topic) => {
      let count = 0;
      let positiveCount = 0;
      let negativeCount = 0;
      
      relevantComments.forEach((comment) => {
        const lowerText = comment.text.toLowerCase();
        if (topic.keywords.some((kw) => lowerText.includes(kw))) {
          count++;
          const sentiment = analyzeSentiment(comment.text);
          if (sentiment.label === "positive") positiveCount++;
          if (sentiment.label === "negative") negativeCount++;
        }
      });
      
      return {
        topic: topic.name,
        mentions: count,
        positivePercent: count > 0 ? Math.round((positiveCount / count) * 100) : 0,
        negativePercent: count > 0 ? Math.round((negativeCount / count) * 100) : 0,
        sentiment: positiveCount > negativeCount ? "positive" : negativeCount > positiveCount ? "negative" : "neutral",
      };
    });
    
    return topicAnalysis.sort((a, b) => b.mentions - a.mentions);
  },
});
