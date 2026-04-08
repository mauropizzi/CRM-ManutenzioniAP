"use client";

import React from 'react';
import { AuthProvider } from '@/context/auth-context';
import { CustomerProvider } from '@/context/customer-context';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const APP_VERSION = '1.0.2'; 
      const storedVersion = localStorage.getItem('app_version');

      if (storedVersion !== APP_VERSION) {
        console.log('[boot] New version detected. Clearing corrupted storage...');
        localStorage.clear();
        document.cookie.split("; ").forEach((cookie) => {
          document.cookie = cookie.replace(/^(.+?)=.*/, "$1=") + ";expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });
        localStorage.setItem('app_version', APP_VERSION);
        window.location.reload();
      }
    }
  }, []);

  return (
    <html lang="it">
      <body className="min-h-screen bg-background">
        <AuthProvider>
          <CustomerProvider>
            {children}
            <Toaster position="top-center" />
          </CustomerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}