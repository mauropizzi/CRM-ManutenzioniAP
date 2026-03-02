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
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <Script
          id="cache-buster"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    // Gestione bfcache per tutti i browser
    window.addEventListener('pageshow', function(event) {
      if (event.persisted) {
        window.location.reload();
      }
    });
    
    // Pulizia Service Worker e Cache - SEMPRE, non solo in locale
    var key = '__sw_cleanup_v2__';
    try {
      if (sessionStorage && sessionStorage.getItem(key)) return;
    } catch(e) {}
    
    if (!('serviceWorker' in navigator)) {
      // Nessun SW supportato, pulisci solo cache
      if (window.caches && caches.keys) {
        caches.keys().then(function(keys) {
          return Promise.all(keys.map(function(k) { return caches.delete(k); }));
        });
      }
      return;
    }
    
    var hadController = !!navigator.serviceWorker.controller;
    
    navigator.serviceWorker.getRegistrations().then(function(regs) {
      if (!regs || !regs.length) return Promise.resolve();
      console.log('[cache-buster] Unregistering', regs.length, 'service workers');
      return Promise.all(regs.map(function(r) { return r.unregister(); }));
    }).then(function() {
      if (!(window.caches && caches.keys)) return Promise.resolve();
      return caches.keys().then(function(keys) {
        if (keys.length) {
          console.log('[cache-buster] Deleting', keys.length, 'caches');
        }
        return Promise.all(keys.map(function(k) { return caches.delete(k); }));
      });
    }).then(function() {
      try {
        sessionStorage && sessionStorage.setItem(key, '1');
      } catch(e) {}
      
      if (hadController) {
        console.log('[cache-buster] Had SW controller, reloading...');
        location.reload();
      }
    }).catch(function(err) {
      console.error('[cache-buster] Error:', err);
    });
  } catch(e) {
    console.error('[cache-buster] Init error:', e);
  }
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
