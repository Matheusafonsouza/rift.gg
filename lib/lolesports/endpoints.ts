/**
 * Typed endpoint wrappers for the LoL Esports API.
 * Server-side only — never import in client components.
 */

import {
  lolesportsFetch,
  REVALIDATE_LEAGUES,
  REVALIDATE_SCHEDULE,
  REVALIDATE_STANDINGS,
} from "./client";
import type {
  LoLApiGetLeaguesResponse,
  LoLApiGetScheduleResponse,
  LoLApiGetLiveResponse,
  LoLApiGetTournamentsResponse,
  LoLApiGetStandingsResponse,
  LoLApiGetTeamsResponse,
} from "./api-types";

// ─── Leagues ──────────────────────────────────────────────────────────────────

/**
 * Fetch all leagues (LCK, LPL, LEC, LCS, etc.)
 */
export async function getLeagues(): Promise<LoLApiGetLeaguesResponse> {
  return lolesportsFetch<LoLApiGetLeaguesResponse>(
    "getLeagues",
    {},
    { revalidate: REVALIDATE_LEAGUES, tags: ["leagues"] }
  );
}

/**
 * Fetch tournaments for a specific league.
 * Returns them ordered by startDate desc (most recent first).
 */
export async function getTournamentsForLeague(
  leagueId: string
): Promise<LoLApiGetTournamentsResponse> {
  return lolesportsFetch<LoLApiGetTournamentsResponse>(
    "getTournamentsForLeague",
    { leagueId },
    { revalidate: REVALIDATE_LEAGUES, tags: ["tournaments", `league-${leagueId}`] }
  );
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

/**
 * Fetch the upcoming/completed schedule for one or more leagues.
 * @param leagueIds - Array of league IDs to fetch. Leave empty for all.
 * @param pageToken - Base64 pagination token from a previous response.
 */
export async function getSchedule(
  leagueIds: string[] = [],
  pageToken?: string
): Promise<LoLApiGetScheduleResponse> {
  const params: Record<string, string | string[]> = {};
  if (leagueIds.length > 0) params.leagueId = leagueIds;
  if (pageToken) params.pageToken = pageToken;

  return lolesportsFetch<LoLApiGetScheduleResponse>(
    "getSchedule",
    params,
    { revalidate: REVALIDATE_SCHEDULE, tags: ["schedule"] }
  );
}

// ─── Live ─────────────────────────────────────────────────────────────────────

/**
 * Fetch currently live matches.
 * Use short revalidation or no-store for near-real-time data.
 */
export async function getLive(): Promise<LoLApiGetLiveResponse> {
  return lolesportsFetch<LoLApiGetLiveResponse>(
    "getLive",
    {},
    { revalidate: 30, tags: ["live"] } // 30s for live data
  );
}

// ─── Standings ────────────────────────────────────────────────────────────────

/**
 * Fetch standings for one or more tournament IDs.
 */
export async function getStandings(
  tournamentIds: string[]
): Promise<LoLApiGetStandingsResponse> {
  return lolesportsFetch<LoLApiGetStandingsResponse>(
    "getStandings",
    { tournamentId: tournamentIds },
    { revalidate: REVALIDATE_STANDINGS, tags: ["standings"] }
  );
}

// ─── Teams ────────────────────────────────────────────────────────────────────

/**
 * Fetch team details. Pass `slug` to get a specific team (e.g. "t1", "fnatic").
 */
export async function getTeams(slug?: string): Promise<LoLApiGetTeamsResponse> {
  const params = slug ? { id: slug } : {};
  return lolesportsFetch<LoLApiGetTeamsResponse>(
    "getTeams",
    params,
    { revalidate: REVALIDATE_LEAGUES, tags: ["teams", ...(slug ? [`team-${slug}`] : [])] }
  );
}
