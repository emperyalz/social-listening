import { v } from "convex/values";
import { query } from "./_generated/server";

// ============================================
// BRAND VOICE ALIGNMENT QUERIES
// Tone, Style & Voice Analysis
// ============================================

// Voice characteristics and their indicators
const VOICE_CHARACTERISTICS = {
  tone: [
    { trait: "Professional", keywords: ["expertise", "industry", "solution", "strategic", "professional", "business", "corporate", "enterprise"], emoji: "💼" },
    { trait: "Friendly", keywords: ["hey", "love", "awesome", "amazing", "excited", "happy", "fun", "enjoy", "great"], emoji: "😊" },
    { trait: "Luxurious", keywords: ["exclusive", "premium", "luxury", "elegant", "sophisticated", "refined", "exquisite", "bespoke"], emoji: "✨" },
    { trait: "Playful", keywords: ["fun", "play", "laugh", "joke", "silly", "crazy", "wild", "adventure"], emoji: "🎉" },
    { trait: "Authoritative", keywords: ["must", "need", "essential", "critical", "important", "proven", "guaranteed", "certified"], emoji: "🎯" },
    { trait: "Empathetic", keywords: ["understand", "feel", "care", "support", "help", "listen", "together", "journey"], emoji: "💙" },
  ],
  formality: [
    { level: "Very Formal", indicators: ["furthermore", "therefore", "hereby", "pursuant", "accordingly", "henceforth"], score: 5 },
    { level: "Formal", indicators: ["please", "kindly", "would", "could", "appreciate", "regards", "sincerely"], score: 4 },
    { level: "Neutral", indicators: ["thanks", "help", "want", "need", "like", "think", "hope"], score: 3 },
    { level: "Casual", indicators: ["hey", "yeah", "gonna", "wanna", "cool", "awesome", "stuff"], score: 2 },
    { level: "Very Casual", indicators: ["lol", "omg", "btw", "tbh", "ngl", "bruh", "fr", "lowkey"], score: 1 },
  ],
  personality: [
    { trait: "Inspirational", keywords: ["dream", "inspire", "achieve", "believe", "transform", "empower", "motivation", "success"], emoji: "🌟" },
    { trait: "Educational", keywords: ["learn", "discover", "understand", "guide", "tips", "how-to", "tutorial", "lesson"], emoji: "📚" },
    { trait: "Entertaining", keywords: ["watch", "enjoy", "fun", "amazing", "wow", "incredible", "check out", "you won't believe"], emoji: "🎬" },
    { trait: "Promotional", keywords: ["sale", "discount", "offer", "deal", "limited", "exclusive", "save", "buy now"], emoji: "🏷️" },
    { trait: "Community", keywords: ["together", "community", "join", "share", "connect", "family", "tribe", "squad"], emoji: "🤝" },
  ],
};

// Emoji usage patterns
const EMOJI_CATEGORIES = {
  luxury: ["✨", "💎", "🌟", "👑", "🥂", "🏆"],
  friendly: ["😊", "❤️", "🙌", "👋", "🤗", "💕"],
  professional: ["📊", "💼", "📈", "✅", "🎯", "💡"],
  playful: ["😂", "🤣", "🎉", "🔥", "💯", "🙈"],
  nature: ["🌴", "🌊", "☀️", "🌺", "🏖️", "🌅"],
};

