import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Webhook endpoint for Apify to call when runs complete
http.route({
  path: "/webhook/apify",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    // Apify webhook payload contains run info
    const { eventType, eventData } = body;

    if (eventType === "ACTOR.RUN.SUCCEEDED") {
      // Process the completed run
      // You can store the results or trigger further processing
      console.log("Apify run succeeded:", eventData.actorRunId);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Cron endpoint - called by Vercel cron to trigger daily scraping
http.route({
  path: "/cron/daily-scrape",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Trigger scraping for all platforms
    const platforms = ["instagram", "tiktok", "youtube"] as const;
    const results: Array<{ platform: string; jobs?: unknown; error?: string }> = [];

    for (const platform of platforms) {
      try {
        const result = await ctx.runAction(api.scraping.scrapeAllAccounts, {
          platform,
        });
        results.push({ platform, jobs: result });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.push({ platform, error: errorMessage });
      }
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify({ status: "ok", timestamp: Date.now() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
