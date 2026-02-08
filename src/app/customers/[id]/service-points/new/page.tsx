"use client";

import React from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ServicePointForm, ServicePointFormValues } from "@/components/service-point-form";
import { useServicePoints } from "@/context/service-point-context";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/protected-route";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function NewServicePointPage({ params }: PageProps) {
  const { id } = use(params);
  const { addServicePoint } = useServicePoints();
  const router = useRouter();

  const handleSubmit = async (data: ServicePointFormValues) => {
    // Ensure arrays are normalized
    const payload = {
      ...data,
      tipo_impianti: data.tipo_impianti?.filter(Boolean) ?? [],
      marche: data.marche?.filter(Boolean) ?? [],
    };

    await addServicePoint(payload);
    router.push(`/customers/${id}/service-points`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Nuovo Punto di Servizio</h1>
            <Link href={`/customers/${id}/service-points`}>
              <Button variant="outline">Indietro</Button>
            </Link>
          </div>

          <ServicePointForm
            initialData={{
              customer_id: id,
            }}
            onSubmit={handleSubmit}
          />
        </div>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}