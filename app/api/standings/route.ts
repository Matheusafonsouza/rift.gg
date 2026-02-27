import { NextRequest, NextResponse } from "next/server";
import { getStandings } from "@/lib/lolesports";
import { transformStandingsSection } from "@/lib/lolesports/transforms";

/**
 * GET /api/standings?tournamentId=id1,id2
 * Returns flattened standings rows for one or more tournament IDs.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get("tournamentId");

  if (!ids) {
    return NextResponse.json(
      { error: "tournamentId query parameter is required" },
      { status: 400 }
    );
  }

  const tournamentIds = ids.split(",").map((s) => s.trim()).filter(Boolean);

  try {
    const raw = await getStandings(tournamentIds);

    const standings = raw.data.standings.map((standing) => {
      // Get the regular season stage (usually the first one)
      const regularStage = standing.stages.find(
        (s) => s.type === "groups" || s.slug.includes("regular") || s.slug.includes("split")
      ) ?? standing.stages[0];

      if (!regularStage) return { stage: "Unknown", rows: [] };

      // Flatten all sections into one ranked list
      const rows = regularStage.sections.flatMap((section) =>
        transformStandingsSection(section)
      );

      return {
        stage: regularStage.name,
        rows,
      };
    });

    return NextResponse.json({ standings });
  } catch (err) {
    console.error("[/api/standings]", err);
    return NextResponse.json(
      { error: "Failed to fetch standings" },
      { status: 502 }
    );
  }
}
