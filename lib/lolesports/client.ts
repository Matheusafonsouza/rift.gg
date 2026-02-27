/**
 * Base HTTP client for the unofficial LoL Esports API.
 * ⚠️  Only ever import this from server-side code (route handlers, server components).
 *     The API key must never reach the browser.
 */

const BASE_URL = "https://esports-api.lolesports.com/persisted/gw";

// The widely-known public key that powers lolesports.com itself.
// Store in .env.local as LOLESPORTS_API_KEY to override.
const API_KEY =
  process.env.LOLESPORTS_API_KEY ?? "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z";

const DEFAULT_LOCALE = "en-US";

// Cache settings (Next.js fetch cache)
const REVALIDATE_SCHEDULE = 60;       // 1 min  – schedule changes often
const REVALIDATE_LEAGUES  = 3600;     // 1 hour – league list is stable
const REVALIDATE_STANDINGS = 300;     // 5 min  – standings update after matches

export type FetchOptions = {
  revalidate?: number | false;
  tags?: string[];
};

/**
 * Low-level fetch with the API key header baked in.
 */
export async function lolesportsFetch<T>(
  endpoint: string,
  params: Record<string, string | string[]>,
  options: FetchOptions = {}
): Promise<T> {
  // Build query string – params can be array values for repeated keys
  const qs = new URLSearchParams();
  qs.set("hl", DEFAULT_LOCALE);
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((v) => qs.append(key, v));
    } else {
      qs.set(key, value);
    }
  }

  const url = `${BASE_URL}/${endpoint}?${qs.toString()}`;

  const res = await fetch(url, {
    headers: {
      "x-api-key": API_KEY,
      "Accept": "application/json",
    },
    next: {
      revalidate: options.revalidate ?? REVALIDATE_SCHEDULE,
      tags: options.tags,
    },
  });

  if (!res.ok) {
    throw new LoLApiError(
      `lolesports API error: ${res.status} ${res.statusText} — ${endpoint}`,
      res.status
    );
  }

  return res.json() as Promise<T>;
}

export class LoLApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "LoLApiError";
  }
}

// Re-export cache constants so callers can use them
export { REVALIDATE_SCHEDULE, REVALIDATE_LEAGUES, REVALIDATE_STANDINGS };
