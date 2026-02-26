"use client";

import { useEffect } from "react";

export function DevDisableServiceWorker() {
  useEffect(() => {
    // In alcuni ambienti (specialmente Chrome) può rimanere registrato un Service Worker
    // vecchio che serve asset obsoleti dopo un deploy.
    // Qui lo disregistriamo in modo sicuro (senza toccare localStorage/sessione Supabase)
    // e svuotiamo SOLO le Cache Storage, una sola volta per sessione.
    const key = "__sw_cleanup_done__";

    try {
      if (typeof window === "undefined") return;
      if (window.sessionStorage?.getItem(key)) return;
      if (!("serviceWorker" in navigator)) return;

      const hadController = !!navigator.serviceWorker.controller;

      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => {
          if (!regs?.length) return;
          return Promise.all(regs.map((r) => r.unregister()));
        })
        .then(() => {
          if (!window.caches?.keys) return;
          return caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
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
            window.location.reload();
          }
        });
    } catch {
      // ignore
    }
  }, []);

  return null;
}