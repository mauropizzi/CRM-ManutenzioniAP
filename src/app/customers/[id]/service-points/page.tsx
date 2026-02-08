"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { ProtectedRoute } from "@/components/protected-route";
import { useServicePoints } from "@/context/service-point-context";
import { Loader2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ServicePointsListPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { servicePoints, loading, deleteServicePoint } = useServicePoints();

  const pointsForCustomer = useMemo(
    () => servicePoints.filter((p) => p.customer_id === id),
    [servicePoints, id]
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Punti di Servizio</h1>
            <div className="flex gap-2">
              <Link href={`/customers/${id}/service-points/new`}>
                <Button>Nuovo Punto di Servizio</Button>
              </Link>
              <Button variant="outline" onClick={() => router.push("/customers")}>Indietro</Button>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center p-8 bg-white rounded-lg shadow">
                <Loader2 className="animate-spin text-blue-600" />
              </div>
            ) : pointsForCustomer.length === 0 ? (
              <div className="rounded-lg bg-white p-6 shadow">
                <p className="text-gray-600">Nessun punto di servizio per questo cliente.</p>
              </div>
            ) : (
              pointsForCustomer.map((p) => (
                <div key={p.id} className="rounded-lg bg-white p-4 shadow flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{p.nome_punto_servizio}</h3>
                    <p className="text-sm text-gray-600">{p.indirizzo} {p.citta ? `— ${p.citta}` : ""}</p>
                    <p className="text-sm text-gray-600 mt-1">Tipi impianto: {(p.tipo_impianti || []).join(", ")}</p>
                    <p className="text-sm text-gray-600">Marche: {(p.marche || []).join(", ")}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Link href={`/customers/${id}/service-points/${p.id}/edit`}>
                      <Button variant="outline">Modifica</Button>
                    </Link>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        await deleteServicePoint(p.id);
                      }}
                    >
                      Elimina
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}