"use client";

import * as React from "react";
import { MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type { City, Trip } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// Inline "add a stop" bar: city dropdown (scoped to the trip's country) + dates.
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
  const [cityId, setCityId] = React.useState("");
  const [start, setStart] = React.useState(trip.start_date);
  const [end, setEnd] = React.useState(trip.end_date);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const qs = trip.country ? `?country=${encodeURIComponent(trip.country)}` : "";
    apiFetch<City[]>(`/cities${qs}`).then(setCities).catch(() => {});
  }, [trip.country]);

  async function add() {
    if (!cityId) return toast.error("Pick a city.");
    if (!start || !end) return toast.error("Pick dates.");
    if (end < start) return toast.error("End must be on or after start.");
    setSaving(true);
    try {
      await apiFetch(`/trips/${tripId}/stops`, {
        method: "POST",
        body: { city_id: Number(cityId), start_date: start, end_date: end },
      });
      const name = cities.find((c) => String(c.id) === cityId)?.name ?? "Stop";
      toast.success(`${name} added.`);
      setCityId("");
      onAdded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add stop.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid min-w-48 flex-1 gap-1.5">
          <Label htmlFor="add-city" className="flex items-center gap-1.5">
            <MapPin className="size-4 text-primary" /> City
            {trip.country ? <span className="text-muted-foreground">in {trip.country}</span> : null}
          </Label>
          <select
            id="add-city"
            className={selectClass}
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
          >
            <option value="" disabled>
              Select a city
            </option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · ${c.cost_index}/night
              </option>
            ))}
          </select>
        </div>
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
        <Button onClick={add} disabled={saving}>
          <Plus /> {saving ? "Adding…" : "Add stop"}
        </Button>
      </div>
    </div>
  );
}
