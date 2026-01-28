import { MadeWithDyad } from "@/components/made-with-dyad";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="grid grid-rows-[1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-50 dark:bg-gray-950">
      <main className="flex flex-col gap-8 row-start-1 items-center sm:items-center text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Benvenuto!</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          Questa è la tua applicazione Next.js. Clicca qui sotto per gestire i tuoi clienti o registrare una richiesta di intervento.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/customers" passHref>
            <Button className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105">
              Vai all'Anagrafica Clienti
            </Button>
          </Link>
          <Link href="/interventions/new" passHref>
            <Button className="rounded-lg bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105">
              Registra Intervento
            </Button>
          </Link>
        </div>
      </main>
      <MadeWithDyad />
    </div>
  );
}