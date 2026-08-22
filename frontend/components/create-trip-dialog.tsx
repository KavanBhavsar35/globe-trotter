"use client";

import * as React from "react";
import { PlusIcon, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, apiUpload } from "@/lib/api";
import type { Trip } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function CreateTripDialog({
  onCreated,
  trigger,
  defaultCountry,
}: {
  onCreated?: (t: Trip) => void;
  trigger?: React.ReactNode;
  defaultCountry?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [name, setName] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [countries, setCountries] = React.useState<string[]>([]);
  const [start, setStart] = React.useState("");
  const [end, setEnd] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [cover, setCover] = React.useState<File | null>(null);
  const [coverPreview, setCoverPreview] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    apiFetch<string[]>("/countries").then(setCountries).catch(() => {});
    if (defaultCountry) setCountry(defaultCountry); // recommended-destination preselect
  }, [open, defaultCountry]);

  // Object-URL preview for the picked cover; revoke to avoid leaks.
  React.useEffect(() => {
    if (!cover) return setCoverPreview("");
    const url = URL.createObjectURL(cover);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [cover]);

  function reset() {
    setName("");
    setCountry("");
    setStart("");
    setEnd("");
    setDesc("");
    setCover(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name your trip.");
    if (!country) return toast.error("Pick a country.");
    if (!start || !end) return toast.error("Pick start and end dates.");
    if (end < start) return toast.error("End date must be on or after start.");
    setSaving(true);
    try {
      const trip = await apiFetch<Trip>("/trips", {
        method: "POST",
        body: {
          name: name.trim(),
          country,
          start_date: start,
          end_date: end,
          description: desc.trim(),
        },
      });
      if (cover) {
        // Trip exists first, then attach cover — failure here shouldn't lose the trip.
        try {
          const form = new FormData();
          form.append("file", cover);
          await apiUpload(`/trips/${trip.id}/cover`, form);
        } catch {
          toast.warning("Trip saved, but the cover photo failed to upload.");
        }
      }
      toast.success("Trip created.");
      reset();
      setOpen(false);
      onCreated?.(trip);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create trip.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          (trigger as React.ReactElement) ?? (
            <Button>
              <PlusIcon /> Plan a trip
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Plan a new trip</DialogTitle>
          <DialogDescription>Name it, pick a country, set the dates.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="trip-name">Trip name</Label>
            <Input
              id="trip-name"
              placeholder="Two weeks in Japan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="trip-country">Country</Label>
            <select
              id="trip-country"
              className={selectClass}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="" disabled>
                Select a country
              </option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="trip-start">Start date</Label>
              <Input
                id="trip-start"
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="trip-end">End date</Label>
              <Input
                id="trip-end"
                type="date"
                min={start || undefined}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="trip-desc">Description (optional)</Label>
            <Input
              id="trip-desc"
              placeholder="What's this trip about?"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Cover photo (optional)</Label>
            {coverPreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="h-32 w-full rounded-md object-cover"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  aria-label="Remove cover"
                  onClick={() => setCover(null)}
                  className="absolute right-2 top-2"
                >
                  <X />
                </Button>
              </div>
            ) : (
              <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-sm text-muted-foreground hover:bg-muted/50">
                <ImagePlus className="size-5" />
                Choose an image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    if (!f.type.startsWith("image/")) return toast.error("Pick an image file");
                    setCover(f);
                  }}
                />
              </label>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
