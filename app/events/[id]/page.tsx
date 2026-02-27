import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import EventTopBanner from "@/components/EventTopBanner";
import {
  getLeagues,
  getSchedule,
  getTournamentsForLeague,
} from "@/lib/lolesports/endpoints";
import type {
  LoLApiLeague,
  LoLApiScheduleEvent,
  LoLApiTournament,
} from "@/lib/lolesports/api-types";

function formatTournamentDateRange(
  startDate?: string,
  endDate?: string,
): string {
  if (!startDate || !endDate) return "TBD";

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()))
    return "TBD";

  const startLabel = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const endLabel = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}

function isLeagueMatch(event: LoLApiScheduleEvent, leagueId: string): boolean {
  return event.type === "match" && event.league.id === leagueId;
}

function formatEta(startTime: string): string {
  const start = new Date(startTime).getTime();
  if (!Number.isFinite(start)) return "TBD";
  const diff = Math.max(0, start - Date.now());
  const totalHours = Math.floor(diff / 3_600_000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const leaguesRes = await getLeagues();
    const leagues = leaguesRes.data.leagues;
    const league = leagues.find((entry: LoLApiLeague) => entry.id === id);
    if (!league) notFound();

    const [tournamentsRes, scheduleRes] = await Promise.all([
      getTournamentsForLeague(league.id),
      getSchedule([league.id]),
    ]);

    const tournaments = tournamentsRes.data.leagues.flatMap(
      (entry) => entry.tournaments,
    );
    const now = Date.now();
    const selectedTournament: LoLApiTournament | undefined =
      tournaments.find(
        (tournament) => new Date(tournament.endDate).getTime() >= now,
      ) ?? tournaments[0];

    const upcomingMatches = scheduleRes.data.schedule.events
      .filter(
        (event) =>
          isLeagueMatch(event, league.id) && event.state === "unstarted",
      )
      .slice(0, 6);

    return (
      <div className="min-h-screen bg-void">
        <Navbar />
        <EventTopBanner
          leagueName={league.name}
          leagueSlug={league.slug}
          stage="Featured Tournament"
          tournamentId={selectedTournament?.id}
          leagueImage={league.image}
          dateRangeLabel={formatTournamentDateRange(
            selectedTournament?.startDate,
            selectedTournament?.endDate,
          )}
          locationLabel="TBD"
        />

        <section className="max-w-[1320px] mx-auto px-6 py-6">
          <div className="px-1 pb-2">
            <span className="section-label">Upcoming Matches</span>
          </div>
          <div className="border border-ink-mid bg-ink divide-y divide-ink-mid">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((matchEvent) => {
                const [team1, team2] = matchEvent.match.teams;
                const eventId = matchEvent.id ?? matchEvent.match.id;
                return (
                  <Link
                    key={eventId}
                    href={`/matches/${eventId}`}
                    className="px-4 py-3 flex items-center justify-between hover:bg-ink-light transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-body text-sm text-text-secondary truncate">
                        {team1.name}{" "}
                        <span className="text-text-faint mx-1">vs</span>{" "}
                        {team2.name}
                      </div>
                      <div className="font-cond text-[10px] tracking-widest uppercase text-text-muted mt-1">
                        {matchEvent.blockName}
                      </div>
                    </div>
                    <span className="font-cond text-xs text-electric tabular-nums shrink-0">
                      {formatEta(matchEvent.startTime)}
                    </span>
                  </Link>
                );
              })
            ) : (
              <p className="px-4 py-6 text-center font-body text-sm text-text-muted">
                No upcoming matches found.
              </p>
            )}
          </div>
        </section>
      </div>
    );
  } catch {
    notFound();
  }
}
