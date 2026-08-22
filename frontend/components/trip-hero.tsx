"use client";

import * as React from "react";
import { Calendar, MapPin } from "lucide-react";
import type { Trip } from "@/lib/types";
import { fmtRange } from "@/lib/format";

/**
 * Editorial trip hero - image-first with dramatic scrim overlay
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
  if (trip.cover_url) {
    return (
      <div className="relative -mx-4 overflow-hidden md:-mx-6 lg:mx-0 lg:rounded-2xl">
        {/* Cover Image */}
        {/* eslint-disable-next-line @next/next/no-img-element -- presigned URL expires; next/image would cache a stale link */}
        <img 
          src={trip.cover_url} 
          alt="" 
          className="aspect-travel-wide w-full object-cover md:aspect-[21/8]" 
        />
        
        {/* Gradient Scrim */}
        <div className="image-scrim absolute inset-0" />
        
        {/* Actions */}
        {actions && (
          <div className="absolute right-4 top-4 flex items-center gap-2 md:right-6 md:top-6">
            {actions}
          </div>
        )}
        
        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 space-y-3 p-6 text-white md:p-8 lg:p-10">
          {eyebrow && (
            <p className="label-caps text-white/90">{eyebrow}</p>
          )}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold drop-shadow-md md:text-4xl lg:text-5xl">
              {trip.name}
            </h1>
            {trip.description && (
              <p className="max-w-2xl text-base text-white/95 md:text-lg">
                {trip.description}
              </p>
            )}
          </div>
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/90 md:gap-6">
            <span className="inline-flex items-center gap-2">
              <Calendar className="size-4" />
              {fmtRange(trip.start_date, trip.end_date)}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4" />
              {stopCount} {stopCount === 1 ? "destination" : "destinations"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Without cover - clean header layout
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3 max-w-3xl">
          {eyebrow && (
            <p className="label-caps text-primary">{eyebrow}</p>
          )}
          <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">{trip.name}</h1>
          {trip.description && (
            <p className="text-lg text-muted-foreground">
              {trip.description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      
      {/* Metadata bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card/50 px-5 py-3 text-sm md:gap-6">
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Calendar className="size-4 text-primary" />
          <span className="font-medium text-foreground">{fmtRange(trip.start_date, trip.end_date)}</span>
        </span>
        <div className="h-4 w-px bg-border" />
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4 text-seafoam" />
          <span className="font-medium text-foreground">
            {stopCount} {stopCount === 1 ? "destination" : "destinations"}
          </span>
        </span>
      </div>
    </div>
  );
}
