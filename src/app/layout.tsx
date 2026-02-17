import type { Metadata } from "next";
import "./globals.css";
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
import { ProtectedRoute } from "@/components/protected-route";
import { DataLoadingWrapper } from "@/components/data-loading-wrapper";

export const metadata: Metadata = {
  title: "Gestione Interventi",
  description: "Gestione anagrafica clienti e richieste di intervento",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <SystemTypeProvider>
              <BrandProvider>
                <CustomerProvider>
                  <InterventionProvider>
                    <MaterialProvider>
                      <TechnicianProvider>
                        <SupplierProvider>
                          <ProtectedRoute>
                            <DataLoadingWrapper>
                              <AppShell>{children}</AppShell>
                            </DataLoadingWrapper>
                          </ProtectedRoute>
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