import { leagueColor } from "@/lib/lolesports/transforms";

type Props = {
  leagueName: string;
  leagueSlug: string;
  stage: string;
  tournamentId?: string;
  leagueImage?: string;
  dateRangeLabel?: string;
  locationLabel?: string;
};

export default function EventTopBanner({
  leagueName,
  leagueSlug,
  stage,
  tournamentId,
  leagueImage,
  dateRangeLabel,
  locationLabel,
}: Props) {
  const accent = leagueColor(leagueSlug);

  return (
    <section className="border-b border-ink-mid bg-ink">
      <div className="max-w-[1320px] mx-auto px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="w-[76px] h-[76px] rounded-sm border border-ink-mid bg-void flex items-center justify-center shrink-0 overflow-hidden">
            {leagueImage ? (
              <img src={leagueImage} alt={leagueName} className="w-[64px] h-[64px] object-contain" />
            ) : (
              <span className="font-cond text-xs tracking-widest uppercase text-text-muted">Event</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="font-cond text-[10px] tracking-widest uppercase text-text-muted mb-1">
              {leagueSlug.toUpperCase().replace(/-/g, " ")}
              {tournamentId ? ` • ${tournamentId}` : ""}
            </div>

            <h1 className="font-display text-3xl text-text-primary leading-tight">
              {leagueName}
            </h1>

            <p className="mt-1 font-body text-sm text-text-secondary">
              {stage}
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-[760px]">
              <div>
                <div className="font-cond text-[10px] tracking-widest uppercase text-text-muted">Dates</div>
                <div className="font-body text-sm text-text-secondary">{dateRangeLabel ?? "TBD"}</div>
              </div>
              <div>
                <div className="font-cond text-[10px] tracking-widest uppercase text-text-muted">Location</div>
                <div className="font-body text-sm text-text-secondary">{locationLabel ?? "TBD"}</div>
              </div>
              <div>
                <div className="font-cond text-[10px] tracking-widest uppercase text-text-muted">League</div>
                <div className="font-body text-sm text-text-secondary" style={{ color: accent }}>
                  {leagueName}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
