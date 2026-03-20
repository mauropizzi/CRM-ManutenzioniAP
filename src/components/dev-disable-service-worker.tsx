"use client";

import { useEffect } from "react";

export function DevDisableServiceWorker() {
  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV === "production") return;
    
    // In alcuni ambienti (specialmente Chrome) può rimanere registrato un Service Worker
    // vecchio che serve asset obsoleti dopo un deploy.
    // Qui lo disregistriamo in modo sicuro (senza toccare localStorage/sessione Supabase)
    // e svuotiamo SOLO le Cache Storage, una sola volta per sessione.
    const key = "__sw_cleanup_done__";

    try {
      if (typeof window === "undefined") return;
      if (window.sessionStorage?.getItem(key)) return;
      if (!("serviceWorker" in navigator)) return;

      // Don't interfere with Dyad's service worker in development
      // Just mark cleanup as done without actually unregistering
      window.sessionStorage?.setItem(key, "1");
      
      // Log for debugging but don't unregister - let Dyad handle its own SW
      if (navigator.serviceWorker.controller) {
        console.log("[DevDisableServiceWorker] Service Worker active, skipping cleanup in dev");
      }
    } catch {
      // ignore
    }
  }, []);

  return null;
}