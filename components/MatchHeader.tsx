"use client";

import { useState, useEffect } from "react";
import { leagueColor as resolveLeagueColor } from "@/lib/lolesports/transforms";

export interface MatchTeam {
  name: string;
  shortName: string;
  image?: string;
  regionFlag: string;
  wins: number;
  losses: number;
  color: string;
}

export interface GameResult {
  number: number;
  winner: "team1" | "team2" | null;
  state: "completed" | "inProgress" | "unstarted";
}

export interface MatchHeaderData {
  team1: MatchTeam;
  team2: MatchTeam;
  score1?: number;
  score2?: number;
  games?: GameResult[];
  eventName: string;
  stage: string;
  date: string; // ISO string
  format: "Bo1" | "Bo2" | "Bo3" | "Bo5";
  league: string;
  status: "upcoming" | "live" | "completed";
}

// ── Countdown hook ─────────────────────────────────────────────────────────────
// Returns null until the client calculates the first value, avoiding a flash
// of 00:00:00 on hydration.
type TimeLeft = { d: number; h: number; m: number; s: number; expired: boolean };

function useCountdown(targetDate: string): TimeLeft | null {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    function calc() {
      const targetMs = new Date(targetDate).getTime();
      if (!Number.isFinite(targetMs)) {
        setTimeLeft(null);
        return;
      }

      const diff = targetMs - Date.now();
      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0, expired: true });
        return;
      }
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setTimeLeft({ d, h, m, s, expired: false });
    }
    calc();
    const id = setInterval(calc, 1_000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

// ── Team logo inside hex ───────────────────────────────────────────────────────
function TeamHex({ team, size = 80 }: { team: MatchTeam; size?: number }) {
  const [imgFailed, setImgFailed] = useState(false);
  const r = size / 2;
  const outerPts = hexPoints(r - 2, r, r).map((p) => `${p[0]},${p[1]}`).join(" ");
  const innerPts = hexPoints(r - 10, r, r).map((p) => `${p[0]},${p[1]}`).join(" ");
  const showImage = !!team.image && !imgFailed;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="absolute inset-0">
        <polygon points={outerPts} fill={team.color} fillOpacity="0.08" stroke={team.color} strokeWidth="1.5" strokeOpacity="0.5" />
        <polygon points={innerPts} fill={team.color} fillOpacity={showImage ? "0.05" : "0.15"} />
        {!showImage && (
          <text
            x={r} y={r}
            textAnchor="middle" dominantBaseline="central"
            fontSize={size * 0.26} fontWeight="700"
            fontFamily="var(--font-barlow-condensed), system-ui, sans-serif"
            fill={team.color} letterSpacing="1"
          >
            {team.shortName.slice(0, 3).toUpperCase()}
          </text>
        )}
      </svg>
      {showImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={team.image}
          alt={team.name}
          onError={() => setImgFailed(true)}
          style={{
            position: "absolute",
            top: "14%", left: "14%",
            width: "72%", height: "72%",
            objectFit: "contain",
          }}
        />
      )}
    </div>
  );
}

function hexPoints(r: number, cx: number, cy: number): [number, number][] {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as [number, number];
  });
}

