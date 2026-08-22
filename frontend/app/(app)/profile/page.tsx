"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { UserRound, Camera, Mail, Phone, MapPin } from "lucide-react";
import { useMe } from "@/lib/use-me";
import { uploadProfilePhoto } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { me, loading, reload } = useMe();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Pick an image file");
    setUploading(true);
    try {
      await uploadProfilePhoto(file);
      toast.success("Photo updated");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <Skeleton className="h-72 rounded-2xl" />;
  if (!me) return <p className="text-sm text-muted-foreground">Could not load profile.</p>;

  const fullName = [me.first_name, me.last_name].filter(Boolean).join(" ") || "Traveller";
  const location = [me.city, me.country].filter(Boolean).join(", ");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center sm:flex-row sm:text-left">
          <div className="relative">
            {me.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- presigned URL expires; next/image optimizer would cache a stale link
              <img
                src={me.photo_url}
                alt={fullName}
                className="size-24 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="flex size-24 items-center justify-center rounded-full bg-muted ring-2 ring-border">
                <UserRound className="size-10 text-muted-foreground" />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              aria-label="Change photo"
              className="absolute -bottom-1 -right-1 rounded-full bg-primary p-2 text-primary-foreground shadow hover:opacity-90 disabled:opacity-50"
            >
              <Camera className="size-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={onPick}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-semibold">{fullName}</p>
            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5" /> {me.email}
            </p>
            {uploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row icon={<Phone className="size-4" />} label="Phone" value={me.phone} />
          <Row icon={<MapPin className="size-4" />} label="Location" value={location} />
          {me.bio && (
            <div className="border-t pt-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Additional information
              </p>
              <p className="whitespace-pre-wrap">{me.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground">{icon}</span>
      <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
      <span>{value || <span className="text-muted-foreground">—</span>}</span>
    </div>
  );
}
