"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, apiUpload, setSession, clearSession, getToken } from "@/lib/api";

type AuthResp = { token: string; email: string };

export type SignupProfile = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
  country?: string;
  bio?: string;
};

export async function login(email: string, password: string) {
  const r = await apiFetch<AuthResp>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setSession(r.token, r.email);
}

export async function signup(
  email: string,
  password: string,
  profile: SignupProfile = {}
) {
  const r = await apiFetch<AuthResp>("/auth/signup", {
    method: "POST",
    body: { email, password, ...profile },
    auth: false,
  });
  setSession(r.token, r.email);
}

/** Request a password-reset link. Always resolves (never reveals if the email exists). */
export async function forgotPassword(email: string): Promise<string> {
  const r = await apiFetch<{ ok: boolean; message: string }>("/auth/forgot-password", {
    method: "POST",
    body: { email },
    auth: false,
  });
  return r.message;
}

/** Set a new password using a reset token from the emailed link. */
export async function resetPassword(token: string, password: string) {
  await apiFetch("/auth/reset-password", {
    method: "POST",
    body: { token, password },
    auth: false,
  });
}

/** Upload a profile photo (multipart). Returns the new presigned photo URL. */
export async function uploadProfilePhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const r = await apiUpload<{ photo_url: string }>("/auth/me/photo", form);
  return r.photo_url;
}

/** Guard hook for pages under (app). Returns true once the token is validated. */
export function useRequireAuth(): boolean {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    apiFetch("/auth/me")
      .then(() => setReady(true))
      .catch(() => {
        clearSession();
        router.replace("/login");
      });
  }, [router]);
  return ready;
}
