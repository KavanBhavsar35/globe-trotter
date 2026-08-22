"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, Globe, MapPin } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Itinerary } from "@/lib/types";
import { fmtRange } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ItineraryDetail } from "@/components/itinerary-detail";

type State =
  | { status: "loading" }
  | { status: "ok"; it: Itinerary }
  | { status: "missing" };

export default function PublicTripPage() {
  const params = useParams();
  const token = String(params.token);
  const [state, setState] = React.useState<State>({ status: "loading" });

  React.useEffect(() => {
    (async () => {
      try {
        const it = await apiFetch<Itinerary>(`/public/${token}`, { auth: false });
        setState({ status: "ok", it });
      } catch {
        setState({ status: "missing" });
      }
    })();
  }, [token]);

  return (
    <div className="flex min-h-svh flex-col">
      {/* Public header (no auth nav) */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 p-4">
          <Link href="/" className="inline-flex items-center gap-2 font-heading font-bold">
            <Globe className="size-5 text-primary" />
            GlobeTrotter
          </Link>
          <Button variant="outline" size="sm" render={<Link href="/login" />}>
            Plan your own trip
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 p-4 md:p-6">
        {state.status === "loading" && (
          <div className="space-y-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        )}

        {state.status === "missing" && (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-lg font-semibold">Itinerary not found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This link is invalid or the trip is no longer shared.
            </p>
            <Button className="mt-4" render={<Link href="/login" />}>
              Go to GlobeTrotter
            </Button>
          </div>
        )}

        {state.status === "ok" && (
          <>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                Shared itinerary
              </p>
              <h1 className="text-2xl font-bold">{state.it.trip.name}</h1>
              {state.it.trip.description && (
                <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                  {state.it.trip.description}
                </p>
              )}
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" />
                  {fmtRange(state.it.trip.start_date, state.it.trip.end_date)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {state.it.stops.length}{" "}
                  {state.it.stops.length === 1 ? "stop" : "stops"}
                </span>
              </p>
            </div>

            <ItineraryDetail it={state.it} />
          </>
        )}
      </main>
    </div>
  );
}
