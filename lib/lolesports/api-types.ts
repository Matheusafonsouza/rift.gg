// ─── Raw API response types from esports-api.lolesports.com ───────────────────
// Based on: https://vickz84259.github.io/lolesports-api-docs/

export interface LoLApiLeague {
  name: string;
  slug: string;
  id: string;
  image: string;
  priority: number;
  region: string;
}

export interface LoLApiGetLeaguesResponse {
  data: {
    leagues: LoLApiLeague[];
  };
}

// ─── Schedule / Events ────────────────────────────────────────────────────────

export type MatchState = "completed" | "inProgress" | "unstarted";
export type MatchOutcome = "win" | "loss" | null;

export interface LoLApiTeamResult {
  gameWins: number;
  outcome: MatchOutcome;
}

export interface LoLApiTeamRecord {
  wins: number;
  losses: number;
}

export interface LoLApiScheduleTeam {
  code: string;
  image: string;
  name: string;
  result?: LoLApiTeamResult;
  record?: LoLApiTeamRecord;
}

export interface LoLApiStrategy {
  count: number; // e.g. 3 for Bo3, 5 for Bo5
  type: "bestOf";
}

export interface LoLApiMatch {
  id: string;
  teams: [LoLApiScheduleTeam, LoLApiScheduleTeam];
  strategy: LoLApiStrategy;
}

export interface LoLApiLeagueRef {
  name: string;
  slug: string;
  id?: string;
  image?: string;
  priority?: number;
}

export interface LoLApiScheduleEvent {
  startTime: string; // ISO 8601
  blockName: string; // e.g. "Week 1", "Playoffs"
  match: LoLApiMatch;
  state: MatchState;
  type: "match" | "show";
  id?: string;
  league: LoLApiLeagueRef;
}

export interface LoLApiSchedulePages {
  older?: string; // base64 page token
  newer?: string;
}

export interface LoLApiGetScheduleResponse {
  data: {
    schedule: {
      updated: string;
      pages: LoLApiSchedulePages;
      events: LoLApiScheduleEvent[];
    };
  };
}

// ─── Live ─────────────────────────────────────────────────────────────────────

export interface LoLApiGetLiveResponse {
  data: {
    schedule: {
      events: LoLApiScheduleEvent[];
    };
  };
}

// ─── Tournaments ──────────────────────────────────────────────────────────────

export interface LoLApiTournament {
  id: string;
  slug: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;
}

export interface LoLApiGetTournamentsResponse {
  data: {
    leagues: Array<{
      tournaments: LoLApiTournament[];
    }>;
  };
}

// ─── Standings ────────────────────────────────────────────────────────────────

export interface LoLApiStandingTeam {
  code: string;
  image: string;
  name: string;
  id: string;
  slug: string;
  record: {
    wins: number;
    losses: number;
  };
}

export interface LoLApiRanking {
  ordinal: number;
  teams: LoLApiStandingTeam[];
}

export interface LoLApiStandingSection {
  name: string;
  rankings: LoLApiRanking[];
}

export interface LoLApiStandingStage {
  name: string;
  type: string;
  slug: string;
  sections: LoLApiStandingSection[];
}

export interface LoLApiGetStandingsResponse {
  data: {
    standings: Array<{
      stages: LoLApiStandingStage[];
    }>;
  };
}

// ─── Event Details ────────────────────────────────────────────────────────────

export interface LoLApiEventTeam {
  id: string;
  slug: string;
  name: string;
  code: string;
  image: string;
  alternativeImage?: string;
  result?: LoLApiTeamResult;
  record?: LoLApiTeamRecord;
  origin?: { region: string };
}

export interface LoLApiGame {
  id: string;
  number: number;
  state: MatchState;
  teams: Array<{
    id: string;
    side: string;
    result?: { gameWins: number };
  }>;
}

export interface LoLApiEventDetails {
  id: string;
  startTime: string;
  blockName: string;
  state: MatchState;
  type: string;
  league: LoLApiLeagueRef & { region?: string };
  tournament: { id: string };
  match: {
    id: string;
    teams: [LoLApiEventTeam, LoLApiEventTeam];
    strategy: LoLApiStrategy;
    games?: LoLApiGame[];
  };
}

export interface LoLApiGetEventDetailsResponse {
  data: {
    event: LoLApiEventDetails;
  };
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export interface LoLApiPlayerHandle {
  id: string;
  handle: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  role?: string;
}

export interface LoLApiTeam {
  id: string;
  slug: string;
  name: string;
  code: string;
  image: string;
  alternativeImage?: string;
  backgroundImage?: string;
  status: string;
  homeLeague?: {
    name: string;
    region: string;
  };
  players?: LoLApiPlayerHandle[];
}

export interface LoLApiGetTeamsResponse {
  data: {
    teams: LoLApiTeam[];
  };
}
