import Image from "next/image";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ProtectedRoute } from "@/components/protected-route";

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="grid min-h-screen grid-rows-[1fr_auto] items-center justify-items-center bg-background p-6 pb-16 sm:p-12">
        <main className="row-start-1 flex w-full max-w-4xl flex-col items-center gap-8 text-center animate-fade-in">
          <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary-dark/5" />
            <div className="relative flex flex-col items-center justify-center gap-6 px-6 py-12 sm:px-10 sm:py-16">
              <div className="rounded-xl bg-surface p-4 shadow-md border border-border">
                <Image
                  src="/nuovo-logo.jpeg"
                  alt="Antonelli & Zani Refrigerazione"
                  width={760}
                  height={240}
                  priority
                  className="h-auto w-[280px] sm:w-[380px] transition-transform hover:scale-105"
                />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground sm:text-4xl tracking-tight">
                  Dashboard
                </h1>
                <p className="text-base text-text-secondary font-medium sm:text-lg">
                  Gestione interventi, clienti, tecnici e fornitori
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-2xl space-y-4">
            <p className="text-lg text-text-secondary sm:text-xl leading-relaxed">
              Benvenuto nel sistema di gestione interventi. Utilizza il menu laterale per navigare tra le diverse sezioni.
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
                📊 Dashboard Analitica
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-success/10 text-success font-medium">
                👥 Gestione Clienti
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                🔧 Interventi
              </span>
            </div>
          </div>
        </main>

        <MadeWithDyad />
      </div>
    </ProtectedRoute>
  );
}