// Analyze text for voice characteristics
function analyzeVoice(text: string): {
  toneScores: { trait: string; score: number; emoji: string }[];
  formalityScore: number;
  formalityLevel: string;
  personalityScores: { trait: string; score: number; emoji: string }[];
  emojiUsage: { category: string; count: number; emojis: string[] }[];
  avgSentenceLength: number;
  questionUsage: number;
  exclamationUsage: number;
  hashtagDensity: number;
} {
  const lowerText = text.toLowerCase();
  
  // Tone analysis
  const toneScores = VOICE_CHARACTERISTICS.tone.map(({ trait, keywords, emoji }) => {
    let score = 0;
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = lowerText.match(regex);
      if (matches) score += matches.length;
    });
    return { trait, score, emoji };
  });
  
  // Formality analysis
  let formalityTotal = 0;
  let formalityCount = 0;
  VOICE_CHARACTERISTICS.formality.forEach(({ indicators, score }) => {
    indicators.forEach((indicator) => {
      const regex = new RegExp(`\\b${indicator}\\b`, "gi");
      const matches = lowerText.match(regex);
      if (matches) {
        formalityTotal += score * matches.length;
        formalityCount += matches.length;
      }
    });
  });
  const formalityScore = formalityCount > 0 ? Math.round((formalityTotal / formalityCount) * 20) : 50;
  const formalityLevel = formalityScore >= 80 ? "Very Formal" :
    formalityScore >= 60 ? "Formal" :
    formalityScore >= 40 ? "Neutral" :
    formalityScore >= 20 ? "Casual" : "Very Casual";
  
  // Personality analysis
  const personalityScores = VOICE_CHARACTERISTICS.personality.map(({ trait, keywords, emoji }) => {
    let score = 0;
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = lowerText.match(regex);
      if (matches) score += matches.length;
    });
    return { trait, score, emoji };
  });
  
  // Emoji usage
  const emojiUsage = Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => {
    let count = 0;
    const foundEmojis: string[] = [];
    emojis.forEach((emoji) => {
      const emojiCount = (text.match(new RegExp(emoji, "g")) || []).length;
      if (emojiCount > 0) {
        count += emojiCount;
        foundEmojis.push(emoji);
      }
    });
    return { category, count, emojis: foundEmojis };
  });
  
  // Sentence structure
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0
    ? Math.round(sentences.reduce((sum, s) => sum + s.split(" ").length, 0) / sentences.length)
    : 0;
  
  const questionUsage = (text.match(/\?/g) || []).length;
  const exclamationUsage = (text.match(/!/g) || []).length;
  
  // Hashtag density
  const hashtags = text.match(/#\w+/g) || [];
  const wordCount = text.split(/\s+/).length;
  const hashtagDensity = wordCount > 0 ? Math.round((hashtags.length / wordCount) * 100) : 0;
  
  return {
    toneScores,
    formalityScore,
    formalityLevel,
    personalityScores,
    emojiUsage,
    avgSentenceLength,
    questionUsage,
    exclamationUsage,
    hashtagDensity,
  };
}

