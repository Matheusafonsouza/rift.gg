/**
 * Transforms raw LoL Esports API data into clean, app-level types.
 * Also contains helpers for region flags, colors, etc.
 */

import type {
  LoLApiLeague,
  LoLApiScheduleEvent,
  LoLApiStandingSection,
  LoLApiTeam,
} from "./api-types";

// ─── Region / League helpers ──────────────────────────────────────────────────

export type LeagueSlug =
  | "lck" | "lpl" | "lec" | "lcs" | "cblol" | "ljl" | "lco"
  | "lco_s1" | "msi" | "worlds" | string;

export const LEAGUE_COLORS: Record<string, string> = {
  lck:    "#0BC4E3",
  lpl:    "#E84057",
  lec:    "#1e90ff",
  lcs:    "#9b59b6",
  cblol:  "#1FBF6E",
  ljl:    "#f97316",
  lco:    "#f59e0b",
  msi:    "#C89B3C",
  worlds: "#C89B3C",
};

export const REGION_FLAGS: Record<string, string> = {
  KOREA:        "🇰🇷",
  CHINA:        "🇨🇳",
  EUROPE:       "🇪🇺",
  "NORTH AMERICA": "🇺🇸",
  BRAZIL:       "🇧🇷",
  JAPAN:        "🇯🇵",
  OCEANIA:      "🇦🇺",
  INTERNATIONAL:"🌍",
  LAS:          "🌎",
  LAN:          "🌎",
  TURKEY:       "🇹🇷",
  CIS:          "🌐",
  VIETNAM:      "🇻🇳",
  SEA:          "🌏",
};

export function leagueColor(slug: string): string {
  return LEAGUE_COLORS[slug.toLowerCase()] ?? "#C89B3C";
}

export function regionFlag(region: string): string {
  return REGION_FLAGS[region?.toUpperCase()] ?? "🌍";
}

/**
 * Returns a stable accent color for a team based on its short code.
 * Used when the API doesn't provide a team brand color.
 */
export function teamColor(code: string): string {
  const palette = [
    "#E84057", "#0BC4E3", "#1FBF6E", "#9b59b6",
    "#f97316", "#C89B3C", "#1e90ff", "#f59e0b",
  ];
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

// ─── App-level types ──────────────────────────────────────────────────────────

export interface AppLeague {
  id: string;
  name: string;
  slug: string;
  image: string;
  region: string;
  flag: string;
  color: string;
  priority: number;
}

export interface AppTeam {
  code: string;
  name: string;
  image: string;
  wins?: number;
  losses?: number;
  gameWins?: number;
  outcome?: string | null;
}

export interface AppMatch {
  id: string;                 // schedule event id (used by /matches/[id])
  startTime: string;          // ISO string
  relativeTime: string;       // e.g. "1d 4h", "Live", "Just ended"
  blockName: string;
  leagueName: string;
  leagueId?: string;
  leagueSlug: string;
  leagueImage?: string;
  leagueColor: string;
  team1: AppTeam;
  team2: AppTeam;
  bestOf: number;
  state: "unstarted" | "inProgress" | "completed";
  isLive: boolean;
}

export interface AppStandingRow {
  rank: number;
  teamCode: string;
  teamName: string;
  teamImage: string;
  wins: number;
  losses: number;
}

// ─── Transformers ─────────────────────────────────────────────────────────────

export function transformLeague(raw: LoLApiLeague): AppLeague {
  return {
    id:       raw.id,
    name:     raw.name,
    slug:     raw.slug,
    image:    raw.image,
    region:   raw.region,
    flag:     regionFlag(raw.region),
    color:    leagueColor(raw.slug),
    priority: raw.priority,
  };
}

export function transformScheduleEvent(raw: LoLApiScheduleEvent): AppMatch {
  const [t1, t2] = raw.match.teams;
  const now = Date.now();
  const start = new Date(raw.startTime).getTime();

  return {
    id:          raw.id ?? raw.match.id,
    startTime:   raw.startTime,
    relativeTime: formatRelativeTime(start, now, raw.state),
    blockName:   raw.blockName,
    leagueName:  raw.league.name,
    leagueId:    raw.league.id,
    leagueSlug:  raw.league.slug,
    leagueImage: raw.league.image,
    leagueColor: leagueColor(raw.league.slug),
    bestOf:      raw.match.strategy.count,
    state:       raw.state,
    isLive:      raw.state === "inProgress",
    team1: {
      code:      t1.code,
      name:      t1.name,
      image:     t1.image,
      wins:      t1.record?.wins,
      losses:    t1.record?.losses,
      gameWins:  t1.result?.gameWins,
      outcome:   t1.result?.outcome,
    },
    team2: {
      code:      t2.code,
      name:      t2.name,
      image:     t2.image,
      wins:      t2.record?.wins,
      losses:    t2.record?.losses,
      gameWins:  t2.result?.gameWins,
      outcome:   t2.result?.outcome,
    },
  };
}

export function transformStandingsSection(
  section: LoLApiStandingSection
): AppStandingRow[] {
  return section.rankings.flatMap((ranking) =>
    ranking.teams.map((team) => ({
      rank:      ranking.ordinal,
      teamCode:  team.code,
      teamName:  team.name,
      teamImage: team.image,
      wins:      team.record.wins,
      losses:    team.record.losses,
    }))
  );
}

// ─── Time helpers ─────────────────────────────────────────────────────────────

/**
 * Formats a match time relative to now.
 * Returns "Live", "Just ended", "2h 30m", "1d 4h", etc.
 */
export function formatRelativeTime(
  startMs: number,
  nowMs: number,
  state: string
): string {
  if (state === "inProgress") return "Live";

  const diffMs = startMs - nowMs;
  const absDiff = Math.abs(diffMs);

  if (state === "completed") {
    if (absDiff < 3_600_000) return "Just ended";
    const h = Math.floor(absDiff / 3_600_000);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    return `${h}h ago`;
  }

  // Upcoming
  const totalMinutes = Math.floor(absDiff / 60_000);
  const totalHours   = Math.floor(totalMinutes / 60);
  const totalDays    = Math.floor(totalHours / 24);

  if (totalMinutes < 60) return `${totalMinutes}m`;
  if (totalHours < 24)   return `${totalHours}h ${totalMinutes % 60}m`;

  const remainingHours = totalHours % 24;
  if (remainingHours === 0) return `${totalDays}d`;
  return `${totalDays}d ${remainingHours}h`;
}

/**
 * Groups matches by date string "FEBRUARY 26", "FEBRUARY 27", etc.
 */
export function groupMatchesByDate(
  matches: AppMatch[]
): Array<{ date: string; matches: AppMatch[] }> {
  const groups = new Map<string, AppMatch[]>();

  for (const match of matches) {
    const d = new Date(match.startTime);
    const key = d
      .toLocaleDateString("en-US", { month: "long", day: "numeric" })
      .toUpperCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(match);
  }

  return Array.from(groups.entries()).map(([date, matches]) => ({
    date,
    matches,
  }));
}
