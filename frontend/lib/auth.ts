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
