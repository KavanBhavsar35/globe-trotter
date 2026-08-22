"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, Compass, TrendingUp, MapPin, Sparkles, Plane } from "lucide-react";
import { apiFetch, getEmail } from "@/lib/api";
import { useTrips } from "@/lib/use-trips";
import { money, imageOr } from "@/lib/format";
import type { City } from "@/lib/types";
import { CreateTripDialog } from "@/components/create-trip-dialog";
import { TripCard } from "@/components/trip-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
  const recommended = cities
    .filter(c => c.popularity >= 70)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 6);

  // Budget highlights across all trips
  const totalSpend = trips.reduce((s, t) => s + (t.budget_total ?? 0), 0);
  const totalStops = trips.reduce((s, t) => s + (t.stop_count ?? 0), 0);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero - Editorial asymmetric layout */}
      <section className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        {/* Left content area */}
        <div className="space-y-6 lg:col-span-3">
          <div className="space-y-3">
            <p className="label-caps text-primary">
              {name ? `Welcome back, ${name}` : "Welcome to GlobeTrotter"}
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Where will your next adventure take you?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Plan multi-city journeys with confidence. Build detailed itineraries, 
              discover activities, and keep your budget on track.
            </p>
          </div>
          
          <CreateTripDialog
            onCreated={reload}
            trigger={
              <Button size="lg" className="text-base">
                <Plane className="size-5" />
                Start planning
              </Button>
            }
          />

          {/* Inline stats - integrated info panel */}
          {!loading && trips.length > 0 && (
            <div className="flex flex-wrap items-center gap-6 rounded-lg border bg-card/50 px-6 py-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                <span className="font-medium">{trips.length}</span>
                <span className="text-muted-foreground">
                  {trips.length === 1 ? "trip" : "trips"}
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Compass className="size-4 text-seafoam" />
                <span className="font-medium">{totalStops}</span>
                <span className="text-muted-foreground">
                  {totalStops === 1 ? "destination" : "destinations"}
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-coral" />
                <span className="font-medium">{money(totalSpend)}</span>
                <span className="text-muted-foreground">estimated</span>
              </div>
            </div>
          )}
        </div>

        {/* Right featured destination */}
        {recommended.length > 0 && (
          <div className="lg:col-span-2">
            <CreateTripDialog
              onCreated={reload}
              defaultCountry={recommended[0].country}
              trigger={
                <button type="button" className="group relative h-full w-full overflow-hidden rounded-2xl">
                  <div className="absolute inset-0">
                    <Image
                      src={imageOr(recommended[0].img_url, `${recommended[0].name}, ${recommended[0].country}`)}
                      alt={recommended[0].name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="image-scrim absolute inset-0" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm mb-3">
                      <Sparkles className="size-3" />
                      Featured
                    </div>
                    <h3 className="text-2xl font-bold">{recommended[0].name}</h3>
                    <p className="text-sm opacity-90">{recommended[0].country}</p>
                    <p className="mt-2 text-xs opacity-75">From {money(recommended[0].cost_index)}/day</p>
                  </div>
                </button>
              }
            />
          </div>
        )}
      </section>

      {/* Recent trips */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Your trips</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Continue planning or start fresh
            </p>
          </div>
          {trips.length > 3 && (
            <Link
              href="/trips"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View all {trips.length} <ArrowRight className="size-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState onCreated={reload} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((t) => (
              <TripCard key={t.id} trip={t} onDeleted={reload} />
            ))}
          </div>
        )}
      </section>

      {/* Destination discovery grid */}
      {recommended.length > 1 && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Discover destinations</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Popular cities to add to your next itinerary
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.slice(1).map((c) => (
              <DestinationCard key={c.id} city={c} onCreated={reload} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function DestinationCard({
  city,
  onCreated,
}: { city: City; onCreated: () => void }) {
  return (
    <CreateTripDialog
      onCreated={onCreated}
      defaultCountry={city.country}
      trigger={
        <button 
          type="button" 
          className="group block h-full text-left transition-transform hover:-translate-y-1"
        >
          <Card className="pt-0 overflow-hidden border-0 shadow-sm ring-1 ring-border/50 transition-shadow hover:shadow-md">
            <div className="relative aspect-destination overflow-hidden">
              <Image
                src={imageOr(city.img_url, `${city.name}, ${city.country}`)}
                alt={city.name}
                fill
                sizes="(max-width: 768px) 100vw, 360px"
                className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:brightness-105"
              />
              {city.popularity >= 85 && (
                <div className="absolute top-3 right-3 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
                  Popular
                </div>
              )}
            </div>
            <div className="space-y-2 p-4">
              <div>
                <p className="font-semibold leading-tight">{city.name}</p>
                <p className="text-sm text-muted-foreground">{city.country}</p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">Daily budget</span>
                <span className="font-mono text-sm font-medium">{money(city.cost_index)}</span>
              </div>
            </div>
          </Card>
        </button>
      }
    />
  );
}

function EmptyState({ onCreated }: { onCreated: () => void }) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-6 rounded-2xl border-2 border-dashed p-16 text-center",
      "bg-muted/30"
    )}>
      <div className="rounded-2xl bg-primary/10 p-6">
        <Compass className="size-12 text-primary" />
      </div>
      <div className="space-y-2 max-w-sm">
        <p className="text-lg font-semibold">Your adventure awaits</p>
        <p className="text-sm text-muted-foreground">
          Create your first trip to start building your perfect itinerary
        </p>
      </div>
      <CreateTripDialog 
        onCreated={onCreated}
        trigger={
          <Button size="lg">
            <Plane className="size-5" />
            Plan your first trip
          </Button>
        }
      />
    </div>
  );
}
