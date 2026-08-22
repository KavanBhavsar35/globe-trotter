"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, Compass, Plane, Wallet, MapPin, Luggage } from "lucide-react";
import { apiFetch, getEmail } from "@/lib/api";
import { useTrips } from "@/lib/use-trips";
import { money, imageOr } from "@/lib/format";
import type { City } from "@/lib/types";
import { CreateTripDialog } from "@/components/create-trip-dialog";
import { TripCard } from "@/components/trip-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { trips, loading, reload } = useTrips();
  const [email, setEmail] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  useEffect(() => setEmail(getEmail()), []);
  useEffect(() => {
    apiFetch<City[]>("/cities").then(setCities).catch(() => {});
  }, []);

  const name = email?.split("@")[0];
  const recent = trips.slice(0, 3);
  const recommended = cities.slice(0, 6);

  // Budget highlights across all trips (budget_total = naive heuristic from API).
  const totalSpend = trips.reduce((s, t) => s + (t.budget_total ?? 0), 0);
  const totalStops = trips.reduce((s, t) => s + (t.stop_count ?? 0), 0);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-chart-2 p-8 text-primary-foreground md:p-10">
        <Plane className="absolute -top-4 -right-4 size-40 rotate-12 opacity-15" />
        <div className="relative space-y-4">
          <p className="text-sm font-medium uppercase tracking-widest opacity-80">
            {name ? `Welcome back, ${name}` : "Welcome"}
          </p>
          <h1 className="max-w-xl text-3xl font-bold md:text-4xl">Where to next?</h1>
          <p className="max-w-md text-sm opacity-90 md:text-base">
            Build a multi-city itinerary, add activities, and watch your budget add up.
          </p>
          <CreateTripDialog
            onCreated={reload}
            trigger={
              <Button size="lg" variant="secondary" className="mt-2">
                <Plane /> Plan a new trip
              </Button>
            }
          />
        </div>
      </section>

      {/* Budget highlights */}
      {!loading && trips.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-3">
          <Stat icon={<Luggage className="size-5" />} label="Trips planned" value={String(trips.length)} />
          <Stat icon={<Wallet className="size-5" />} label="Estimated spend" value={money(totalSpend)} />
          <Stat icon={<MapPin className="size-5" />} label="Total stops" value={String(totalStops)} />
        </section>
      )}

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

      {/* Recommended destinations */}
      {recommended.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Recommended destinations</h2>
            <p className="text-sm text-muted-foreground">
              Pick a city to start planning — we&apos;ll preselect its country.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((c) => (
              <CreateTripDialog
                key={c.id}
                onCreated={reload}
                defaultCountry={c.country}
                trigger={<DestinationCard city={c} />}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DestinationCard({
  city,
  ...props
}: { city: City } & React.ComponentProps<"button">) {
  return (
    <button type="button" {...props} className="group block text-left">
      <Card className="gap-0 overflow-hidden py-0 transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg">
        <div className="relative h-32 w-full">
          <Image
            src={imageOr(city.img_url, `${city.name}, ${city.country}`)}
            alt={city.name}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover"
          />
        </div>
        <CardContent className="flex items-center justify-between gap-2 py-3">
          <div>
            <p className="font-semibold leading-tight">{city.name}</p>
            <p className="text-xs text-muted-foreground">{city.country}</p>
          </div>
          <Badge variant="secondary">~{money(city.cost_index)}/day</Badge>
        </CardContent>
      </Card>
    </button>
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
