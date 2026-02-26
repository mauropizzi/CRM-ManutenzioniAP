"use client";

import { useEffect } from "react";

export function RuntimeErrorLogger() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      // Helps identify which script/chunk is causing a SyntaxError like "Invalid or unexpected token".
      console.error("[runtime-error] window.error", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        errorName: (event.error as any)?.name,
        errorMessage: (event.error as any)?.message,
        stack: (event.error as any)?.stack,
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("[runtime-error] unhandledrejection", {
        reason: event.reason,
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
