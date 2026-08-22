"use client";

import * as React from "react";
import { Share2, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Share button: creates a public link (POST /trips/{id}/share), shows it in a copyable dialog. */
export function ShareDialog({ tripId }: { tripId: number }) {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  async function share() {
    setBusy(true);
    try {
      const r = await apiFetch<{ share_token: string }>(
        `/trips/${tripId}/share`,
        { method: "POST" }
      );
      setUrl(`${window.location.origin}/trip/${r.share_token}`);
      setCopied(false);
      setOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create link.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed — select the link and copy manually.");
    }
  }

  return (
    <>
      <Button variant="outline" onClick={share} disabled={busy}>
        <Share2 /> {busy ? "Creating…" : "Share"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this trip</DialogTitle>
            <DialogDescription>
              Anyone with this link can view the itinerary — read-only, no login.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              className="text-muted-foreground"
            />
            <Button
              size="icon"
              variant="secondary"
              onClick={copy}
              aria-label="Copy link"
            >
              {copied ? <Check /> : <Copy />}
            </Button>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
          >
            <ExternalLink className="size-4" /> Open public page
          </a>
        </DialogContent>
      </Dialog>
    </>
  );
}
