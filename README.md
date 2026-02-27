# RiftGG — LoL Esports Hub

> VLR.gg-style League of Legends esports tracker, built with Next.js 15, TypeScript, and Tailwind CSS.

## Stack

- **Next.js 15** (App Router)
- **TypeScript** — strict mode
- **Tailwind CSS v3** — custom hextech theme
- **LoL Esports API** — unofficial, powers lolesports.com itself

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.local.example .env.local

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Integration

This project uses the **unofficial LoL Esports API** (`esports-api.lolesports.com`).
It's the same API that powers the official lolesports.com website.

> ⚠️ This is NOT an official public API. Riot can change or remove endpoints
> without notice. It's been stable for years, but plan accordingly.

### Route Handlers (server-side proxy)

The API key is **never sent to the browser**. All calls go through Next.js Route Handlers:

| Route | Description | Cache |
|-------|-------------|-------|
| `GET /api/leagues` | All leagues with flags + colors | 1 hour |
| `GET /api/schedule` | Upcoming + completed matches | 1 min |
| `GET /api/schedule?leagueId=x,y` | Filter by league IDs | 1 min |
| `GET /api/live` | Currently live matches | 30 sec |
| `GET /api/standings?tournamentId=x` | Standings for a tournament | 5 min |

### Finding League IDs

You can find league IDs from the leagues endpoint:

```bash
curl http://localhost:3000/api/leagues | jq '.leagues[] | {name, id, slug}'
```

Common IDs:
| League | ID |
|--------|----|
| LCK | `98767991299243165` |
| LCS | `98767991299243165` |
| LEC | `98767991302996019` |
| LPL | `98767991314006698` |
| CBLOL | `98767991332355509` |

---

## Project Structure

```
riftgg/
├── app/
│   ├── api/
│   │   ├── leagues/route.ts      # GET /api/leagues
│   │   ├── schedule/route.ts     # GET /api/schedule
│   │   ├── live/route.ts         # GET /api/live
│   │   └── standings/route.ts   # GET /api/standings
│   ├── layout.tsx
│   ├── page.tsx                  # Homepage
│   └── globals.css
├── components/
│   ├── Navbar.tsx
│   ├── LeftSidebar.tsx           # Threads + community
│   ├── HeroSection.tsx           # Featured article
│   ├── NewsFeed.tsx              # News list (static for now)
│   └── RightSidebar.tsx         # Live matches + events (REAL DATA)
├── hooks/
│   └── useSchedule.ts            # Client hook with live polling
├── lib/
│   └── lolesports/
│       ├── client.ts             # Base fetch with API key
│       ├── endpoints.ts          # Typed endpoint functions
│       ├── transforms.ts         # Raw API → app types
│       ├── api-types.ts          # Raw API TypeScript types
│       └── index.ts              # Barrel export
├── data/
│   └── homepage.ts               # Static mock data (news, events)
├── types/
│   └── index.ts                  # Shared app types
└── tailwind.config.ts            # Custom hextech theme
```

---

## What's Real vs Static

| Section | Data Source |
|---------|-------------|
| Upcoming/Live Matches | ✅ Real API (`/api/schedule`) |
| Live match scores | ✅ Real API (polls every 30s) |
| News feed | 📝 Static mock data |
| Events sidebar | 📝 Static mock data |
| Left sidebar threads | 📝 Static mock data |

**Next steps** to make fully dynamic:
- Wire up a news source (Riot's blog RSS, community Reddit RSS, etc.)
- Fetch real tournament/event data from `/api/leagues` + `/api/standings`
- Add match detail pages using `getEventDetails` endpoint
