import Image from "next/image";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ProtectedRoute } from "@/components/protected-route";

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="grid min-h-screen grid-rows-[1fr_auto] items-center justify-items-center bg-gray-50 p-6 pb-16 dark:bg-gray-950 sm:p-12">
        <main className="row-start-1 flex w-full max-w-3xl flex-col items-center gap-8 text-center">
          <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(2,132,199,0.55)] dark:border-slate-800 dark:bg-slate-950">
            <div className="absolute inset-0 bg-sky-50/70 dark:bg-sky-950/25" />
            <div className="relative flex flex-col items-center justify-center gap-5 px-6 py-10 sm:px-10 sm:py-12">
              <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                <Image
                  src="/nuovo-logo.jpeg"
                  alt="Antonelli & Zanni Refrigerazione"
                  width={760}
                  height={240}
                  priority
                  className="h-auto w-[240px] sm:w-[340px]"
                />
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
                  Dashboard
                </h1>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 sm:text-base">

          <p className="max-w-2xl text-base text-slate-700 dark:text-slate-300 sm:text-lg">
            Benvenuto nel sistema di gestione interventi. Utilizza il menu in alto per navigare.
          </p>
        </main>

        <MadeWithDyad />
      </div>
    </ProtectedRoute>
  );
}