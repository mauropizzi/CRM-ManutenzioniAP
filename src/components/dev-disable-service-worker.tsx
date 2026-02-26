"use client";

import { useEffect } from "react";

export function DevDisableServiceWorker() {
  useEffect(() => {
    // This component is a no-op. The actual SW cleanup happens via the inline
    // beforeInteractive script in the root layout.
  }, []);

  return null;
}
