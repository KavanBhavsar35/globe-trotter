"use client";

import { toast } from "sonner";

// Toast-based confirm. Resolves true on confirm, false on cancel/dismiss.
// Consistent replacement for window.confirm across the app.
export function confirmToast(
  message: string,
  opts?: { confirmLabel?: string; cancelLabel?: string },
): Promise<boolean> {
  return new Promise((resolve) => {
    toast(message, {
      duration: Infinity,
      action: {
        label: opts?.confirmLabel ?? "Confirm",
        onClick: () => resolve(true),
      },
      cancel: {
        label: opts?.cancelLabel ?? "Cancel",
        onClick: () => resolve(false),
      },
      onDismiss: () => resolve(false),
    });
  });
}
