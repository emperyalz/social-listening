import { NextResponse } from "next/server";

export const runtime = "edge";
export const maxDuration = 300; // 5 minutes

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Call Convex HTTP endpoint
    const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.replace(
      ".convex.cloud",
      ".convex.site"
    );

    const response = await fetch(`${convexSiteUrl}/cron/daily-scrape`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
