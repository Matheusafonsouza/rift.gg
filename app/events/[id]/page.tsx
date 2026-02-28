import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import EventTopBanner from "@/components/EventTopBanner";
import {
  getLeagues,
  getSchedule,
  getTournamentsForLeague,
} from "@/lib/lolesports/endpoints";
import { groupMatchesByDate, transformScheduleEvent } from "@/lib/lolesports/transforms";
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

function isLeagueMatch(
  event: LoLApiScheduleEvent,
  league: LoLApiLeague,
): boolean {
  if (event.type !== "match") return false;

  const eventLeagueId = event.league.id;
  if (eventLeagueId) return eventLeagueId === league.id;

  const eventLeagueSlug = event.league.slug?.toLowerCase();
  if (eventLeagueSlug) return eventLeagueSlug === league.slug.toLowerCase();

  return event.league.name?.toLowerCase() === league.name.toLowerCase();
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "TBD";
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string; status?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const activeTab = resolvedSearchParams?.tab === "matches" ? "matches" : "overview";
  const statusFilter =
    resolvedSearchParams?.status === "all" ||
    resolvedSearchParams?.status === "upcoming" ||
    resolvedSearchParams?.status === "live" ||
    resolvedSearchParams?.status === "completed"
      ? resolvedSearchParams.status
      : "upcoming";

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

    const leagueMatches = scheduleRes.data.schedule.events
      .filter((event) => isLeagueMatch(event, league))
      .map(transformScheduleEvent)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const filteredMatches = leagueMatches.filter((match) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "upcoming") return match.state === "unstarted";
      if (statusFilter === "live") return match.state === "inProgress";
      return match.state === "completed";
    });

    const groupedMatches = groupMatchesByDate(filteredMatches);

    const liveCount = leagueMatches.filter((event) => event.state === "inProgress").length;
    const completedCount = leagueMatches.filter((event) => event.state === "completed").length;
    const upcomingCount = leagueMatches.filter((event) => event.state === "unstarted").length;

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
          <div className="inline-flex border border-ink-mid rounded-sm overflow-hidden mb-5">
            <Link
              href={`/events/${id}?tab=overview`}
              className={`px-4 py-1.5 font-cond text-xs tracking-widest uppercase transition-colors ${
                activeTab === "overview"
                  ? "bg-ink-light text-text-primary"
                  : "bg-void text-text-muted hover:text-text-secondary"
              }`}
            >
              Overview
            </Link>
            <Link
              href={`/events/${id}?tab=matches&status=upcoming`}
              className={`px-4 py-1.5 font-cond text-xs tracking-widest uppercase border-l border-ink-mid transition-colors ${
                activeTab === "matches"
                  ? "bg-ink-light text-text-primary"
                  : "bg-void text-text-muted hover:text-text-secondary"
              }`}
            >
              Matches
            </Link>
          </div>

          {activeTab === "overview" ? (
            <div className="border border-ink-mid bg-ink px-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <div className="font-cond text-[10px] tracking-widest uppercase text-text-faint">Tournament</div>
                  <div className="font-body text-sm text-text-secondary mt-1">{selectedTournament?.id ?? "TBD"}</div>
                </div>
                <div>
                  <div className="font-cond text-[10px] tracking-widest uppercase text-text-faint">Upcoming</div>
                  <div className="font-body text-sm text-text-secondary mt-1 tabular-nums">{upcomingCount}</div>
                </div>
                <div>
                  <div className="font-cond text-[10px] tracking-widest uppercase text-text-faint">Live</div>
                  <div className="font-body text-sm text-crimson mt-1 tabular-nums">{liveCount}</div>
                </div>
                <div>
                  <div className="font-cond text-[10px] tracking-widest uppercase text-text-faint">Completed</div>
                  <div className="font-body text-sm text-text-secondary mt-1 tabular-nums">{completedCount}</div>
                </div>
              </div>
            </div>
          ) : (
          <div className="px-1 pb-2">
            <span className="section-label">Upcoming Matches</span>
          </div>
          )}

          {activeTab === "matches" && (
            <>
              <div className="inline-flex border border-ink-mid rounded-sm overflow-hidden mb-4">
                <Link
                  href={`/events/${id}?tab=matches&status=all`}
                  className={`px-3 py-1.5 font-cond text-xs tracking-widest uppercase transition-colors ${
                    statusFilter === "all"
                      ? "bg-ink-light text-text-primary"
                      : "bg-void text-text-muted hover:text-text-secondary"
                  }`}
                >
                  All
                </Link>
                <Link
                  href={`/events/${id}?tab=matches&status=upcoming`}
                  className={`px-3 py-1.5 font-cond text-xs tracking-widest uppercase border-l border-ink-mid transition-colors ${
                    statusFilter === "upcoming"
                      ? "bg-ink-light text-text-primary"
                      : "bg-void text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Upcoming
                </Link>
                <Link
                  href={`/events/${id}?tab=matches&status=live`}
                  className={`px-3 py-1.5 font-cond text-xs tracking-widest uppercase border-l border-ink-mid transition-colors ${
                    statusFilter === "live"
                      ? "bg-ink-light text-text-primary"
                      : "bg-void text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Live
                </Link>
                <Link
                  href={`/events/${id}?tab=matches&status=completed`}
                  className={`px-3 py-1.5 font-cond text-xs tracking-widest uppercase border-l border-ink-mid transition-colors ${
                    statusFilter === "completed"
                      ? "bg-ink-light text-text-primary"
                      : "bg-void text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Completed
                </Link>
              </div>

              {groupedMatches.length > 0 ? (
                <div className="space-y-4">
                  {groupedMatches.map((group) => (
                    <section key={group.date} className="border border-ink-mid bg-ink overflow-hidden">
                      <div className="px-4 py-2 border-b border-ink-mid bg-void">
                        <span className="font-cond text-xs font-semibold tracking-widest uppercase text-text-secondary">
                          {group.date}
                        </span>
                      </div>

                      <div className="divide-y divide-ink-mid">
                        {group.matches.map((match) => {
                          const team1Won =
                            match.team1.outcome === "win" ||
                            (match.state === "completed" && (match.team1.gameWins ?? 0) > (match.team2.gameWins ?? 0));
                          const team2Won =
                            match.team2.outcome === "win" ||
                            (match.state === "completed" && (match.team2.gameWins ?? 0) > (match.team1.gameWins ?? 0));
                          const statusText = match.isLive
                            ? "Live"
                            : match.state === "completed"
                              ? "Completed"
                              : "Upcoming";
                          const timingText = match.isLive
                            ? "Live now"
                            : match.state === "completed"
                              ? `Ended ${match.relativeTime}`
                              : `Starts in ${match.relativeTime}`;

                          return (
                            <Link
                              key={`${match.id}-${match.startTime}`}
                              href={`/matches/${match.id}`}
                              className="grid grid-cols-[88px_minmax(0,1fr)_120px_140px_220px] items-center gap-3 px-4 py-3 hover:bg-ink-light transition-colors"
                            >
                              <div className="font-cond text-xs text-text-muted tabular-nums">
                                {formatTime(match.startTime)}
                              </div>

                              <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                  {match.team1.image && (
                                    <img src={match.team1.image} alt="" className="w-4 h-4 object-contain shrink-0" />
                                  )}
                                  <span className={`font-body text-sm truncate ${team1Won ? "text-emerald font-semibold" : "text-text-secondary"}`}>
                                    {match.team1.name}
                                  </span>
                                  <span className={`font-cond text-xs tabular-nums ml-1 ${team1Won ? "text-emerald" : "text-text-faint"}`}>
                                    {match.state === "unstarted" ? "-" : (match.team1.gameWins ?? 0)}
                                  </span>
                                  {team1Won && <span className="font-cond text-[10px] text-emerald">✓</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                  {match.team2.image && (
                                    <img src={match.team2.image} alt="" className="w-4 h-4 object-contain shrink-0" />
                                  )}
                                  <span className={`font-body text-sm truncate ${team2Won ? "text-emerald font-semibold" : "text-text-secondary"}`}>
                                    {match.team2.name}
                                  </span>
                                  <span className={`font-cond text-xs tabular-nums ml-1 ${team2Won ? "text-emerald" : "text-text-faint"}`}>
                                    {match.state === "unstarted" ? "-" : (match.team2.gameWins ?? 0)}
                                  </span>
                                  {team2Won && <span className="font-cond text-[10px] text-emerald">✓</span>}
                                </div>
                              </div>

                              <div>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-sm font-cond text-[10px] tracking-widest uppercase ${
                                    match.isLive
                                      ? "bg-crimson/15 text-crimson"
                                      : match.state === "completed"
                                        ? "bg-emerald/15 text-emerald"
                                        : "bg-electric/15 text-electric"
                                  }`}
                                >
                                  {statusText}
                                </span>
                              </div>

                              <div className="text-right">
                                <div className="font-cond text-xs text-text-muted tabular-nums">{timingText}</div>
                              </div>

                              <div className="text-right min-w-0">
                                <div className="font-body text-xs text-text-secondary truncate">{match.leagueName}</div>
                                <div className="font-cond text-[10px] tracking-widest uppercase text-text-faint truncate mt-0.5">
                                  {match.blockName}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="border border-ink-mid bg-ink px-4 py-6 text-center font-body text-sm text-text-muted">
                  No matches found for this status.
                </div>
              )}
            </>
          )}
        </section>
      </div>
    );
  } catch {
    notFound();
  }
}
