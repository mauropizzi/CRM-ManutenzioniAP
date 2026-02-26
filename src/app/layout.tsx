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
        <Script
          id="dev-disable-sw"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    // In ambiente Dyad/Dev il Service Worker del proxy può servire asset vecchi e causare
    // errori tipo "Invalid or unexpected token" o "Loading chunk failed".
    // Disabilitiamolo SOLO in locale.
    var host = location.hostname;
    var isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
    if (!isLocal) return;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (regs) {
        return Promise.all(regs.map(function (r) { return r.unregister(); }));
      }).then(function () {
        if (window.caches && caches.keys) {
          return caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (k) { return caches.delete(k); }));
          });
        }
      }).catch(function () {});
    }
  } catch (e) {}
})();
`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
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