// ── Game dots ──────────────────────────────────────────────────────────────────
function GameDots({ games, format, team1Color, team2Color }: {
  games: GameResult[];
  format: MatchHeaderData["format"];
  team1Color: string;
  team2Color: string;
}) {
  const total = parseInt(format.replace("Bo", ""), 10);
  const slots = Array.from({ length: total }, (_, i) => games[i] ?? null);

  return (
    <div className="flex items-center gap-2">
      {slots.map((game, i) => {
        if (!game || game.state === "unstarted") {
          return (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full border border-ink-mid"
              style={{ backgroundColor: "transparent" }}
            />
          );
        }
        if (game.state === "inProgress") {
          return <span key={i} className="live-dot w-2.5 h-2.5" />;
        }
        // completed
        const color = game.winner === "team1" ? team1Color : game.winner === "team2" ? team2Color : "#2A3545";
        return (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}66` }}
            title={`Game ${game.number}: ${game.winner === "team1" ? "Team 1" : "Team 2"} wins`}
          />
        );
      })}
    </div>
  );
}

// ── Format date ────────────────────────────────────────────────────────────────
function formatMatchDate(iso: string) {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return null;

  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
    month:   d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day:     d.getDate(),
    time:    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
  };
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function MatchHeader({ data }: { data: MatchHeaderData }) {
  const timeLeft = useCountdown(data.date);
  const dt = formatMatchDate(data.date);
  const leagueColor = resolveLeagueColor(data.league);
  const isLive = data.status === "live";
  const isCompleted = data.status === "completed";
  const isUpcoming = data.status === "upcoming";
  const showCountdown = isUpcoming && timeLeft !== null && !timeLeft.expired;

  return (
    <div className="relative w-full overflow-hidden">
      {/* ── Backgrounds ── */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 pointer-events-none"
        style={{ background: `linear-gradient(to right, ${data.team1.color}14 0%, transparent 100%)` }}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/2 pointer-events-none"
        style={{ background: `linear-gradient(to left, ${data.team2.color}14 0%, transparent 100%)` }}
      />
      <div className="absolute inset-0 bg-hex-pattern opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-ink-mid" />

      {/* ── Content ── */}
      <div className="relative max-w-[1320px] mx-auto px-6 py-10 flex items-center justify-between gap-4">

        {/* Team 1 */}
        <TeamBlock team={data.team1} align="left" />

        {/* Center */}
        <div className="flex flex-col items-center gap-3 flex-1 min-w-0 max-w-xs">

          {/* Event badge */}
          <div className="flex flex-col items-center gap-1">
            <span
              className="font-cond text-[10px] tracking-[0.18em] uppercase font-semibold px-2.5 py-0.5 rounded-sm"
              style={{ color: leagueColor, background: `${leagueColor}18`, border: `1px solid ${leagueColor}30` }}
            >
              {data.league.toUpperCase()}
            </span>
            <span className="font-display text-xs tracking-wide text-text-secondary text-center leading-snug">
              {data.eventName}
            </span>
            <span className="font-cond text-[10px] tracking-widest uppercase text-text-muted">
              {data.stage}
            </span>
          </div>

          <div className="w-full h-px bg-ink-mid" />

          {/* ── Live ── */}
          {isLive && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-4">
                <ScoreDisplay score={data.score1} color={data.team1.color} />
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="live-dot w-3 h-3" />
                    <span className="font-cond text-sm tracking-widest uppercase text-crimson font-bold">Live</span>
                  </div>
                  <span className="font-cond text-[10px] text-text-muted tracking-wider uppercase">{data.format}</span>
                </div>
                <ScoreDisplay score={data.score2} color={data.team2.color} />
              </div>
              {data.games && data.games.length > 0 && (
                <GameDots
                  games={data.games}
                  format={data.format}
                  team1Color={data.team1.color}
                  team2Color={data.team2.color}
                />
              )}
            </div>
          )}

          {/* ── Completed ── */}
          {isCompleted && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-4">
                <ScoreDisplay score={data.score1} color={data.team1.color} win={(data.score1 ?? 0) > (data.score2 ?? 0)} />
                <div className="flex flex-col items-center gap-1">
                  <span className="font-cond text-[10px] tracking-widest uppercase text-text-muted font-semibold">Final</span>
                  <span className="font-cond text-[10px] text-text-muted tracking-wider uppercase">{data.format}</span>
                </div>
                <ScoreDisplay score={data.score2} color={data.team2.color} win={(data.score2 ?? 0) > (data.score1 ?? 0)} />
              </div>
              {data.games && data.games.length > 0 && (
                <GameDots
                  games={data.games}
                  format={data.format}
                  team1Color={data.team1.color}
                  team2Color={data.team2.color}
                />
              )}
            </div>
          )}

          {/* ── Upcoming ── */}
          {isUpcoming && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-4">
                <ScoreDisplay score={data.score1} color={data.team1.color} />
                <div className="flex flex-col items-center gap-1">
                  <span className="font-display text-xl font-bold text-text-muted/60 tracking-widest">VS</span>
                  <span className="font-cond text-[10px] text-text-muted tracking-wider uppercase">{data.format}</span>
                </div>
                <ScoreDisplay score={data.score2} color={data.team2.color} />
              </div>
            </div>
          )}

          {/* Date / time */}
          <div className="flex items-center gap-2 font-cond text-[11px] text-text-secondary tracking-wide">
            {dt ? (
              <>
                <span className="text-text-muted">{dt.weekday}</span>
                <span className="text-text-faint">·</span>
                <span>{dt.month} {dt.day}</span>
                <span className="text-text-faint">·</span>
                <span className="text-text-primary font-semibold tabular-nums">{dt.time}</span>
              </>
            ) : (
              <span className="text-text-muted font-semibold tracking-wider uppercase">TBD</span>
            )}
          </div>

          {/* Countdown — only when upcoming and client has calculated the value */}
          {showCountdown && (
            <div className="flex items-center gap-1.5">
              <CountdownUnit value={timeLeft.d} label="d" />
              <span className="font-mono text-base text-text-faint mb-0.5">:</span>
              <CountdownUnit value={timeLeft.h} label="h" />
              <span className="font-mono text-base text-text-faint mb-0.5">:</span>
              <CountdownUnit value={timeLeft.m} label="m" />
              <span className="font-mono text-base text-text-faint mb-0.5">:</span>
              <CountdownUnit value={timeLeft.s} label="s" />
            </div>
          )}
        </div>

        {/* Team 2 */}
        <TeamBlock team={data.team2} align="right" />
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function TeamBlock({ team, align }: { team: MatchTeam; align: "left" | "right" }) {
  const isRight = align === "right";
  return (
    <div className={`flex items-center gap-5 ${isRight ? "flex-row-reverse" : "flex-row"}`}>
      <TeamHex team={team} size={88} />
      <div className={`flex flex-col gap-1 ${isRight ? "items-end" : "items-start"}`}>
        <span className="font-display text-2xl font-bold text-text-primary tracking-wide leading-none">
          {team.shortName}
        </span>
        <span className="font-body text-sm text-text-secondary leading-none">
          {team.name}
        </span>
        <div className={`flex items-center gap-1.5 mt-1 ${isRight ? "flex-row-reverse" : ""}`}>
          <span className="text-base leading-none">{team.regionFlag}</span>
          <span className="font-cond text-[10px] tracking-widest uppercase text-text-muted">
            {team.wins}W – {team.losses}L
          </span>
        </div>
      </div>
    </div>
  );
}

function ScoreDisplay({ score, color, win }: { score?: number; color: string; win?: boolean }) {
  return (
    <span
      className="font-display text-4xl font-bold tabular-nums leading-none"
      style={{
        color: win ? color : win === false ? "#2A3545" : color,
        textShadow: win ? `0 0 24px ${color}55` : undefined,
      }}
    >
      {score ?? 0}
    </span>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="font-mono text-xl font-bold text-text-primary tabular-nums leading-none"
        style={{ minWidth: "2ch", textAlign: "center" }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="font-cond text-[9px] tracking-widest uppercase text-text-muted">{label}</span>
    </div>
  );
}
