import { NextResponse } from "next/server";
import { getLeagues } from "@/lib/lolesports";
import { transformLeague } from "@/lib/lolesports/transforms";

/**
 * GET /api/leagues
 * Returns all leagues sorted by priority, with flags and colors added.
 */
export async function GET() {
  try {
    const raw = await getLeagues();
    const leagues = raw.data.leagues
      .map(transformLeague)
      .sort((a, b) => a.priority - b.priority);

    return NextResponse.json({ leagues });
  } catch (err) {
    console.error("[/api/leagues]", err);
    return NextResponse.json(
      { error: "Failed to fetch leagues" },
      { status: 502 }
    );
  }
}
