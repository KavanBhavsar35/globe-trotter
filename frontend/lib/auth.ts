"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setSession, clearSession, getToken } from "@/lib/api";

type AuthResp = { token: string; email: string };

export async function login(email: string, password: string) {
  const r = await apiFetch<AuthResp>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setSession(r.token, r.email);
}

export async function signup(email: string, password: string) {
  const r = await apiFetch<AuthResp>("/auth/signup", {
    method: "POST",
    body: { email, password },
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
