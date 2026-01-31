import { MadeWithDyad } from "@/components/made-with-dyad";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/protected-route";
import Image from "next/image"; // Importa il componente Image di Next.js

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="grid grid-rows-[1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-50 dark:bg-gray-950">
        <main className="flex flex-col gap-8 row-start-1 items-center sm:items-center text-center">
          <div className="relative w-full max-w-md h-auto"> {/* Contenitore per il logo */}
            <Image
              src="/logo-crm-antonelli-zani.jpg"
              alt="Logo CRM Antonelli e Zani"
              width={500} // Larghezza desiderata
              height={300} // Altezza desiderata, verrà mantenuto l'aspect ratio
              layout="responsive" // Rende l'immagine responsive
              objectFit="contain" // Assicura che l'immagine sia contenuta senza ritagli
              className="rounded-lg shadow-lg"
            />
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 mt-8">
            Benvenuto nel sistema di gestione interventi. Utilizza il menu laterale per navigare.
          </p>
        </main>
        <MadeWithDyad />
      </div>
    </ProtectedRoute>
  );
}