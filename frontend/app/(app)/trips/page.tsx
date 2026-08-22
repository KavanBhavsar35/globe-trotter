"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useTrips } from "@/lib/use-trips";
import { CreateTripDialog } from "@/components/create-trip-dialog";
import { TripCard } from "@/components/trip-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Trips</h1>
          <p className="text-sm text-muted-foreground">
            {trips.length} {trips.length === 1 ? "trip" : "trips"} planned
          </p>
        </div>
        <CreateTripDialog onCreated={reload} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search trips…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          {trips.length === 0 ? "No trips yet — plan your first one." : "No trips match your search."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TripCard key={t.id} trip={t} onDeleted={reload} />
          ))}
        </div>
      )}
    </div>
  );
}
