"use client";

import * as React from "react";
import { CalendarDays, MapPin } from "lucide-react";
import type { Trip } from "@/lib/types";
import { fmtRange } from "@/lib/format";

/**
 * Trip header. With a cover photo → full-bleed Notion-style hero (image + scrim,
 * title/meta over it). Without → plain header. Shared by owner view + public share page.
 */
export function TripHero({
  trip,
  stopCount,
  eyebrow,
  actions,
}: {
  trip: Trip;
  stopCount: number;
  eyebrow?: string;
  actions?: React.ReactNode;
}) {
  const meta = (
    <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="size-4" />
        {fmtRange(trip.start_date, trip.end_date)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <MapPin className="size-4" />
        {stopCount} {stopCount === 1 ? "stop" : "stops"}
      </span>
    </p>
  );

  if (trip.cover_url) {
    return (
      <div className="relative overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element -- presigned URL expires; next/image would cache a stale link */}
        <img src={trip.cover_url} alt="" className="h-56 w-full object-cover md:h-72" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        {actions && <div className="absolute right-4 top-4 flex items-center gap-2">{actions}</div>}
        <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-6">
          {eyebrow && (
            <p className="text-xs font-medium uppercase tracking-wide text-white/80">{eyebrow}</p>
          )}
          <h1 className="text-2xl font-bold drop-shadow-sm md:text-3xl">{trip.name}</h1>
          {trip.description && (
            <p className="mt-1 max-w-prose text-sm text-white/90">{trip.description}</p>
          )}
          <div className="text-white/90">{meta}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-wide text-primary">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-bold">{trip.name}</h1>
        {trip.description && (
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">{trip.description}</p>
        )}
        <div className="text-muted-foreground">{meta}</div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
