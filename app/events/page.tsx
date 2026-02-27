import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getLeagues, getTournamentsForLeague } from "@/lib/lolesports/endpoints";
import { regionFlag } from "@/lib/lolesports/transforms";

type EventCard = {
  id: string;
  leagueId: string;
  leagueName: string;
  leagueSlug: string;
  leagueImage?: string;
  region: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "ongoing" | "completed";
};

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return "TBD";

  const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${startLabel} – ${endLabel}`;
}

function getStatus(startDate: string, endDate: string): EventCard["status"] {
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end)) return "upcoming";
  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "ongoing";
}

function normalizeRegion(region?: string): string {
  return (region ?? "").trim().toUpperCase();
}

function formatRegionLabel(region: string): string {
  return region
    .toLowerCase()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function EventRow({ event }: { event: EventCard }) {
  const isCompleted = event.status === "completed";

  return (
    <Link
      href={`/events/${event.leagueId}`}
      className="grid grid-cols-[1fr_56px] gap-4 px-4 py-3 border-b border-ink-mid hover:bg-ink-light transition-colors"
    >
      <div className="min-w-0">
        <div className="font-body text-sm text-text-primary font-semibold truncate">
          {event.leagueName}
        </div>

        <div className="mt-2 grid grid-cols-4 gap-3 text-[10px]">
          <div>
            <div className={`font-cond tracking-widest uppercase ${isCompleted ? "text-electric" : "text-crimson"}`}>
              {isCompleted ? "Completed" : event.status === "ongoing" ? "Ongoing" : "Upcoming"}
            </div>
            <div className="font-cond tracking-widest uppercase text-text-faint mt-0.5">Status</div>
          </div>

          <div>
            <div className="font-body text-text-secondary">TBD</div>
            <div className="font-cond tracking-widest uppercase text-text-faint mt-0.5">Prize Pool</div>
          </div>

          <div>
            <div className="font-body text-text-secondary">{formatDateRange(event.startDate, event.endDate)}</div>
            <div className="font-cond tracking-widest uppercase text-text-faint mt-0.5">Dates</div>
          </div>

          <div>
            <div className="font-body text-text-secondary">{regionFlag(event.region)} {event.region}</div>
            <div className="font-cond tracking-widest uppercase text-text-faint mt-0.5">Region</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end">
        {event.leagueImage ? (
          <img src={event.leagueImage} alt="" className="w-10 h-10 object-contain" />
        ) : (
          <div className="w-10 h-10 rounded-full border border-ink-mid bg-void" />
        )}
      </div>
    </Link>
  );
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<{ region?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedRegion = normalizeRegion(resolvedSearchParams?.region);

  const leaguesRes = await getLeagues();

  const eventRows = await Promise.all(
    leaguesRes.data.leagues
      .sort((a, b) => a.priority - b.priority)
      .map(async (league) => {
        const tournamentsRes = await getTournamentsForLeague(league.id);
        const tournaments = tournamentsRes.data.leagues.flatMap((entry) => entry.tournaments);

        return tournaments.map((tournament) => ({
          id: tournament.id,
          leagueId: league.id,
          leagueName: `${league.name} ${tournament.slug ? `• ${tournament.slug.replace(/-/g, " ")}` : ""}`.trim(),
          leagueSlug: league.slug,
          leagueImage: league.image,
          region: league.region,
          startDate: tournament.startDate,
          endDate: tournament.endDate,
          status: getStatus(tournament.startDate, tournament.endDate),
        } as EventCard));
      })
  );

  const allEvents = eventRows.flat();

  const availableRegions = Array.from(
    new Set(allEvents.map((event) => normalizeRegion(event.region)).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const filteredEvents = selectedRegion
    ? allEvents.filter((event) => normalizeRegion(event.region) === selectedRegion)
    : allEvents;

  const upcomingOngoing = filteredEvents
    .filter((event) => event.status !== "completed")
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const completed = filteredEvents
    .filter((event) => event.status === "completed")
    .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

  return (
    <div className="min-h-screen bg-void">
      <Navbar />

      <main className="max-w-[1320px] mx-auto px-6 py-6">
        <div className="mb-4">
          <h1 className="font-display text-2xl text-text-primary">Events</h1>
          <p className="font-body text-sm text-text-muted">Upcoming/Ongoing and completed events</p>
          <div className="mt-3 inline-flex flex-wrap border border-ink-mid rounded-sm overflow-hidden">
            <Link
              href="/events"
              className={`px-3 py-1.5 font-cond text-xs tracking-widest uppercase transition-colors ${
                !selectedRegion
                  ? "bg-ink-light text-text-primary"
                  : "bg-void text-text-muted hover:text-text-secondary"
              }`}
            >
              All
            </Link>
            {availableRegions.map((region) => (
              <Link
                key={region}
                href={`/events?region=${encodeURIComponent(region)}`}
                className={`px-3 py-1.5 font-cond text-xs tracking-widest uppercase border-l border-ink-mid transition-colors ${
                  selectedRegion === region
                    ? "bg-ink-light text-text-primary"
                    : "bg-void text-text-muted hover:text-text-secondary"
                }`}
              >
                {regionFlag(region)} {formatRegionLabel(region)}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="border border-ink-mid bg-ink overflow-hidden">
            <div className="px-4 py-2 border-b border-ink-mid bg-void">
              <span className="section-label">Upcoming Events</span>
            </div>
            {upcomingOngoing.length > 0 ? (
              upcomingOngoing.map((event) => <EventRow key={`up-${event.id}-${event.leagueId}`} event={event} />)
            ) : (
              <p className="px-4 py-6 text-center font-body text-sm text-text-muted">No upcoming events.</p>
            )}
          </section>

          <section className="border border-ink-mid bg-ink overflow-hidden">
            <div className="px-4 py-2 border-b border-ink-mid bg-void">
              <span className="section-label">Completed Events</span>
            </div>
            {completed.length > 0 ? (
              completed.map((event) => <EventRow key={`done-${event.id}-${event.leagueId}`} event={event} />)
            ) : (
              <p className="px-4 py-6 text-center font-body text-sm text-text-muted">No completed events.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