// Main brand voice analysis query
export const getBrandVoiceAnalysis = query({
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
    
    // Get all comments
    const allComments = await ctx.db.query("comments").collect();
    const postIds = new Set(filteredPosts.map((p) => p._id));
    const relevantComments = allComments.filter((c) => postIds.has(c.postId));
    
    // Combine content
    const captionContent = filteredPosts.map((p) => p.caption || "").join(" ");
    const commentContent = relevantComments.map((c) => c.text).join(" ");
    
    // Analyze brand voice (from captions - what we say)
    const brandVoice = analyzeVoice(captionContent);
    
    // Analyze audience voice (from comments - how they respond)
    const audienceVoice = analyzeVoice(commentContent);
    
    // ============================================
    // VOICE CONSISTENCY SCORE
    // ============================================
    
    // Target brand voice profile (configurable)
    const targetVoice = {
      primaryTone: "Luxurious",
      secondaryTone: "Professional",
      formalityTarget: 70, // 0-100 scale
      personalityFocus: ["Inspirational", "Educational"],
    };
    
    // Calculate consistency scores
    const primaryToneScore = brandVoice.toneScores.find((t) => t.trait === targetVoice.primaryTone)?.score || 0;
    const totalToneScore = brandVoice.toneScores.reduce((sum, t) => sum + t.score, 0);
    const toneConsistency = totalToneScore > 0
      ? Math.round((primaryToneScore / totalToneScore) * 100)
      : 0;
    
    const formalityDeviation = Math.abs(brandVoice.formalityScore - targetVoice.formalityTarget);
    const formalityConsistency = Math.max(0, 100 - formalityDeviation);
    
    const overallConsistency = Math.round((toneConsistency + formalityConsistency) / 2);
    
    // ============================================
    // VOICE-AUDIENCE ALIGNMENT
    // ============================================
    
    // Compare brand tone with audience response tone
    const voiceAlignmentData = brandVoice.toneScores.map((brandTone) => {
      const audienceTone = audienceVoice.toneScores.find((t) => t.trait === brandTone.trait);
      return {
        trait: brandTone.trait,
        emoji: brandTone.emoji,
        brandScore: brandTone.score,
        audienceScore: audienceTone?.score || 0,
        alignment: brandTone.score > 0 && (audienceTone?.score || 0) > 0 ? "aligned" : 
          brandTone.score > 0 ? "brand-only" : 
          (audienceTone?.score || 0) > 0 ? "audience-only" : "none",
      };
    });
    
    // ============================================
    // VOICE BREAKDOWN BY PLATFORM
    // ============================================
    
    const platformVoice: Record<string, ReturnType<typeof analyzeVoice>> = {};
    
    ["instagram", "tiktok", "youtube"].forEach((platform) => {
      const platformPosts = filteredPosts.filter((p) => p.platform === platform);
      const platformContent = platformPosts.map((p) => p.caption || "").join(" ");
      if (platformContent.length > 0) {
        platformVoice[platform] = analyzeVoice(platformContent);
      }
    });
    
    // ============================================
    // TOP VOICE-CONSISTENT POSTS
    // ============================================
    
    const postVoiceScores = await Promise.all(
      filteredPosts.slice(0, 50).map(async (post) => {
        const voice = analyzeVoice(post.caption || "");
        const targetToneScore = voice.toneScores.find((t) => t.trait === targetVoice.primaryTone)?.score || 0;
        
        // Get engagement
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
          voiceScore: targetToneScore,
          dominantTone: voice.toneScores.sort((a, b) => b.score - a.score)[0]?.trait || "Neutral",
          formalityLevel: voice.formalityLevel,
          likes: snapshot?.likesCount || 0,
          comments: snapshot?.commentsCount || 0,
        };
      })
    );
    
    // ============================================
    // VOICE RECOMMENDATIONS
    // ============================================
    
    const recommendations: { type: string; message: string; priority: "high" | "medium" | "low" }[] = [];
    
    // Check tone consistency
    if (toneConsistency < 50) {
      recommendations.push({
        type: "Tone Drift",
        message: `Your ${targetVoice.primaryTone} tone only appears in ${toneConsistency}% of content. Consider strengthening this voice characteristic.`,
        priority: "high",
      });
    }
    
    // Check formality alignment
    if (formalityDeviation > 30) {
      const direction = brandVoice.formalityScore > targetVoice.formalityTarget ? "too formal" : "too casual";
      recommendations.push({
        type: "Formality Mismatch",
        message: `Your content is ${direction} compared to your target brand voice. Adjust language style to match guidelines.`,
        priority: "medium",
      });
    }
    
    // Check platform consistency
    const platformScores = Object.entries(platformVoice).map(([platform, voice]) => ({
      platform,
      primaryToneScore: voice.toneScores.find((t) => t.trait === targetVoice.primaryTone)?.score || 0,
    }));
    
    const platformVariance = platformScores.length > 1
      ? Math.max(...platformScores.map((p) => p.primaryToneScore)) - Math.min(...platformScores.map((p) => p.primaryToneScore))
      : 0;
    
    if (platformVariance > 10) {
      recommendations.push({
        type: "Platform Inconsistency",
        message: "Your brand voice varies significantly across platforms. Consider maintaining consistent tone across all channels.",
        priority: "medium",
      });
    }
    
    // Check emoji usage
    const luxuryEmojiCount = brandVoice.emojiUsage.find((e) => e.category === "luxury")?.count || 0;
    const totalEmojiCount = brandVoice.emojiUsage.reduce((sum, e) => sum + e.count, 0);
    
    if (targetVoice.primaryTone === "Luxurious" && luxuryEmojiCount < totalEmojiCount * 0.3) {
      recommendations.push({
        type: "Emoji Alignment",
        message: "Consider using more luxury-associated emojis (✨💎🌟) to reinforce your premium brand positioning.",
        priority: "low",
      });
    }
    
    return {
      summary: {
        overallConsistency,
        toneConsistency,
        formalityConsistency,
        dominantTone: brandVoice.toneScores.sort((a, b) => b.score - a.score)[0]?.trait || "Neutral",
        formalityLevel: brandVoice.formalityLevel,
        avgSentenceLength: brandVoice.avgSentenceLength,
        hashtagDensity: brandVoice.hashtagDensity,
        totalPostsAnalyzed: filteredPosts.length,
        totalCommentsAnalyzed: relevantComments.length,
      },
      targetVoice,
      brandVoice: {
        toneScores: brandVoice.toneScores.sort((a, b) => b.score - a.score),
        formalityScore: brandVoice.formalityScore,
        formalityLevel: brandVoice.formalityLevel,
        personalityScores: brandVoice.personalityScores.sort((a, b) => b.score - a.score),
        emojiUsage: brandVoice.emojiUsage.filter((e) => e.count > 0),
        questionUsage: brandVoice.questionUsage,
        exclamationUsage: brandVoice.exclamationUsage,
      },
      audienceVoice: {
        toneScores: audienceVoice.toneScores.sort((a, b) => b.score - a.score),
        formalityLevel: audienceVoice.formalityLevel,
        dominantTone: audienceVoice.toneScores.sort((a, b) => b.score - a.score)[0]?.trait || "Neutral",
      },
      voiceAlignment: voiceAlignmentData,
      platformBreakdown: Object.entries(platformVoice).map(([platform, voice]) => ({
        platform,
        dominantTone: voice.toneScores.sort((a, b) => b.score - a.score)[0]?.trait || "Neutral",
        formalityLevel: voice.formalityLevel,
        avgSentenceLength: voice.avgSentenceLength,
      })),
      topConsistentPosts: postVoiceScores
        .sort((a, b) => b.voiceScore - a.voiceScore)
        .slice(0, 5),
      recommendations,
      periodDays: daysAgo,
    };
  },
});

