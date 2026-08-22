"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Me } from "@/lib/types";

/** Fetch the logged-in user's profile (incl. presigned photo_url). Used by nav + profile page. */
export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    apiFetch<Me>("/auth/me")
      .then(setMe)
      .catch(() => setMe(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(reload, [reload]);
  return { me, loading, reload };
}
