import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import MatchHeader, { MatchHeaderData, GameResult } from "@/components/MatchHeader";
import MatchMapsPanel from "@/components/MatchMapsPanel";
import EventHistoryPanel, { PastMatchItem } from "@/components/EventHistoryPanel";
import { getEventDetails, getSchedule } from "@/lib/lolesports/endpoints";
import { teamColor, regionFlag } from "@/lib/lolesports/transforms";
import type { LoLApiEventDetails, LoLApiScheduleEvent } from "@/lib/lolesports/api-types";

function buildGameResults(ev: LoLApiEventDetails): GameResult[] {
  const [t1, t2] = ev.match.teams;
  return (ev.match.games ?? [])
    .sort((a, b) => a.number - b.number)
    .map((g) => {
      const winnerEntry = g.teams.find((team) => (team.result?.gameWins ?? 0) > 0);
      return {
        number: g.number,
        state: g.state,
        winner: winnerEntry?.id === t1.id ? "team1"
          : winnerEntry?.id === t2.id ? "team2"
          : null,
      };
    });
}

function buildMatchHeaderData(ev: LoLApiEventDetails): MatchHeaderData {
  const [t1, t2] = ev.match.teams;
  const count = ev.match.strategy.count;
  const leagueRegion = ev.league.region ?? "";
  const games = buildGameResults(ev);

  return {
    status:
      ev.state === "inProgress" ? "live"
      : ev.state === "completed" ? "completed"
      : "upcoming",
    league: ev.league.slug ?? ev.league.name,
    eventName: ev.league.name,
    stage: ev.blockName,
    format: `Bo${count}` as MatchHeaderData["format"],
    date: ev.startTime,
    games: games.length > 0 ? games : undefined,
    score1: t1.result?.gameWins,
    score2: t2.result?.gameWins,
    team1: {
      name: t1.name,
      shortName: t1.code,
      image: t1.image || t1.alternativeImage,
      regionFlag: regionFlag(t1.origin?.region ?? leagueRegion),
      wins: t1.record?.wins ?? 0,
      losses: t1.record?.losses ?? 0,
      color: teamColor(t1.code),
    },
    team2: {
      name: t2.name,
      shortName: t2.code,
      image: t2.image || t2.alternativeImage,
      regionFlag: regionFlag(t2.origin?.region ?? leagueRegion),
      wins: t2.record?.wins ?? 0,
      losses: t2.record?.losses ?? 0,
      color: teamColor(t2.code),
    },
  };
}

function isCompletedMatchEvent(event: LoLApiScheduleEvent): boolean {
  return event.type === "match" && event.state === "completed" && event.match?.teams?.length === 2;
}

function formatYmd(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "TBD";
  return date.toISOString().slice(0, 10).replace(/-/g, "/");
}

function buildPastMatchForTeam(event: LoLApiScheduleEvent, teamCode: string): PastMatchItem | null {
  const [left, right] = event.match.teams;
  const leftCode = left.code?.toUpperCase();
  const rightCode = right.code?.toUpperCase();
  const code = teamCode.toUpperCase();

  const isLeft = leftCode === code;
  const isRight = rightCode === code;
  if (!isLeft && !isRight) return null;

  const team = isLeft ? left : right;
  const opponent = isLeft ? right : left;

  return {
    id: event.id ?? event.match.id,
    scoreFor: team.result?.gameWins ?? 0,
    scoreAgainst: opponent.result?.gameWins ?? 0,
    opponentName: opponent.name,
    opponentImage: opponent.image,
    date: formatYmd(event.startTime),
    won:
      team.result?.outcome === "win" ||
      (team.result?.gameWins ?? 0) > (opponent.result?.gameWins ?? 0),
  };
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;


  let matchData: MatchHeaderData;
  let mapsData: GameResult[] = [];
  let h2hCount = 0;
  let h2hTeam1Wins = 0;
  let h2hTeam2Wins = 0;
  let team1Recent: PastMatchItem[] = [];
  let team2Recent: PastMatchItem[] = [];
  try {
    const [eventRes, scheduleRes] = await Promise.all([
      getEventDetails(id),
      getSchedule(),
    ]);

    const event = eventRes.data.event;
    matchData = buildMatchHeaderData(event);
    mapsData = buildGameResults(event);

    const [eventTeam1, eventTeam2] = event.match.teams;
    const team1Code = eventTeam1.code.toUpperCase();
    const team2Code = eventTeam2.code.toUpperCase();

    const completed = scheduleRes.data.schedule.events
      .filter(isCompletedMatchEvent)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    const h2hMatches = completed.filter((scheduleEvent) => {
      const [left, right] = scheduleEvent.match.teams;
      const codes = new Set([left.code.toUpperCase(), right.code.toUpperCase()]);
      return codes.has(team1Code) && codes.has(team2Code);
    });

    h2hCount = h2hMatches.length;
    h2hTeam1Wins = h2hMatches.reduce((wins, scheduleEvent) => {
      const item = buildPastMatchForTeam(scheduleEvent, team1Code);
      return wins + (item?.won ? 1 : 0);
    }, 0);
    h2hTeam2Wins = h2hMatches.reduce((wins, scheduleEvent) => {
      const item = buildPastMatchForTeam(scheduleEvent, team2Code);
      return wins + (item?.won ? 1 : 0);
    }, 0);

    team1Recent = completed
      .map((scheduleEvent) => buildPastMatchForTeam(scheduleEvent, team1Code))
      .filter((item): item is PastMatchItem => item !== null)
      .slice(0, 5);

    team2Recent = completed
      .map((scheduleEvent) => buildPastMatchForTeam(scheduleEvent, team2Code))
      .filter((item): item is PastMatchItem => item !== null)
      .slice(0, 5);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-void">
      <Navbar />
      <MatchHeader data={matchData!} />
      <MatchMapsPanel
        team1Name={matchData.team1.name}
        team2Name={matchData.team2.name}
        score1={matchData.score1}
        score2={matchData.score2}
        bestOf={parseInt(matchData.format.replace("Bo", ""), 10)}
        maps={mapsData}
      />
      <EventHistoryPanel
        team1={{ name: matchData.team1.name, image: matchData.team1.image }}
        team2={{ name: matchData.team2.name, image: matchData.team2.image }}
        h2hCount={h2hCount}
        h2hTeam1Wins={h2hTeam1Wins}
        h2hTeam2Wins={h2hTeam2Wins}
        team1Recent={team1Recent}
        team2Recent={team2Recent}
      />
    </div>
  );
}
