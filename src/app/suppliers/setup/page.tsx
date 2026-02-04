import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SuppliersSetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-lg bg-white dark:bg-gray-900 shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Setup Fornitori
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Questa pagina è stata aggiunta per completare la configurazione e risolvere gli errori di compilazione.
          </p>
          <div className="mt-6">
            <Link href="/suppliers">
              <Button className="bg-blue-600 hover:bg-blue-700">Vai ai Fornitori</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}