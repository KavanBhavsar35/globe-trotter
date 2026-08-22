"use client";

import Link from "next/link";
import { ArrowRight, Compass, Plane } from "lucide-react";
import { getEmail } from "@/lib/api";
import { useTrips } from "@/lib/use-trips";
import { useEffect, useState } from "react";
import { CreateTripDialog } from "@/components/create-trip-dialog";
import { TripCard } from "@/components/trip-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { trips, loading, reload } = useTrips();
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => setEmail(getEmail()), []);

  const name = email?.split("@")[0];
  const recent = trips.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-chart-2 p-8 text-primary-foreground md:p-10">
        <Plane className="absolute -top-4 -right-4 size-40 rotate-12 opacity-15" />
        <div className="relative space-y-4">
          <p className="text-sm font-medium uppercase tracking-widest opacity-80">
            {name ? `Welcome back, ${name}` : "Welcome"}
          </p>
          <h1 className="max-w-xl text-3xl font-bold md:text-4xl">
            Where to next?
          </h1>
          <p className="max-w-md text-sm opacity-90 md:text-base">
            Build a multi-city itinerary, add activities, and watch your budget add up.
          </p>
          <CreateTripDialog
            onCreated={reload}
            trigger={
              <Button size="lg" variant="secondary" className="mt-2">
                <Plane /> Plan a trip
              </Button>
            }
          />
        </div>
      </section>

      {/* Recent trips */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent trips</h2>
          {trips.length > 3 && (
            <Link
              href="/trips"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all {trips.length} <ArrowRight className="size-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState onCreated={reload} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((t) => (
              <TripCard key={t.id} trip={t} onDeleted={reload} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState({ onCreated }: { onCreated: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-12 text-center">
      <div className="rounded-full bg-muted p-4">
        <Compass className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">No trips yet</p>
        <p className="text-sm text-muted-foreground">Plan your first trip to get started.</p>
      </div>
      <CreateTripDialog onCreated={onCreated} />
    </div>
  );
}
