"use client";

import { useEffect } from "react";

export function GlobalErrorHandler() {
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const err = event.reason;
      const isAbort =
        err?.name === "AbortError" ||
        err?.message?.includes("aborted") ||
        err?.message?.includes("AbortError");

      if (isAbort) {
        event.preventDefault();
        return;
      }
    };

    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);

  return null;
}