export interface NewsItem {
  id: string;
  flag: string;
  title: string;
  comments: number;
  isBreaking?: boolean;
  league?: string;
}

export interface NewsGroup {
  date: string;
  items: NewsItem[];
}

export interface Match {
  id: string;
  team1: string;
  flag1: string;
  team2: string;
  flag2: string;
  league: LeagueKey;
  time?: string;
  score1?: number;
  score2?: number;
  isLive?: boolean;
  bestOf?: number;
}

export interface EsportsEvent {
  id: string;
  name: string;
  region: string;
  league: LeagueKey;
  dateRange?: string;
  isLive?: boolean;
  phase?: string;
}

export interface ThreadItem {
  text: string;
  count: number;
  isHot?: boolean;
}

export type LeagueKey = "LCK" | "LPL" | "LEC" | "LCS" | "CBLOL" | "LJL" | "LCO" | "INT";

export const LEAGUE_COLORS: Record<LeagueKey, string> = {
  LCK:   "#0BC4E3",
  LPL:   "#E84057",
  LEC:   "#1e90ff",
  LCS:   "#9b59b6",
  CBLOL: "#1FBF6E",
  LJL:   "#f97316",
  LCO:   "#f59e0b",
  INT:   "#C89B3C",
};
