"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, SquarePen } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type { Itinerary } from "@/lib/types";
import { fmtRange } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ItineraryDetail } from "@/components/itinerary-detail";
import { ShareDialog } from "@/components/share-dialog";

export default function TripViewPage() {
  const params = useParams();
  const tripId = Number(params.id);
  const [it, setIt] = React.useState<Itinerary | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        setIt(await apiFetch<Itinerary>(`/trips/${tripId}/itinerary`));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not load trip.");
      } finally {
        setLoading(false);
      }
    })();
  }, [tripId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }
  if (!it) return null;

  const { trip, stops } = it;

  return (
    <div className="space-y-6">
      <Link
        href="/trips"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All trips
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{trip.name}</h1>
          {trip.description && (
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              {trip.description}
            </p>
          )}
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {fmtRange(trip.start_date, trip.end_date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" />
              {stops.length} {stops.length === 1 ? "stop" : "stops"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShareDialog tripId={tripId} />
          <Button render={<Link href={`/trips/${tripId}/build`} />}>
            <SquarePen /> Edit itinerary
          </Button>
        </div>
      </div>

      <ItineraryDetail it={it} />
    </div>
  );
}
