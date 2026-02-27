"use client";

import { useMemo, useState } from "react";

export interface MatchMapItem {
  number: number;
  state: "completed" | "inProgress" | "unstarted";
  winner: "team1" | "team2" | null;
}

type Props = {
  team1Name: string;
  team2Name: string;
  score1?: number;
  score2?: number;
  bestOf: number;
  maps: MatchMapItem[];
};

type TabKey = "overview" | "performance" | "economy" | "logs";

const TABS: Array<{ key: TabKey; label: string; disabled?: boolean }> = [
  { key: "overview", label: "Overview" },
  { key: "performance", label: "Performance", disabled: true },
  { key: "economy", label: "Economy", disabled: true },
  { key: "logs", label: "Logs (Soon)", disabled: true },
];

function mapStatusLabel(state: MatchMapItem["state"]) {
  if (state === "completed") return "Final";
  if (state === "inProgress") return "Live";
  return "TBD";
}

function mapWinnerLabel(map: MatchMapItem, team1Name: string, team2Name: string) {
  if (map.winner === "team1") return team1Name;
  if (map.winner === "team2") return team2Name;
  return "TBD";
}

export default function MatchMapsPanel({
  team1Name,
  team2Name,
  score1,
  score2,
  bestOf,
  maps,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [selectedMap, setSelectedMap] = useState<number | "all">("all");

  const mapSlots = useMemo(() => {
    return Array.from({ length: bestOf }, (_, index) => {
      const mapNumber = index + 1;
      const found = maps.find((map) => map.number === mapNumber);
      return found ?? { number: mapNumber, state: "unstarted" as const, winner: null };
    });
  }, [bestOf, maps]);

  const selectedMapData =
    selectedMap === "all"
      ? null
      : mapSlots.find((map) => map.number === selectedMap) ?? null;

  return (
    <section className="max-w-[1320px] mx-auto px-6 py-6">
      <div className="border border-ink-mid bg-ink">
        <div className="px-4 py-3 border-b border-ink-mid">
          <span className="section-label">Maps/Stats</span>
        </div>

        <div className="grid grid-cols-4 border-b border-ink-mid">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                disabled={tab.disabled}
                onClick={() => !tab.disabled && setActiveTab(tab.key)}
                className={`h-11 font-cond text-sm tracking-wide transition-colors border-r border-ink-mid last:border-r-0 ${
                  isActive
                    ? "text-text-primary bg-ink-light font-semibold"
                    : "text-text-muted hover:text-text-secondary"
                } ${tab.disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "overview" ? (
          <>
            <div className="px-3 py-3 border-b border-ink-mid flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedMap("all")}
                className={`px-4 h-10 font-cond text-sm rounded-sm border ${
                  selectedMap === "all"
                    ? "bg-ink-light text-text-primary border-ink-mid"
                    : "bg-void text-text-muted border-ink-mid hover:text-text-secondary"
                }`}
              >
                All Maps
              </button>

              {mapSlots.map((map) => (
                <button
                  key={map.number}
                  type="button"
                  onClick={() => setSelectedMap(map.number)}
                  className={`px-4 h-10 font-cond text-sm rounded-sm border ${
                    selectedMap === map.number
                      ? "bg-ink-light text-text-primary border-ink-mid"
                      : "bg-void text-text-muted border-ink-mid hover:text-text-secondary"
                  }`}
                >
                  {map.number} {mapStatusLabel(map.state)}
                </button>
              ))}
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between border-b border-ink-mid pb-3 mb-3">
                <div className="font-display text-2xl text-text-primary tabular-nums">{score1 ?? 0}</div>
                <div className="text-center">
                  <div className="font-cond text-lg tracking-wide uppercase text-text-secondary">
                    {selectedMap === "all" ? "All Maps" : `Map ${selectedMap}`}
                  </div>
                  <div className="font-cond text-xs tracking-widest uppercase text-text-muted">
                    {selectedMapData ? mapStatusLabel(selectedMapData.state) : "Overview"}
                  </div>
                </div>
                <div className="font-display text-2xl text-text-primary tabular-nums">{score2 ?? 0}</div>
              </div>

              {selectedMap === "all" ? (
                <div className="space-y-2">
                  {mapSlots.map((map) => (
                    <div
                      key={map.number}
                      className="flex items-center justify-between rounded-sm border border-ink-mid bg-void px-3 py-2"
                    >
                      <span className="font-cond text-xs tracking-widest uppercase text-text-muted">
                        Map {map.number}
                      </span>
                      <span className="font-body text-sm text-text-secondary">
                        {mapWinnerLabel(map, team1Name, team2Name)}
                      </span>
                      <span
                        className={`font-cond text-xs tracking-widest uppercase ${
                          map.state === "inProgress"
                            ? "text-crimson"
                            : map.state === "completed"
                              ? "text-emerald"
                              : "text-text-muted"
                        }`}
                      >
                        {mapStatusLabel(map.state)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-sm border border-ink-mid bg-void px-4 py-4">
                  <div className="font-cond text-xs tracking-widest uppercase text-text-muted mb-2">
                    Map {selectedMapData?.number ?? selectedMap}
                  </div>
                  <div className="font-body text-sm text-text-secondary">
                    Winner: {selectedMapData ? mapWinnerLabel(selectedMapData, team1Name, team2Name) : "TBD"}
                  </div>
                  <div className="font-body text-sm text-text-secondary mt-1">
                    Status: {selectedMapData ? mapStatusLabel(selectedMapData.state) : "TBD"}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-8 text-center font-cond text-xs tracking-widest uppercase text-text-faint">
            This tab will be available soon
          </div>
        )}
      </div>
    </section>
  );
}
