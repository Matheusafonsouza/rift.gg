"use client";

import { useState, useEffect, useCallback } from "react";
import type { AppMatch } from "@/lib/lolesports/transforms";

interface ScheduleData {
  upcoming: AppMatch[];
  completed: AppMatch[];
  live: AppMatch[];
  updatedAt?: string;
}

interface UseScheduleResult {
  data: ScheduleData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const POLL_INTERVAL_MS = 30_000; // Poll every 30s when there are live matches

export function useSchedule(leagueIds: string[] = []): UseScheduleResult {
  const [data, setData]       = useState<ScheduleData | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const qs = leagueIds.length
        ? `?leagueId=${leagueIds.join(",")}`
        : "";
      const res = await fetch(`/api/schedule${qs}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as ScheduleData;
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [leagueIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial fetch
  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Auto-poll while there are live matches
  useEffect(() => {
    if (!data?.live.length) return;
    const id = setInterval(() => void fetchData(), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [data?.live.length, fetchData]);

  return { data, isLoading, error, refresh: fetchData };
}

// Simpler hook just for the live indicator in the nav
export function useLiveCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/live");
        const json = await res.json() as { count: number };
        setCount(json.count ?? 0);
      } catch { /* silent */ }
    };

    void poll();
    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, []);

  return count;
}
