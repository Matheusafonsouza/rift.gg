"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSchedule } from "@/hooks/useSchedule";
import type { AppMatch } from "@/lib/lolesports/transforms";
import { leagueColor } from "@/lib/lolesports/transforms";
import { EVENTS } from "@/data/homepage";

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

function MatchRow({ match }: { match: AppMatch }) {
  const color = match.leagueColor;
  return (
    <Link
      href={`/events/${match.id}`}
      className="hover-row group cursor-pointer"
    >
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

      <span
        className="font-cond text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-sm shrink-0"
        style={{
          color,
          backgroundColor: `${color}15`,
          border: `1px solid ${color}25`,
        }}
      >
        {match.leagueSlug.replace(/-/g, " ").toUpperCase()}
      </span>
    </Link>
  );
}

type SidebarEvent = {
  id: string;
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

function buildLeagueEvents(matches: AppMatch[], isLive: boolean): SidebarEvent[] {
  const byLeague = new Map<string, AppMatch>();

  for (const match of matches) {
    if (!byLeague.has(match.leagueSlug)) {
      byLeague.set(match.leagueSlug, match);
    }
  }

  return Array.from(byLeague.values()).map((match) => ({
    id: `${isLive ? "live" : "ongoing"}-${match.leagueSlug}`,
    name: match.leagueName,
    region: leagueLabel(match.leagueSlug),
    league: leagueLabel(match.leagueSlug),
    isLive,
    phase: match.blockName || (isLive ? "Live" : "Season"),
  }));
}

function EventRow({ event }: { event: SidebarEvent }) {
  const isUpcoming = !event.isLive && !event.phase;
  const color = leagueColor(event.league);
  return (
    <div className="hover-row group cursor-pointer">
      <div
        className="w-0.5 h-9 rounded-full shrink-0"
        style={{
          backgroundColor: color,
          opacity: isUpcoming ? 0.35 : 0.7,
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="font-body text-xs font-medium text-text-secondary group-hover:text-text-primary truncate transition-colors">
          {event.name}
        </div>
        <div className="font-cond text-[10px] text-text-muted mt-0.5 truncate">
          {event.isLive ? (
            <span className="text-crimson font-semibold tracking-wide">
              {event.phase}
            </span>
          ) : (
            event.dateRange || event.phase
          )}
        </div>
      </div>
      <span
        className="font-cond text-[9px] font-bold tracking-widest uppercase shrink-0"
        style={{ color, opacity: isUpcoming ? 0.5 : 1 }}
      >
        {event.region}
      </span>
      {event.isLive && <span className="live-dot shrink-0" />}
    </div>
  );
}

function isUpcomingEvent(e: (typeof EVENTS)[number]) {
  return ["MSI", "Worlds"].some((n) => e.name.includes(n));
}

export default function RightSidebar() {
  const { data, isLoading, error, refresh } = useSchedule();

  const liveMatches = data?.live ?? [];
  const upcomingMatches = data?.upcoming ?? [];
  const completedMatches = (data?.completed ?? []).slice(0, 5);
  const displayMatches = [
    ...liveMatches,
    ...upcomingMatches.slice(0, 10),
    ...completedMatches,
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
          ? Array.from({ length: 7 }).map((_, i) => <MatchSkeleton key={i} />)
          : displayMatches.length > 0
            ? displayMatches.map((m) => (
                <MatchRow key={`${m.id}-${m.startTime}`} match={m} />
              ))
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
            <EventRow key={e.id} event={e} />
          ))}
        </>
      )}

      <SectionLabel>Ongoing Events</SectionLabel>
      <div className="pb-1">
        {ongoingEvents.map((e) => (
          <EventRow key={e.id} event={e} />
        ))}
      </div>

      <SectionLabel>Upcoming Events</SectionLabel>
      <div className="pb-6">
        {upcomingEvents.map((e) => (
          <EventRow key={e.id} event={e} />
        ))}
      </div>
    </aside>
  );
}
