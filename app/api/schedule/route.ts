import { NextRequest, NextResponse } from "next/server";
import { getSchedule, getLive } from "@/lib/lolesports";
import { transformScheduleEvent } from "@/lib/lolesports/transforms";

/**
 * GET /api/schedule
 *
 * Query params:
 *   leagueId  - comma-separated league IDs (optional, omit for all leagues)
 *   pageToken - pagination token (optional)
 *
 * Returns upcoming + completed events split into sections, plus any live matches.
 *
 * Example:
 *   /api/schedule
 *   /api/schedule?leagueId=98767991299243165,98767991302996019
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse comma-separated league IDs
    const leagueIdParam = searchParams.get("leagueId");
    const leagueIds = leagueIdParam
      ? leagueIdParam.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const pageToken = searchParams.get("pageToken") ?? undefined;

    // Fetch schedule and live data in parallel
    const [scheduleRes, liveRes] = await Promise.all([
      getSchedule(leagueIds, pageToken),
      getLive(),
    ]);

    const allEvents = scheduleRes.data.schedule.events
      .filter((event) => event.type === "match" && event.match?.teams?.length === 2)
      .map(transformScheduleEvent);
    const liveEvents = liveRes.data.schedule.events
      .filter((event) => event.type === "match" && event.match?.teams?.length === 2)
      .map(transformScheduleEvent);

    // Split into upcoming / completed / live
    const upcoming  = allEvents.filter((e) => e.state === "unstarted");
    const completed = allEvents.filter((e) => e.state === "completed");

    return NextResponse.json({
      upcoming,
      completed,
      live: liveEvents,
      pages: scheduleRes.data.schedule.pages,
      updatedAt: scheduleRes.data.schedule.updated,
    });
  } catch (err) {
    console.error("[/api/schedule]", err);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 502 }
    );
  }
}
