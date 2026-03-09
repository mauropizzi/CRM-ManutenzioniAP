"use client";

import { useEffect } from "react";

export function RuntimeErrorLogger() {
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      console.error("[RuntimeErrorLogger] Uncaught error:", event.error ?? event.message);
    };
    const unhandledHandler = (event: PromiseRejectionEvent) => {
      console.error("[RuntimeErrorLogger] Unhandled promise rejection:", event.reason);
    };
    window.addEventListener("error", handler);
    window.addEventListener("unhandledrejection", unhandledHandler);
    return () => {
      window.removeEventListener("error", handler);
      window.removeEventListener("unhandledrejection", unhandledHandler);
    };
  }, []);

  return null;
}