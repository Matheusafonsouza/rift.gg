"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSchedule } from "@/hooks/useSchedule";
import type { AppMatch } from "@/lib/lolesports/transforms";
import { leagueColor } from "@/lib/lolesports/transforms";
import { EVENTS } from "@/data/homepage";

type LeagueLookup = { id: string; slug: string; name: string; image?: string; region?: string };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-4 pb-2">
      <div className="section-label">{children}</div>
      <div className="mt-1.5 h-px bg-gradient-to-r from-gold/30 to-transparent" />
    </div>
  );
}

function MatchSkeleton() {
  return (
    <div className="px-3 py-2 flex gap-2 animate-pulse">
      <div className="w-0.5 h-8 bg-ink-mid rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 w-3/4 bg-ink-mid rounded" />
        <div className="h-2.5 w-1/2 bg-ink-mid rounded" />
      </div>
      <div className="w-10 space-y-1.5">
        <div className="h-2.5 bg-ink-mid rounded" />
        <div className="h-2 bg-ink-mid rounded" />
      </div>
    </div>
  );
}

function MatchRow({
  match,
  resolvedEventRouteId,
}: {
  match: AppMatch;
  resolvedEventRouteId?: string;
}) {
  const color = match.leagueColor;

  return (
    <div className="hover-row group cursor-pointer">
      <Link href={`/matches/${match.id}`} className="contents">
      <div
        className="w-0.5 h-8 rounded-full shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {match.team1.image && (
            <img
              src={match.team1.image}
              alt=""
              className="w-4 h-4 object-contain shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span className="font-body text-xs font-semibold text-text-secondary group-hover:text-text-primary truncate transition-colors">
            {match.team1.code}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {match.team2.image && (
            <img
              src={match.team2.image}
              alt=""
              className="w-4 h-4 object-contain shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span className="font-body text-xs text-text-muted group-hover:text-text-secondary truncate transition-colors">
            {match.team2.code}
          </span>
        </div>
      </div>

      <div className="text-right shrink-0">
        {match.isLive ? (
          <div>
            <div className="flex items-center justify-end gap-1.5 mb-0.5">
              <span className="live-dot" />
              <span className="font-cond text-[10px] font-bold tracking-widest uppercase text-crimson">
                Live
              </span>
            </div>
            <div className="font-cond text-sm font-bold tabular-nums">
              <span className="text-crimson">{match.team1.gameWins ?? 0}</span>
              <span className="text-text-faint mx-1">–</span>
              <span className="text-text-muted">
                {match.team2.gameWins ?? 0}
              </span>
            </div>
          </div>
        ) : match.state === "completed" ? (
          <div>
            <div className="font-cond text-xs text-text-muted mb-0.5">
              Final
            </div>
            <div className="font-cond text-sm font-bold tabular-nums">
              <span
                className={
                  match.team1.outcome === "win"
                    ? "text-emerald"
                    : "text-text-muted"
                }
              >
                {match.team1.gameWins ?? 0}
              </span>
              <span className="text-text-faint mx-1">–</span>
              <span
                className={
                  match.team2.outcome === "win"
                    ? "text-emerald"
                    : "text-text-muted"
                }
              >
                {match.team2.gameWins ?? 0}
              </span>
            </div>
          </div>
        ) : (
          <div>
            <div className="match-time">{match.relativeTime}</div>
            <div className="font-cond text-[10px] text-text-muted mt-0.5">
              Bo{match.bestOf}
            </div>
          </div>
        )}
      </div>

      </Link>
      <Link
        href={resolvedEventRouteId ? `/events/${resolvedEventRouteId}` : "/events"}
        className="font-cond text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-sm shrink-0"
        style={{
          color,
          backgroundColor: `${color}15`,
          border: `1px solid ${color}25`,
        }}
      >
        {match.leagueSlug.replace(/-/g, " ").toUpperCase()}
      </Link>
    </div>
  );
}

type SidebarEvent = {
  id: string;
  routeId?: string;
  leagueSlug?: string;
  leagueName?: string;
  image?: string;
  name: string;
  region: string;
  league: string;
  dateRange?: string;
  isLive?: boolean;
  phase?: string;
};

function leagueLabel(slugOrKey: string): string {
  return slugOrKey.replace(/-/g, " ").toUpperCase();
}

function regionCode(region?: string): string {
  const normalized = (region ?? "").toUpperCase();
  if (normalized === "KOREA") return "KR";
  if (normalized === "CHINA") return "CN";
  if (normalized === "EUROPE") return "EU";
  if (normalized === "NORTH AMERICA") return "NA";
  if (normalized === "BRAZIL") return "BR";
  if (normalized === "JAPAN") return "JP";
  if (normalized === "OCEANIA") return "OCE";
  if (normalized === "INTERNATIONAL") return "INT";
  return normalized || "INT";
}

function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "TBD";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildDateRange(startIso?: string, endIso?: string): string | undefined {
  if (!startIso || !endIso) return undefined;
  return `${formatShortDate(startIso)} - ${formatShortDate(endIso)}`;
}

function buildLeagueEvents(matches: AppMatch[], isLive: boolean): SidebarEvent[] {
  const byLeague = new Map<string, AppMatch[]>();

  for (const match of matches) {
    const existing = byLeague.get(match.leagueSlug) ?? [];
    existing.push(match);
    byLeague.set(match.leagueSlug, existing);
  }

  return Array.from(byLeague.entries()).map(([leagueSlug, leagueMatches]) => {
    const first = leagueMatches[0];
    const sortedTimes = leagueMatches
      .map((m) => new Date(m.startTime).getTime())
      .filter((t) => Number.isFinite(t))
      .sort((a, b) => a - b);

    const startIso = sortedTimes.length > 0 ? new Date(sortedTimes[0]).toISOString() : undefined;
    const endIso = sortedTimes.length > 0 ? new Date(sortedTimes[sortedTimes.length - 1]).toISOString() : undefined;

    return {
    id: `${isLive ? "live" : "ongoing"}-${leagueSlug}`,
    routeId: first.leagueId,
    leagueSlug,
    leagueName: first.leagueName,
    image: first.leagueImage,
    name: first.leagueName,
    region: leagueLabel(leagueSlug),
    league: leagueLabel(leagueSlug),
    dateRange: buildDateRange(startIso, endIso),
    isLive,
    phase: first.blockName || (isLive ? "Live" : "Season"),
    };
  });
}

function EventRow({ event }: { event: SidebarEvent }) {
  const isUpcoming = !event.isLive && !event.phase;
  const color = leagueColor(event.league);
  return (
    <Link href={event.routeId ? `/events/${event.routeId}` : "/events"} className="hover-row group cursor-pointer">
      <div
        className="w-0.5 h-9 rounded-full shrink-0"
        style={{
          backgroundColor: color,
          opacity: isUpcoming ? 0.35 : 0.7,
        }}
      />
      {event.image ? (
        <img
          src={event.image}
          alt=""
          className="w-4 h-4 object-contain shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="w-4 h-4 rounded-full border border-ink-mid bg-void shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-body text-xs font-medium text-text-secondary group-hover:text-text-primary truncate transition-colors">
          {event.name}
        </div>
        <div className="font-cond text-[10px] text-text-muted mt-0.5 truncate">
          <span className="tracking-widest uppercase">{event.region}</span>
          {(event.dateRange || event.phase) && <span className="mx-1">·</span>}
          {event.dateRange || event.phase}
        </div>
      </div>
      {event.isLive && <span className="live-dot shrink-0" />}
    </Link>
  );
}

function isUpcomingEvent(e: (typeof EVENTS)[number]) {
  return ["MSI", "Worlds"].some((n) => e.name.includes(n));
}

export default function RightSidebar() {
  const { data, isLoading, error, refresh } = useSchedule();
  const [leagueLookup, setLeagueLookup] = useState<LeagueLookup[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadLeagues = async () => {
      try {
        const res = await fetch("/api/leagues");
        if (!res.ok) return;
        const json = await res.json() as { leagues?: LeagueLookup[] };
        if (mounted) {
          setLeagueLookup(json.leagues ?? []);
        }
      } catch {
        // silent fallback: links use /events when league id cannot be resolved
      }
    };

    void loadLeagues();
    return () => {
      mounted = false;
    };
  }, []);

  const leagueIdBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const league of leagueLookup) {
      map.set(league.slug.toLowerCase(), league.id);
    }
    return map;
  }, [leagueLookup]);

  const leagueIdByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const league of leagueLookup) {
      map.set(league.name.toLowerCase(), league.id);
    }
    return map;
  }, [leagueLookup]);

  const leagueRegionById = useMemo(() => {
    const map = new Map<string, string>();
    for (const league of leagueLookup) {
      if (league.region) map.set(league.id, regionCode(league.region));
    }
    return map;
  }, [leagueLookup]);

  const leagueRegionBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const league of leagueLookup) {
      if (league.region) map.set(league.slug.toLowerCase(), regionCode(league.region));
    }
    return map;
  }, [leagueLookup]);

  const leagueImageById = useMemo(() => {
    const map = new Map<string, string>();
    for (const league of leagueLookup) {
      if (league.image) map.set(league.id, league.image);
    }
    return map;
  }, [leagueLookup]);

  const leagueImageBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const league of leagueLookup) {
      if (league.image) map.set(league.slug.toLowerCase(), league.image);
    }
    return map;
  }, [leagueLookup]);

  const leagueImageByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const league of leagueLookup) {
      if (league.image) map.set(league.name.toLowerCase(), league.image);
    }
    return map;
  }, [leagueLookup]);

  const resolveLeagueId = (routeId?: string, slug?: string, name?: string): string | undefined => {
    if (routeId) return routeId;
    if (slug) {
      const bySlug = leagueIdBySlug.get(slug.toLowerCase());
      if (bySlug) return bySlug;
    }
    if (name) {
      const byName = leagueIdByName.get(name.toLowerCase());
      if (byName) return byName;
    }
    return undefined;
  };

  const resolveLeagueImage = (routeId?: string, slug?: string, name?: string): string | undefined => {
    if (routeId) {
      const byId = leagueImageById.get(routeId);
      if (byId) return byId;
    }
    if (slug) {
      const bySlug = leagueImageBySlug.get(slug.toLowerCase());
      if (bySlug) return bySlug;
    }
    if (name) {
      const byName = leagueImageByName.get(name.toLowerCase());
      if (byName) return byName;
    }
    return undefined;
  };

  const resolveLeagueRegion = (fallbackRegion?: string, routeId?: string, slug?: string): string => {
    if (routeId) {
      const byId = leagueRegionById.get(routeId);
      if (byId) return byId;
    }
    if (slug) {
      const bySlug = leagueRegionBySlug.get(slug.toLowerCase());
      if (bySlug) return bySlug;
    }
    return fallbackRegion ?? "INT";
  };

  const liveMatches = data?.live ?? [];
  const upcomingMatches = data?.upcoming ?? [];
  const completedMatches = (data?.completed ?? []).slice(0, 5);
  const upcomingLiveMatches = [
    ...liveMatches,
    ...upcomingMatches.slice(0, 10),
  ];

  const liveEvents = useMemo(
    () => buildLeagueEvents(liveMatches, true),
    [liveMatches]
  );

  const ongoingEvents = useMemo(() => {
    const liveLeagueSet = new Set(liveEvents.map((event) => event.league));
    return buildLeagueEvents([...upcomingMatches, ...completedMatches], false)
      .filter((event) => !liveLeagueSet.has(event.league));
  }, [upcomingMatches, completedMatches, liveEvents]);

  const upcomingEvents: SidebarEvent[] = EVENTS
    .filter(isUpcomingEvent)
    .map((event) => ({
      id: event.id,
      routeId: undefined,
      leagueSlug: event.name.includes("Worlds")
        ? "worlds"
        : event.name.includes("MSI")
          ? "msi"
          : event.league.toLowerCase(),
      leagueName: event.name,
      name: event.name,
      region: event.region,
      league: event.league,
      dateRange: event.dateRange,
      isLive: event.isLive,
      phase: event.phase,
    }));

  return (
    <aside className="bg-ink border-l border-ink-mid overflow-y-auto">
      <SectionLabel>
        <>
          Matches
          {liveMatches.length > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 font-cond text-[10px] font-bold normal-case tracking-normal">
              <span className="live-dot w-1.5 h-1.5" />
              <span className="text-crimson">{liveMatches.length} Live</span>
            </span>
          )}
        </>
      </SectionLabel>

      {error && (
        <div className="mx-3 my-2 p-3 rounded-sm bg-crimson/5 border border-crimson/20">
          <p className="font-cond text-xs text-crimson/80 mb-2">
            Could not reach the lolesports API.
          </p>
          <button
            onClick={refresh}
            className="font-cond text-[10px] font-bold tracking-widest uppercase text-crimson/60 hover:text-crimson transition-colors"
          >
            Retry →
          </button>
        </div>
      )}

      <div className="pb-2">
        {isLoading
          ? (
            <>
              <div className="px-3 pt-1 pb-1 font-cond text-[10px] tracking-widest uppercase text-text-faint">Upcoming / Live</div>
              {Array.from({ length: 4 }).map((_, i) => <MatchSkeleton key={`up-${i}`} />)}
              <div className="px-3 pt-3 pb-1 font-cond text-[10px] tracking-widest uppercase text-text-faint">Completed</div>
              {Array.from({ length: 3 }).map((_, i) => <MatchSkeleton key={`cp-${i}`} />)}
            </>
            )
          : (upcomingLiveMatches.length > 0 || completedMatches.length > 0)
            ? (
              <>
                <div className="px-3 pt-1 pb-1 font-cond text-[10px] tracking-widest uppercase text-text-faint">Upcoming / Live</div>
                {upcomingLiveMatches.length > 0 ? upcomingLiveMatches.map((m) => (
                  <MatchRow
                    key={`${m.id}-${m.startTime}`}
                    match={m}
                    resolvedEventRouteId={resolveLeagueId(m.leagueId, m.leagueSlug, m.leagueName)}
                  />
                )) : (
                  <p className="px-3 py-3 font-body text-xs text-text-muted text-center">No upcoming or live matches.</p>
                )}

                <div className="px-3 pt-3 pb-1 font-cond text-[10px] tracking-widest uppercase text-text-faint">Completed</div>
                {completedMatches.length > 0 ? completedMatches.map((m) => (
                  <MatchRow
                    key={`completed-${m.id}-${m.startTime}`}
                    match={m}
                    resolvedEventRouteId={resolveLeagueId(m.leagueId, m.leagueSlug, m.leagueName)}
                  />
                )) : (
                  <p className="px-3 py-3 font-body text-xs text-text-muted text-center">No completed matches.</p>
                )}
              </>
              )
            : !error && (
                <p className="px-3 py-4 font-body text-xs text-text-muted text-center">
                  No matches scheduled.
                </p>
              )}
      </div>

      {!isLoading && (
        <div className="px-3 py-2 border-t border-ink-mid">
          <button className="w-full py-1.5 font-cond text-xs font-semibold tracking-widest uppercase text-electric/60 hover:text-electric border border-transparent hover:border-electric/20 rounded-sm transition-all duration-200">
            View all matches →
          </button>
        </div>
      )}

      {liveEvents.length > 0 && (
        <>
          <SectionLabel>Live Events</SectionLabel>
          {liveEvents.map((e) => (
            <EventRow
              key={e.id}
              event={{
                ...e,
                routeId: resolveLeagueId(e.routeId, e.leagueSlug, e.leagueName),
                region: resolveLeagueRegion(e.region, e.routeId, e.leagueSlug),
                image: resolveLeagueImage(e.routeId, e.leagueSlug, e.leagueName) ?? e.image,
              }}
            />
          ))}
        </>
      )}

      <SectionLabel>Ongoing Events</SectionLabel>
      <div className="pb-1">
        {ongoingEvents.map((e) => (
          <EventRow
            key={e.id}
            event={{
              ...e,
              routeId: resolveLeagueId(e.routeId, e.leagueSlug, e.leagueName),
              region: resolveLeagueRegion(e.region, e.routeId, e.leagueSlug),
              image: resolveLeagueImage(e.routeId, e.leagueSlug, e.leagueName) ?? e.image,
            }}
          />
        ))}
      </div>

      <SectionLabel>Upcoming Events</SectionLabel>
      <div className="pb-6">
        {upcomingEvents.map((e) => (
          <EventRow
            key={e.id}
            event={{
              ...e,
              routeId: resolveLeagueId(e.routeId, e.leagueSlug, e.leagueName),
              region: resolveLeagueRegion(e.region, e.routeId, e.leagueSlug),
              image: resolveLeagueImage(e.routeId, e.leagueSlug, e.leagueName) ?? e.image,
            }}
          />
        ))}
      </div>
    </aside>
  );
}
