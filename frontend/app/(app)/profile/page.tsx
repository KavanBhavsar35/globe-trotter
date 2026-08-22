"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserRound, Camera, Save, Trash2, Globe, MapPin } from "lucide-react";
import { useMe } from "@/lib/use-me";
import { uploadProfilePhoto, updateProfile, deleteAccount } from "@/lib/auth";
import { apiFetch, setStoredEmail } from "@/lib/api";
import { confirmToast } from "@/lib/confirm";
import { imageOr, money } from "@/lib/format";
import type { SavedDestination } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

// ponytail: preference-only, persisted to localStorage; no i18n consumer wired up yet.
const LANG_KEY = "gt_lang";
const LANGS = [
  ["en", "English"],
  ["hi", "हिन्दी (Hindi)"],
  ["ja", "日本語 (Japanese)"],
  ["es", "Español (Spanish)"],
  ["fr", "Français (French)"],
];

type Form = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  bio: string;
};

export default function ProfilePage() {
  const { me, loading, reload } = useMe();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Form>({
    first_name: "", last_name: "", email: "", phone: "", city: "", country: "", bio: "",
  });
  const [lang, setLang] = useState("en");
  const [dests, setDests] = useState<SavedDestination[]>([]);

  // hydrate the form once me loads (and after a reload)
  useEffect(() => {
    if (!me) return;
    setForm({
      first_name: me.first_name, last_name: me.last_name, email: me.email,
      phone: me.phone, city: me.city, country: me.country, bio: me.bio,
    });
  }, [me]);

  useEffect(() => setLang(localStorage.getItem(LANG_KEY) || "en"), []);
  useEffect(() => {
    apiFetch<SavedDestination[]>("/auth/me/destinations").then(setDests).catch(() => {});
  }, []);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

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

  async function save() {
    if (!form.email.includes("@")) return toast.error("Enter a valid email");
    setSaving(true);
    try {
      const updated = await updateProfile(form);
      setStoredEmail(updated.email); // email may have changed — keep localStorage in sync
      toast.success("Profile saved");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function changeLang(v: string) {
    setLang(v);
    localStorage.setItem(LANG_KEY, v);
    toast.success("Language preference saved");
  }

  const router = useRouter();
  async function onDelete() {
    const ok = await confirmToast(
      "Delete your account? This permanently removes your profile and all your trips. This cannot be undone.",
      { confirmLabel: "Delete account" },
    );
    if (!ok) return;
    try {
      await deleteAccount();
      toast.success("Account deleted");
      router.replace("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (loading) return <Skeleton className="h-72 rounded-2xl" />;
  if (!me) return <p className="text-sm text-muted-foreground">Could not load profile.</p>;

  const fullName = [form.first_name, form.last_name].filter(Boolean).join(" ") || "Traveller";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Profile settings</h1>

      {/* Photo */}
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
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-semibold">{fullName}</p>
            <p className="text-sm text-muted-foreground">{me.email}</p>
            {uploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
          </div>
        </CardContent>
      </Card>

      {/* Editable details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="first_name" label="First name">
              <Input id="first_name" value={form.first_name} onChange={set("first_name")} />
            </Field>
            <Field id="last_name" label="Last name">
              <Input id="last_name" value={form.last_name} onChange={set("last_name")} />
            </Field>
          </div>
          <Field id="email" label="Email">
            <Input id="email" type="email" value={form.email} onChange={set("email")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="phone" label="Phone">
              <Input id="phone" value={form.phone} onChange={set("phone")} />
            </Field>
            <Field id="city" label="City">
              <Input id="city" value={form.city} onChange={set("city")} />
            </Field>
          </div>
          <Field id="country" label="Country">
            <Input id="country" value={form.country} onChange={set("country")} />
          </Field>
          <Field id="bio" label="Additional information">
            <textarea
              id="bio"
              value={form.bio}
              onChange={set("bio")}
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </Field>
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>
              <Save /> {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="size-4" /> Language
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Field id="lang" label="Preferred language">
            <select
              id="lang"
              value={lang}
              onChange={(e) => changeLang(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {LANGS.map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </Field>
        </CardContent>
      </Card>

      {/* Saved destinations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="size-4" /> Saved destinations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Cities from your trips show up here. Add stops to a trip to build the list.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {dests.map((d) => (
                <div key={d.id} className="overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element -- external loremflickr fallback, not a local asset */}
                  <img
                    src={imageOr(d.img_url, `${d.name}, ${d.country}`, 320, 180)}
                    alt={d.name}
                    className="h-24 w-full object-cover"
                  />
                  <div className="p-2">
                    <p className="text-sm font-medium leading-tight">{d.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.country} · ~{money(d.cost_index)}/day
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Delete account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Permanently delete your profile and all trips. This cannot be undone.
          </p>
          <Button variant="destructive" onClick={onDelete} className="shrink-0">
            <Trash2 /> Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
