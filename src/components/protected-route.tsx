"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Evita redirect se si è sulla pagina di login
  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, loading, router, pathname]);

  // Mostra loader finché l'auth è in caricamento
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Su /login, renderizza sempre i children (anche senza utente)
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Su pagine protette senza utente, non renderizzare mentre avviene il redirect
  if (!user) {
    return null;
  }

  return <>{children}</>;
}