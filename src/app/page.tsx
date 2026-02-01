import { MadeWithDyad } from "@/components/made-with-dyad";
import { ProtectedRoute } from "@/components/protected-route";
import { BrandingHero } from "@/components/branding-hero"; // Importa il nuovo componente

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="grid grid-rows-[1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-50 dark:bg-gray-950">
        <main className="flex flex-col gap-8 row-start-1 items-center sm:items-center text-center">
          <BrandingHero /> {/* Utilizzo il nuovo componente BrandingHero */}
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 mt-8">
            Benvenuto nel sistema di gestione interventi. Utilizza il menu laterale per navigare.
          </p>
        </main>
        <MadeWithDyad />
      </div>
    </ProtectedRoute>
  );
}