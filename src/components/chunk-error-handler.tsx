"use client";

import { useEffect } from "react";

export const ChunkErrorHandler = () => {
  useEffect(() => {
    const alreadyReloaded = () => sessionStorage.getItem("chunk-reloaded") === "1";
    const markReloaded = () => sessionStorage.setItem("chunk-reloaded", "1");

    const handleError = (event: ErrorEvent) => {
      const msg = event?.message || "";
      if (msg.includes("Loading chunk") || msg.includes("ChunkLoadError")) {
        if (alreadyReloaded()) return;
        markReloaded();
        window.location.reload();
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason: any = event?.reason;
      const name = reason?.name || "";
      const msg = reason?.message || "";
      if (name.includes("ChunkLoadError") || msg.includes("Loading chunk")) {
        if (alreadyReloaded()) return;
        markReloaded();
        window.location.reload();
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
};

export default ChunkErrorHandler;