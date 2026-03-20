"use client";

import { useEffect } from "react";

// Chiave per tracciare i tentativi di refresh
const CHUNK_ERROR_REFRESH_KEY = "__chunk_error_refresh__";
const MAX_REFRESH_ATTEMPTS = 2;

function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  
  const errorString = String(error);
  const errorMessage = (error as Error)?.message || "";
  const errorName = (error as Error)?.name || "";
  
  // Pattern comuni per errori di chunk loading
  const chunkErrorPatterns = [
    /loading chunk/i,
    /failed to fetch/i,
    /dynamically imported module/i,
    /loading css chunk/i,
    /chunk.*failed/i,
    /webpack/i,
    /cannot find module/i,
    /unexpected token/i,
    /syntax.*error/i,
    /timeout/i,
    /timed out/i,
    /network.*error/i,
    /abort/i,
  ];
  
  return chunkErrorPatterns.some(pattern => 
    pattern.test(errorString) || 
    pattern.test(errorMessage) ||
    pattern.test(errorName)
  );
}

function handleChunkError() {
  try {
    const refreshCount = parseInt(sessionStorage.getItem(CHUNK_ERROR_REFRESH_KEY) || "0", 10);
    
    if (refreshCount < MAX_REFRESH_ATTEMPTS) {
      sessionStorage.setItem(CHUNK_ERROR_REFRESH_KEY, String(refreshCount + 1));
      
      // Pulisci la cache del browser per questa pagina
      if ("caches" in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      
      // Forza un hard refresh
      window.location.reload();
      return true;
    } else {
      // Reset il contatore dopo troppi tentativi
      sessionStorage.removeItem(CHUNK_ERROR_REFRESH_KEY);
      console.error("[runtime-error] Max refresh attempts reached for chunk error");
    }
  } catch (e) {
    // sessionStorage potrebbe non essere disponibile
    console.error("[runtime-error] Could not handle chunk error", e);
  }
  return false;
}

export function RuntimeErrorLogger() {
  useEffect(() => {
    // Reset il contatore di refresh se la pagina si carica correttamente
    const resetTimer = setTimeout(() => {
      try {
        sessionStorage.removeItem(CHUNK_ERROR_REFRESH_KEY);
      } catch (e) {
        // Ignora
      }
    }, 5000);

    const onError = (event: ErrorEvent) => {
      console.error("[runtime-error] window.error", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        errorName: (event.error as Error)?.name,
        errorMessage: (event.error as Error)?.message,
        stack: (event.error as Error)?.stack,
      });

      // Gestisci errori di chunk loading automaticamente
      if (isChunkLoadError(event.error) || isChunkLoadError(event.message)) {
        event.preventDefault();
        handleChunkError();
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("[runtime-error] unhandledrejection", {
        reason: event.reason,
      });

      // Gestisci errori di chunk loading nelle Promise
      if (isChunkLoadError(event.reason)) {
        event.preventDefault();
        handleChunkError();
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      clearTimeout(resetTimer);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}