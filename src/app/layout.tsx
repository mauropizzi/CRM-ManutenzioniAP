"use client";

import React from 'react';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This effect runs once at the very beginning of the app lifecycle
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const APP_VERSION = '1.0.2'; // Increment this version whenever you have a critical deploy
      const storedVersion = localStorage.getItem('app_version');

      if (storedVersion !== APP_VERSION) {
        console.log('[boot] New version detected. Clearing corrupted storage...');
        
        // Clear everything to ensure no stale auth tokens or corrupted state persist
        localStorage.clear();
        
        // Clear cookies for the current domain
        document.cookie.split("; ").forEach((cookie) => {
          document.cookie = cookie.replace(/^(.+?)=.*/, "$1=") + ";expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });

        localStorage.setItem('app_version', APP_VERSION);
        
        // Force a reload to start with a clean slate
        window.location.reload();
      }
    }
  }, []);

  return (
    <html lang="it">
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}