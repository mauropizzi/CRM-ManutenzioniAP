import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { CustomerProvider } from "@/context/customer-context";
import { InterventionProvider } from "@/context/intervention-context";
import { MaterialProvider } from "@/context/material-context";
import { TechnicianProvider } from "@/context/technician-context";
import { SupplierProvider } from "@/context/supplier-context";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/app-shell";
import { SystemTypeProvider } from "@/context/system-type-context";
import { BrandProvider } from "@/context/brand-context";
import { RuntimeErrorLogger } from "@/components/runtime-error-logger";
import { DevDisableServiceWorker } from "@/components/dev-disable-service-worker";

export const metadata: Metadata = {
  title: "Gestione Interventi",
  description: "Gestione anagrafica clienti e richieste di intervento",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        {/* Safari-specific: disable back-forward cache */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <Script
          id="sw-early-cleanup"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    // Detect Safari
    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    var isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname.endsWith('.local');
    
    // Safari: disable bfcache to prevent stale chunks
    if (isSafari) {
      window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
          window.location.reload();
        }
      });
    }
    
    // Only run SW cleanup in local dev
    if (!isLocal) return;
    
    var key = '__sw_cleanup_done__';
    try {
      if (sessionStorage && sessionStorage.getItem(key)) return;
    } catch(e) {}
    
    if (!('serviceWorker' in navigator)) return;
    
    var hadController = !!navigator.serviceWorker.controller;
    
    navigator.serviceWorker.getRegistrations().then(function(regs) {
      if (!regs || !regs.length) return;
      return Promise.all(regs.map(function(r) { return r.unregister(); }));
    }).then(function() {
      if (!(window.caches && caches.keys)) return;
      return caches.keys().then(function(keys) {
        return Promise.all(keys.map(function(k) { return caches.delete(k); }));
      });
    }).finally(function() {
      try {
        sessionStorage && sessionStorage.setItem(key, '1');
      } catch(e) {}
      if (hadController) {
        location.reload();
      }
    });
  } catch(e) {}
})();
            `,
          }}
        />

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <DevDisableServiceWorker />
          <RuntimeErrorLogger />
          <AuthProvider>
            <SystemTypeProvider>
              <BrandProvider>
                <CustomerProvider>
                  <InterventionProvider>
                    <MaterialProvider>
                      <TechnicianProvider>
                        <SupplierProvider>
                          <AppShell>{children}</AppShell>
                        </SupplierProvider>
                      </TechnicianProvider>
                    </MaterialProvider>
                  </InterventionProvider>
                </CustomerProvider>
              </BrandProvider>
            </SystemTypeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}