// Get voice trends over time
export const getVoiceTrends = query({
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
    
    // Group by week
    const weeklyData: Record<string, { posts: string[]; consistencyScores: number[] }> = {};
    
    filteredPosts.forEach((post) => {
      const date = new Date(post.postedAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { posts: [], consistencyScores: [] };
      }
      
      weeklyData[weekKey].posts.push(post.caption || "");
      
      // Calculate consistency score for this post
      const voice = analyzeVoice(post.caption || "");
      const luxuryScore = voice.toneScores.find((t) => t.trait === "Luxurious")?.score || 0;
      const totalScore = voice.toneScores.reduce((sum, t) => sum + t.score, 0);
      const consistency = totalScore > 0 ? Math.round((luxuryScore / totalScore) * 100) : 50;
      weeklyData[weekKey].consistencyScores.push(consistency);
    });
    
    // Calculate weekly averages
    return Object.entries(weeklyData)
      .map(([week, data]) => ({
        week,
        postCount: data.posts.length,
        avgConsistency: data.consistencyScores.length > 0
          ? Math.round(data.consistencyScores.reduce((a, b) => a + b, 0) / data.consistencyScores.length)
          : 0,
      }))
      .sort((a, b) => a.week.localeCompare(b.week));
  },
});

// Get vocabulary analysis
export const getVocabularyAnalysis = query({
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
    
    // Combine all captions
    const allContent = filteredPosts.map((p) => p.caption || "").join(" ");
    
    // Word frequency analysis (excluding common words)
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
      "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does",
      "did", "will", "would", "could", "should", "may", "might", "must", "shall", "can",
      "this", "that", "these", "those", "i", "you", "he", "she", "it", "we", "they", "my",
      "your", "his", "her", "its", "our", "their", "what", "which", "who", "whom", "when",
      "where", "why", "how", "all", "each", "every", "both", "few", "more", "most", "other",
      "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very",
      "just", "as", "if", "because", "until", "while", "about", "after", "before", "from",
      "up", "down", "out", "off", "over", "under", "again", "then", "once", "here", "there",
    ]);
    
    const words = allContent.toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.has(word));
    
    const wordFrequency: Record<string, number> = {};
    words.forEach((word) => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    const topWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([word, count]) => ({ word, count }));
    
    // Hashtag analysis
    const hashtags = allContent.match(/#\w+/g) || [];
    const hashtagFrequency: Record<string, number> = {};
    hashtags.forEach((tag) => {
      const lowerTag = tag.toLowerCase();
      hashtagFrequency[lowerTag] = (hashtagFrequency[lowerTag] || 0) + 1;
    });
    
    const topHashtags = Object.entries(hashtagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([hashtag, count]) => ({ hashtag, count }));
    
    // Brand-aligned vocabulary check
    const brandVocabulary = [
      "luxury", "premium", "exclusive", "elegant", "sophisticated",
      "bespoke", "refined", "exquisite", "exceptional", "prestigious",
    ];
    
    const brandVocabUsage = brandVocabulary.map((word) => ({
      word,
      count: wordFrequency[word] || 0,
      inUse: (wordFrequency[word] || 0) > 0,
    }));
    
    return {
      topWords,
      topHashtags,
      brandVocabularyUsage: brandVocabUsage,
      totalUniqueWords: Object.keys(wordFrequency).length,
      totalWords: words.length,
      avgWordsPerPost: filteredPosts.length > 0
        ? Math.round(words.length / filteredPosts.length)
        : 0,
    };
  },
});
