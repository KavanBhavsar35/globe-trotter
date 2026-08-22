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
    <div className="mx-auto max-w-3xl space-y-10 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold md:text-4xl">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      {/* Profile Identity Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Profile</h2>
        <div className="flex flex-col items-center gap-6 rounded-xl border bg-card p-8 sm:flex-row sm:items-start">
          <div className="relative">
            {me.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- presigned URL expires; next/image optimizer would cache a stale link
              <img
                src={me.photo_url}
                alt={fullName}
                className="size-28 rounded-full object-cover ring-4 ring-border"
              />
            ) : (
              <div className="flex size-28 items-center justify-center rounded-full bg-muted ring-4 ring-border">
                <UserRound className="size-12 text-muted-foreground" />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              aria-label="Change photo"
              className="absolute -bottom-1 -right-1 rounded-full bg-primary p-2.5 text-primary-foreground shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
            >
              <Camera className="size-5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
          </div>
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <p className="text-2xl font-bold">{fullName}</p>
            <p className="text-muted-foreground">{me.email}</p>
            {uploading && <p className="text-sm text-primary">Uploading photo…</p>}
          </div>
        </div>
      </section>

      {/* Account Details Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Personal information</h2>
        <div className="rounded-xl border bg-card p-6">
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="first_name" label="First name">
                <Input id="first_name" value={form.first_name} onChange={set("first_name")} />
              </Field>
              <Field id="last_name" label="Last name">
                <Input id="last_name" value={form.last_name} onChange={set("last_name")} />
              </Field>
            </div>
            <Field id="email" label="Email address">
              <Input id="email" type="email" value={form.email} onChange={set("email")} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="phone" label="Phone number">
                <Input id="phone" value={form.phone} onChange={set("phone")} />
              </Field>
              <Field id="city" label="City">
                <Input id="city" value={form.city} onChange={set("city")} />
              </Field>
            </div>
            <Field id="country" label="Country">
              <Input id="country" value={form.country} onChange={set("country")} />
            </Field>
            <Field id="bio" label="About you">
              <textarea
                id="bio"
                value={form.bio}
                onChange={set("bio")}
                rows={3}
                placeholder="Share a bit about yourself and your travel interests…"
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm shadow-xs outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </Field>
            <div className="flex justify-end border-t pt-5">
              <Button onClick={save} disabled={saving} size="lg">
                <Save /> {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Preferences</h2>
        <div className="rounded-xl border bg-card p-6">
          <Field id="lang" label="Language">
            <select
              id="lang"
              value={lang}
              onChange={(e) => changeLang(e.target.value)}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm shadow-xs outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              {LANGS.map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
            <p className="mt-2 text-xs text-muted-foreground">
              Your preferred language for the interface
            </p>
          </Field>
        </div>
      </section>

      {/* Saved Destinations Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Saved destinations</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Cities you've added to your trips
          </p>
        </div>
        {dests.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed bg-muted/30 p-12 text-center">
            <MapPin className="mx-auto mb-3 size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No saved destinations yet. Add stops to your trips to build your collection.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dests.map((d) => (
              <div 
                key={d.id} 
                className="group overflow-hidden rounded-xl border-0 shadow-sm ring-1 ring-border/50 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- external loremflickr fallback, not a local asset */}
                <img
                  src={imageOr(d.img_url, `${d.name}, ${d.country}`, 320, 180)}
                  alt={d.name}
                  className="aspect-destination w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="space-y-1 bg-card p-3">
                  <p className="font-semibold leading-tight">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.country} · <span className="font-mono">{money(d.cost_index)}</span>/day
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Danger Zone Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-destructive">Danger zone</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Irreversible actions
          </p>
        </div>
        <div className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-destructive">Delete your account</p>
              <p className="text-sm text-muted-foreground mt-1">
                This will permanently delete your profile, trips, and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={onDelete} 
              className="shrink-0"
              size="lg"
            >
              <Trash2 /> Delete account
            </Button>
          </div>
        </div>
      </section>
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
