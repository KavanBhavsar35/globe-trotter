"use client";

import * as React from "react";
import { Check, Clock, Plus } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type { Activity } from "@/lib/types";
import { money } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AddActivityDialog({
  stopId,
  cityId,
  cityName,
  existingIds,
  onAdded,
}: {
  stopId: number;
  cityId: number;
  cityName: string;
  existingIds: number[];
  onAdded: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [acts, setActs] = React.useState<Activity[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [busy, setBusy] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    apiFetch<Activity[]>(`/cities/${cityId}/activities`)
      .then(setActs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, cityId]);

  async function add(a: Activity) {
    setBusy(a.id);
    try {
      await apiFetch(`/stops/${stopId}/activities`, {
        method: "POST",
        body: { activity_id: a.id },
      });
      toast.success(`Added ${a.name}.`);
      onAdded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Plus /> Add activity
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Things to do in {cityName}</DialogTitle>
          <DialogDescription>Add activities to this stop.</DialogDescription>
        </DialogHeader>
        <div className="max-h-96 space-y-1.5 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-center text-sm text-muted-foreground">Loading…</p>
          ) : acts.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No activities listed.</p>
          ) : (
            acts.map((a) => {
              const added = existingIds.includes(a.id);
              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.name}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="capitalize">{a.type}</Badge>
                      <span>{money(a.cost)}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {a.duration_hours}h
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={added ? "ghost" : "default"}
                    disabled={added || busy === a.id}
                    onClick={() => add(a)}
                  >
                    {added ? <><Check /> Added</> : "Add"}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
