"use client";

import { useEffect } from "react";

export function DevDisableServiceWorker() {
  useEffect(() => {
    // Pulizia Service Worker e Cache Storage - eseguito SEMPRE (non solo in dev)
    // per evitare che asset obsoleti vengano serviti dopo un deploy.
    const key = "__sw_cleanup_v2__";

    try {
      if (typeof window === "undefined") return;
      if (window.sessionStorage?.getItem(key)) return;
      if (!("serviceWorker" in navigator)) return;

      const hadController = !!navigator.serviceWorker.controller;

      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => {
          if (!regs?.length) return;
          console.log("[sw-cleanup] Unregistering", regs.length, "service workers");
          return Promise.all(regs.map((r) => r.unregister()));
        })
        .then(() => {
          if (!window.caches?.keys) return;
          return caches.keys().then((keys) => {
            if (keys.length) {
              console.log("[sw-cleanup] Deleting", keys.length, "caches");
            }
            return Promise.all(keys.map((k) => caches.delete(k)));
          });
        })
        .finally(() => {
          try {
            window.sessionStorage?.setItem(key, "1");
          } catch {
            // ignore
          }

          // Se un SW stava controllando la pagina, ricarichiamo una volta
          // per far prendere i nuovi asset.
          if (hadController) {
            console.log("[sw-cleanup] Had controller, reloading...");
            window.location.reload();
          }
        });
    } catch {
      // ignore
    }
  }, []);

  return null;
}
