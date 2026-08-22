"use client";

import * as React from "react";
import Image from "next/image";
import { MapPin, Plus, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type { City, Trip } from "@/lib/types";
import { imageOr, money } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// City search + picker: search bar, image cards with cost + popularity, then dates → Add stop.
// Cities are scoped to the trip's country (catalog is country-scoped), so no country filter here.
export function AddStopForm({
  tripId,
  trip,
  onAdded,
}: {
  tripId: number;
  trip: Trip;
  onAdded: () => void;
}) {
  const [cities, setCities] = React.useState<City[]>([]);
  const [q, setQ] = React.useState("");
  const [cityId, setCityId] = React.useState<number | null>(null);
  const [start, setStart] = React.useState(trip.start_date);
  const [end, setEnd] = React.useState(trip.end_date);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const qs = trip.country ? `?country=${encodeURIComponent(trip.country)}` : "";
    apiFetch<City[]>(`/cities${qs}`).then(setCities).catch(() => {});
  }, [trip.country]);

  const term = q.trim().toLowerCase();
  const shown = cities
    .filter((c) => !term || c.name.toLowerCase().includes(term))
    .sort((a, b) => b.popularity - a.popularity); // best-known first
  const selected = cities.find((c) => c.id === cityId) ?? null;

  async function add() {
    if (!cityId) return toast.error("Pick a city.");
    if (!start || !end) return toast.error("Pick dates.");
    if (end < start) return toast.error("End must be on or after start.");
    setSaving(true);
    try {
      await apiFetch(`/trips/${tripId}/stops`, {
        method: "POST",
        body: { city_id: cityId, start_date: start, end_date: end },
      });
      toast.success(`${selected?.name ?? "Stop"} added.`);
      setCityId(null);
      setQ("");
      onAdded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add stop.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-1.5">
        <MapPin className="size-4 text-primary" />
        <h2 className="font-semibold">Add a stop</h2>
        {trip.country ? (
          <span className="text-sm text-muted-foreground">· cities in {trip.country}</span>
        ) : null}
      </div>

      {/* search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search cities…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* city cards */}
      <div className="grid max-h-80 gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
        {shown.length === 0 ? (
          <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
            No cities match “{q}”.
          </p>
        ) : (
          shown.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setCityId(c.id)}
              aria-pressed={cityId === c.id}
              className={`overflow-hidden rounded-lg border bg-background text-left transition hover:shadow-sm ${
                cityId === c.id ? "ring-2 ring-primary" : "hover:border-primary/50"
              }`}
            >
              <div className="relative h-24 w-full">
                <Image
                  src={imageOr(c.img_url, `${c.name}, ${c.country}`)}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 240px"
                  className="object-cover"
                />
                {c.popularity >= 85 && (
                  <Badge className="absolute left-2 top-2">Popular</Badge>
                )}
              </div>
              <div className="p-2.5">
                <p className="font-medium leading-tight">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.country}</p>
                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium">{money(c.cost_index)}/night</span>
                  <span className="inline-flex items-center gap-0.5 text-muted-foreground">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    {c.popularity}
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* dates + add */}
      <div className="flex flex-wrap items-end gap-3 border-t pt-4">
        <p className="mr-auto text-sm">
          {selected ? (
            <>
              Selected: <span className="font-semibold">{selected.name}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Pick a city above.</span>
          )}
        </p>
        <div className="grid gap-1.5">
          <Label htmlFor="add-start">Arrive</Label>
          <Input
            id="add-start"
            type="date"
            min={trip.start_date}
            max={trip.end_date}
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="add-end">Leave</Label>
          <Input
            id="add-end"
            type="date"
            min={start || trip.start_date}
            max={trip.end_date}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
        <Button onClick={add} disabled={!cityId || saving}>
          <Plus /> {saving ? "Adding…" : "Add to trip"}
        </Button>
      </div>
    </div>
  );
}
