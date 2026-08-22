"use client";

import { useMemo, useState } from "react";
import { Search, Plane, Compass } from "lucide-react";
import { useTrips } from "@/lib/use-trips";
import { CreateTripDialog } from "@/components/create-trip-dialog";
import { TripCard } from "@/components/trip-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function TripsPage() {
  const { trips, loading, reload } = useTrips();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return trips;
    return trips.filter(
      (t) =>
        t.name.toLowerCase().includes(s) ||
        (t.description ?? "").toLowerCase().includes(s),
    );
  }, [trips, q]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold md:text-4xl">Your journeys</h1>
          <p className="text-muted-foreground">
            {trips.length === 0 
              ? "Start planning your first adventure" 
              : `${trips.length} ${trips.length === 1 ? "trip" : "trips"} in the works`}
          </p>
        </div>
        <CreateTripDialog 
          onCreated={reload}
          trigger={
            <Button size="lg">
              <Plane className="size-5" />
              New trip
            </Button>
          }
        />
      </div>

      {/* Search */}
      {trips.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or description…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      )}

      {/* Trip Grid */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-6 rounded-2xl border-2 border-dashed bg-muted/30 p-16 text-center">
          <div className="rounded-2xl bg-primary/10 p-6">
            <Compass className="size-12 text-primary" />
          </div>
          <div className="space-y-2 max-w-sm">
            <p className="text-lg font-semibold">
              {trips.length === 0 ? "No trips yet" : "No matches"}
            </p>
            <p className="text-sm text-muted-foreground">
              {trips.length === 0 
                ? "Create your first trip to start building your perfect itinerary" 
                : "Try adjusting your search or create a new trip"}
            </p>
          </div>
          {trips.length === 0 && (
            <CreateTripDialog 
              onCreated={reload}
              trigger={
                <Button size="lg">
                  <Plane className="size-5" />
                  Plan your first trip
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TripCard key={t.id} trip={t} onDeleted={reload} />
          ))}
        </div>
      )}
    </div>
  );
}
