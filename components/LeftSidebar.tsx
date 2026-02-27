import type { ThreadItem } from "@/types";
import { STICKIED_THREADS, RECENT_THREADS } from "@/data/homepage";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-4 pb-2">
      <div className="section-label">{children}</div>
      <div className="mt-1.5 h-px bg-gradient-to-r from-gold/30 to-transparent" />
    </div>
  );
}

function ThreadRow({ item }: { item: ThreadItem }) {
  return (
    <div className="hover-row group">
      <span
        className="
          font-body text-xs text-text-secondary group-hover:text-text-primary
          flex-1 truncate transition-colors duration-150
        "
      >
        {item.isHot && (
          <span className="inline-block w-1 h-1 rounded-full bg-gold mr-1.5 mb-0.5 shrink-0" />
        )}
        {item.text}
      </span>
      <span
        className={`
          font-cond text-xs tabular-nums shrink-0
          ${item.isHot ? "text-gold/80 font-semibold" : "text-text-muted"}
        `}
      >
        {item.count}
      </span>
    </div>
  );
}

export default function LeftSidebar() {
  return (
    <aside className="bg-ink border-r border-ink-mid h-full overflow-y-auto">

      <SectionLabel>Stickied</SectionLabel>
      <div className="pb-1">
        {STICKIED_THREADS.map((t, i) => (
          <ThreadRow key={i} item={t} />
        ))}
      </div>

      <SectionLabel>Recent Discussion</SectionLabel>
      <div className="pb-4">
        {RECENT_THREADS.map((t, i) => (
          <ThreadRow key={i} item={t} />
        ))}
      </div>

      {/* Community stats blurb */}
      <div className="mx-3 mt-2 mb-4 p-3 rounded-sm bg-void border border-ink-mid">
        <p className="font-cond text-[10px] tracking-widest uppercase text-text-muted mb-1">
          Community
        </p>
        <div className="flex justify-between font-body text-xs">
          <div>
            <div className="text-text-primary font-semibold">24,811</div>
            <div className="text-text-muted text-[10px]">Members</div>
          </div>
          <div>
            <div className="text-text-primary font-semibold">1,042</div>
            <div className="text-text-muted text-[10px]">Online now</div>
          </div>
          <div>
            <div className="text-electric font-semibold">247</div>
            <div className="text-text-muted text-[10px]">Active</div>
          </div>
        </div>
      </div>

    </aside>
  );
}
