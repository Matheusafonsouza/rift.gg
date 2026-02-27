import { NextResponse } from "next/server";
import { getLive } from "@/lib/lolesports";
import { transformScheduleEvent } from "@/lib/lolesports/transforms";

/**
 * GET /api/live
 * Returns currently live matches. Short cache — 30 seconds.
 * Good for polling from the client.
 */
export async function GET() {
  try {
    const raw = await getLive();
    const events = raw.data.schedule.events.map(transformScheduleEvent);

    return NextResponse.json(
      { live: events, count: events.length },
      {
        headers: {
          // Tell clients to revalidate every 30s
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("[/api/live]", err);
    return NextResponse.json(
      { error: "Failed to fetch live data" },
      { status: 502 }
    );
  }
}
