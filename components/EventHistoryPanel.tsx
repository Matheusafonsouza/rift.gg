type TeamInfo = {
  name: string;
  image?: string;
};

export type PastMatchItem = {
  id: string;
  scoreFor: number;
  scoreAgainst: number;
  opponentName: string;
  opponentImage?: string;
  date: string;
  won: boolean;
};

type Props = {
  team1: TeamInfo;
  team2: TeamInfo;
  h2hCount: number;
  h2hTeam1Wins: number;
  h2hTeam2Wins: number;
  team1Recent: PastMatchItem[];
  team2Recent: PastMatchItem[];
};

function TeamBadge({ team, align = "left" }: { team: TeamInfo; align?: "left" | "right" }) {
  const isRight = align === "right";

  return (
    <div className={`flex items-center gap-3 ${isRight ? "flex-row-reverse text-right" : ""}`}>
      {team.image ? (
        <img src={team.image} alt={team.name} className="w-10 h-10 object-contain" />
      ) : (
        <div className="w-10 h-10 rounded-full border border-ink-mid bg-void" />
      )}
      <span className="font-body text-2xl text-text-secondary font-semibold leading-tight">{team.name}</span>
    </div>
  );
}

function PastMatchColumn({ matches }: { matches: PastMatchItem[] }) {
  if (matches.length === 0) {
    return (
      <div className="border border-ink-mid bg-ink p-4">
        <p className="font-body text-sm text-text-muted text-center">No completed matches found.</p>
      </div>
    );
  }

  return (
    <div className="border border-ink-mid bg-ink divide-y divide-ink-mid">
      {matches.map((match) => (
        <div
          key={match.id}
          className={`px-4 py-3 flex items-center justify-between gap-3 ${match.won ? "bg-emerald/5" : "bg-crimson/5"}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1">
              <span className="w-6 h-7 rounded-sm border border-ink-mid bg-void flex items-center justify-center font-cond text-lg font-bold text-text-primary tabular-nums">
                {match.scoreFor}
              </span>
              <span className="w-6 h-7 rounded-sm border border-ink-mid bg-void flex items-center justify-center font-cond text-lg font-bold text-text-muted tabular-nums">
                {match.scoreAgainst}
              </span>
            </div>
            <span className="font-cond text-xs text-text-faint">vs.</span>
            {match.opponentImage ? (
              <img src={match.opponentImage} alt={match.opponentName} className="w-6 h-6 object-contain shrink-0" />
            ) : (
              <div className="w-6 h-6 rounded-full border border-ink-mid bg-void shrink-0" />
            )}
            <span className="font-body text-sm text-text-secondary font-semibold truncate">{match.opponentName}</span>
          </div>

          <span className="font-cond text-xs text-text-muted tabular-nums shrink-0">{match.date}</span>
        </div>
      ))}
    </div>
  );
}

export default function EventHistoryPanel({
  team1,
  team2,
  h2hCount,
  h2hTeam1Wins,
  h2hTeam2Wins,
  team1Recent,
  team2Recent,
}: Props) {
  return (
    <section className="max-w-[1320px] mx-auto px-6 pb-8 space-y-6">
      <div>
        <div className="px-1 pb-2">
          <span className="section-label">Head-to-Head</span>
        </div>
        <div className="border border-ink-mid bg-ink px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <TeamBadge team={team1} />
            <TeamBadge team={team2} align="right" />
          </div>

          <div className="mt-6 text-center">
            {h2hCount > 0 ? (
              <>
                <div className="font-display text-3xl text-text-primary tabular-nums">
                  {h2hTeam1Wins} - {h2hTeam2Wins}
                </div>
                <p className="mt-1 font-cond text-xs tracking-widest uppercase text-text-muted">
                  {h2hCount} previous encounters
                </p>
              </>
            ) : (
              <p className="font-body text-lg text-text-muted italic">No previous encounters</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="px-1 pb-2">
          <span className="section-label">Past Matches</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PastMatchColumn matches={team1Recent} />
          <PastMatchColumn matches={team2Recent} />
        </div>
      </div>
    </section>
  );
}
