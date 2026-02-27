import type { NewsGroup, LeagueKey } from "@/types";
import { LEAGUE_COLORS } from "@/types";
import { NEWS_GROUPS } from "@/data/homepage";

function LeagueTag({ league }: { league: LeagueKey }) {
  const color = LEAGUE_COLORS[league];
  return (
    <span
      className="font-cond text-[9px] font-bold tracking-[0.15em] uppercase px-1.5 py-0.5 rounded-sm shrink-0"
      style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
    >
      {league}
    </span>
  );
}

function DateDivider({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 mt-1">
      <span className="font-cond text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted">
        {date}
      </span>
      <div className="flex-1 h-px bg-ink-mid" />
    </div>
  );
}

function NewsRow({ item }: { item: NewsGroup["items"][number] }) {
  return (
    <div className="hover-row group cursor-pointer">
      {/* Flag */}
      <span className="text-base shrink-0">{item.flag}</span>

      {/* League badge */}
      {item.league && (
        <LeagueTag league={item.league as LeagueKey} />
      )}

      {/* Breaking indicator */}
      {item.isBreaking && (
        <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse shrink-0" />
      )}

      {/* Title */}
      <span
        className="
          font-body text-sm text-text-secondary group-hover:text-text-primary
          flex-1 leading-snug transition-colors duration-150
        "
      >
        {item.title}
      </span>

      {/* Comment count */}
      <span
        className="
          font-cond text-xs tabular-nums text-text-muted shrink-0
          group-hover:text-gold/70 transition-colors duration-150 min-w-[28px] text-right
        "
      >
        {item.comments}
      </span>
    </div>
  );
}

export default function NewsFeed() {
  return (
    <div className="pb-8">
      {NEWS_GROUPS.map((group) => (
        <div key={group.date}>
          <DateDivider date={group.date} />
          {group.items.map((item) => (
            <NewsRow key={item.id} item={item} />
          ))}
        </div>
      ))}

      {/* Load more */}
      <div className="px-3 pt-4">
        <button
          className="
            w-full py-2.5 font-cond text-xs font-semibold tracking-widest uppercase
            text-text-muted border border-ink-mid rounded-sm
            hover:border-gold/30 hover:text-gold/70
            transition-all duration-200
          "
        >
          Load older news
        </button>
      </div>
    </div>
  );
}
