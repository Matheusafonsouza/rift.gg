"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Forums",   href: "/forums"   },
  { label: "Matches",  href: "/matches"  },
  { label: "Events",   href: "/events"   },
  { label: "Rankings", href: "/rankings" },
  { label: "Stats",    href: "/stats"    },
  { label: "Champions",href: "/champions"},
];

// Hextech hexagon logo mark
function HexLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <polygon
        points="15,2 27,8.5 27,21.5 15,28 3,21.5 3,8.5"
        fill="#C89B3C"
        fillOpacity="0.12"
        stroke="#C89B3C"
        strokeWidth="1.5"
      />
      <polygon
        points="15,7 22,11 22,19 15,23 8,19 8,11"
        fill="#C89B3C"
        fillOpacity="0.25"
      />
      <circle cx="15" cy="15" r="3.5" fill="#C89B3C" />
    </svg>
  );
}

export default function Navbar() {
  const [active, setActive] = useState("Forums");
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-50 h-[50px] bg-ink border-b border-ink-mid shadow-[0_2px_24px_rgba(0,0,0,0.5)]">
      <div className="max-w-[1320px] mx-auto h-full flex items-center gap-4 px-4">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <HexLogo />
          <div>
            <div className="font-display text-lg font-bold leading-none text-text-primary tracking-wide">
              RIFT<span className="text-gold">GG</span>
            </div>
            <div className="font-cond text-[9px] font-medium tracking-[0.2em] uppercase text-text-muted mt-0.5 leading-none">
              LoL Esports Hub
            </div>
          </div>
        </Link>

        {/* ── Search ── */}
        <div className="relative hidden sm:block">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search teams, players, events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              font-body text-xs bg-void border border-ink-mid
              text-text-primary placeholder:text-text-faint
              pl-8 pr-3 py-1.5 rounded-sm w-52
              focus:outline-none focus:border-gold/40
              transition-colors duration-200
            "
          />
        </div>

        {/* ── Nav links ── */}
        <nav className="flex h-full grow">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setActive(label)}
              className={`nav-item ${active === label ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Night mode toggle */}
          <div className="hidden md:flex items-center gap-1.5 font-cond text-[10px] tracking-widest uppercase">
            <span className="text-text-muted">🌙 Night</span>
            <span className="text-gold bg-gold/10 border border-gold/30 px-2 py-0.5 rounded-sm font-bold">
              ON
            </span>
          </div>

          {/* Spoilers toggle */}
          <div className="hidden md:flex items-center gap-1.5 font-cond text-[10px] tracking-widest uppercase">
            <span className="text-text-muted">! Spoilers</span>
            <span className="text-crimson bg-crimson/10 border border-crimson/30 px-2 py-0.5 rounded-sm font-bold">
              OFF
            </span>
          </div>

          {/* Login */}
          <button className="btn-gold">Log in</button>
        </div>

      </div>
    </header>
  );
}
