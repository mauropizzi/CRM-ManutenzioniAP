import { MadeWithDyad } from "@/components/made-with-dyad";
import { ProtectedRoute } from "@/components/protected-route";

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="grid grid-rows-[1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-50 dark:bg-gray-950">
        <main className="flex flex-col gap-8 row-start-1 items-center sm:items-center text-center">
          <div className="relative w-full max-w-2xl mx-auto p-8 sm:p-12 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2 drop-shadow-lg">
                Antonelli & Zani
              </h1>
              <p className="text-xl sm:text-2xl font-light opacity-90 drop-shadow-md">
                Refrigerazioni
              </p>
            </div>
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