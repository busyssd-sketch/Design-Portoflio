"use client";

import { useTheme } from "./theme-provider";
import { useEffect, useState } from "react";
import { useSiteContent } from "@/lib/content";

function useLocalTime(timezone: string) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      try {
        const now = new Date();
        const local = new Date(
          now.toLocaleString("en-US", { timeZone: timezone })
        );
        const hh = String(local.getHours()).padStart(2, "0");
        const mm = String(local.getMinutes()).padStart(2, "0");
        setTime(`${hh}:${mm}`);
      } catch {
        // Invalid timezone — leave time blank
      }
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [timezone]);
  return time;
}

type WeatherState = {
  temp: number | null;
  isNight: boolean;
};

function useLiveWeather(lat: number, lng: number, timezone: string) {
  const [state, setState] = useState<WeatherState>({
    temp: null,
    isNight: false,
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,is_day&timezone=${encodeURIComponent(timezone)}`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const json = await res.json();
        const temp = Math.round(json?.current?.temperature_2m);
        const isDay = Boolean(json?.current?.is_day);
        if (!cancelled && Number.isFinite(temp)) {
          setState({ temp, isNight: !isDay });
        }
      } catch {
        /* offline / blocked — silently keep last state */
      }
    };
    load();
    const id = setInterval(load, 10 * 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [lat, lng, timezone]);

  return state;
}

function StatusWidget() {
  const site = useSiteContent().site;
  const time = useLocalTime(site.timezone);
  const { temp, isNight } = useLiveWeather(
    site.location_lat,
    site.location_lng,
    site.timezone
  );

  return (
    <div className="group relative">
      <div
        tabIndex={0}
        role="status"
        aria-label={`Live from ${site.location_city}, ${site.location_country}`}
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        <span className="font-medium tabular-nums text-ink">
          {time || "--:--"}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted">
          {site.location_label}
        </span>
        <span className="h-3 w-px bg-border" />
        {isNight ? <MoonGlyph /> : <SunGlyph />}
        <span className="h-3 w-px bg-border" />
        <span className="tabular-nums text-ink">
          {temp !== null ? `${temp}°` : "—°"}
        </span>
      </div>

      {/* Tooltip — shows on hover and keyboard focus */}
      <div
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-ink px-3 py-1.5 text-[12px] font-medium text-bg opacity-0 shadow-soft transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <span className="mr-1.5 inline-block h-1.5 w-1.5 -translate-y-[1px] animate-pulse rounded-full bg-emerald-400 align-middle" />
        Live from {site.location_city}, {site.location_country}.
        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-border bg-ink" />
      </div>
    </div>
  );
}

function SunGlyph({ active = false }: { active?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className={`transition-colors duration-200 ${
        active ? "text-ink" : "text-muted"
      }`}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.75}
      />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.75}
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonGlyph({ active = false }: { active?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      className={`transition-colors duration-200 ${
        active ? "text-ink" : "text-muted"
      }`}
      aria-hidden="true"
    >
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TopNav() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto grid h-[60px] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-8">
        <div />
        <div className="flex justify-center">
          <StatusWidget />
        </div>
        <div className="flex items-center justify-end gap-2 text-muted">
          <SunGlyph active={!isDark} />
          <button
            type="button"
            role="switch"
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-checked={isDark}
            className={`ios-switch ${isDark ? "ios-switch--on" : ""}`}
          >
            <span className="ios-switch__knob" />
          </button>
          <MoonGlyph active={isDark} />
        </div>
      </div>
    </header>
  );
}
