import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getLeagues, getSchedule } from "@/lib/lolesports/endpoints";
import { groupMatchesByDate, transformScheduleEvent } from "@/lib/lolesports/transforms";

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "TBD";
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const tab = resolvedSearchParams?.tab === "results" ? "results" : "schedule";

  const [schedule, leaguesRes] = await Promise.all([
    getSchedule(),
    getLeagues(),
  ]);

  const leagueImageById = new Map<string, string>();
  const leagueImageBySlug = new Map<string, string>();
  const leagueImageByName = new Map<string, string>();
  for (const league of leaguesRes.data.leagues) {
    leagueImageById.set(league.id, league.image);
    leagueImageBySlug.set(league.slug.toLowerCase(), league.image);
    leagueImageByName.set(league.name.toLowerCase(), league.image);
  }

  const matches = schedule.data.schedule.events
    .filter((event) => event.type === "match" && event.match?.teams?.length === 2)
    .map(transformScheduleEvent)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const filteredMatches = matches.filter((match) =>
    tab === "results" ? match.state === "completed" : match.state !== "completed"
  );

  const groups = groupMatchesByDate(filteredMatches);

  return (
    <div className="min-h-screen bg-void">
      <Navbar />

      <main className="max-w-[1320px] mx-auto px-6 py-6">
        <div className="mb-4">
          <h1 className="font-display text-2xl text-text-primary">Matches</h1>
          <p className="font-body text-sm text-text-muted">Grouped by date</p>
          <div className="mt-3 inline-flex border border-ink-mid rounded-sm overflow-hidden">
            <Link
              href="/matches?tab=schedule"
              className={`px-4 py-1.5 font-cond text-xs tracking-widest uppercase transition-colors ${
                tab === "schedule"
                  ? "bg-ink-light text-text-primary"
                  : "bg-void text-text-muted hover:text-text-secondary"
              }`}
            >
              Schedule
            </Link>
            <Link
              href="/matches?tab=results"
              className={`px-4 py-1.5 font-cond text-xs tracking-widest uppercase border-l border-ink-mid transition-colors ${
                tab === "results"
                  ? "bg-ink-light text-text-primary"
                  : "bg-void text-text-muted hover:text-text-secondary"
              }`}
            >
              Results
            </Link>
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="border border-ink-mid bg-ink px-4 py-6 text-center font-body text-sm text-text-muted">
            {tab === "results" ? "No completed matches found." : "No upcoming or live matches found."}
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.date} className="border border-ink-mid bg-ink overflow-hidden">
                <div className="px-4 py-2 border-b border-ink-mid bg-void">
                  <span className="font-cond text-xs font-semibold tracking-widest uppercase text-text-secondary">
                    {group.date}
                  </span>
                </div>

                <div className="divide-y divide-ink-mid">
                  {group.matches.map((match) => {
                    const [team1, team2] = [match.team1, match.team2];
                    const team1Won =
                      team1.outcome === "win" ||
                      (match.state === "completed" && (team1.gameWins ?? 0) > (team2.gameWins ?? 0));
                    const team2Won =
                      team2.outcome === "win" ||
                      (match.state === "completed" && (team2.gameWins ?? 0) > (team1.gameWins ?? 0));
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
                        className="grid grid-cols-[88px_minmax(0,1fr)_120px_110px_260px] items-center gap-3 px-4 py-3 hover:bg-ink-light transition-colors"
                      >
                        <div className="font-cond text-xs text-text-muted tabular-nums">
                          {formatTime(match.startTime)}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            {team1.image && (
                              <img src={team1.image} alt="" className="w-4 h-4 object-contain shrink-0" />
                            )}
                            <span className={`font-body text-sm truncate ${team1Won ? "text-emerald font-semibold" : "text-text-secondary"}`}>
                              {team1.name}
                            </span>
                            <span className={`font-cond text-xs tabular-nums ml-1 ${team1Won ? "text-emerald" : "text-text-faint"}`}>
                              {match.state === "unstarted" ? "-" : (team1.gameWins ?? 0)}
                            </span>
                            {team1Won && <span className="font-cond text-[10px] text-emerald">✓</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {team2.image && (
                              <img src={team2.image} alt="" className="w-4 h-4 object-contain shrink-0" />
                            )}
                            <span className={`font-body text-sm truncate ${team2Won ? "text-emerald font-semibold" : "text-text-secondary"}`}>
                              {team2.name}
                            </span>
                            <span className={`font-cond text-xs tabular-nums ml-1 ${team2Won ? "text-emerald" : "text-text-faint"}`}>
                              {match.state === "unstarted" ? "-" : (team2.gameWins ?? 0)}
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
                          <div className="flex items-center justify-end gap-2 min-w-0">
                            {(match.leagueImage
                              ?? (match.leagueId ? leagueImageById.get(match.leagueId) : undefined)
                              ?? leagueImageBySlug.get(match.leagueSlug.toLowerCase())
                              ?? leagueImageByName.get(match.leagueName.toLowerCase())) ? (
                              <img
                                src={
                                  match.leagueImage
                                  ?? (match.leagueId ? leagueImageById.get(match.leagueId) : undefined)
                                  ?? leagueImageBySlug.get(match.leagueSlug.toLowerCase())
                                  ?? leagueImageByName.get(match.leagueName.toLowerCase())
                                }
                                alt=""
                                className="w-5 h-5 object-contain shrink-0"
                              />
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-ink-mid bg-void shrink-0" />
                              )}
                            <div className="font-body text-xs text-text-secondary truncate">{match.leagueName}</div>
                          </div>
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
        )}
      </main>
    </div>
  );
}
