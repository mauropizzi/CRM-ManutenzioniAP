"use client";

import React from "react";
import SupplierForm, { SupplierFormValues } from "@/components/supplier-form";
import { SupplierProvider, useSuppliers } from "@/context/supplier-context";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { use } from "react";
import { toast } from "sonner";

interface EditSupplierPageProps {
  params: Promise<{ id: string }>;
}

const EditSupplierContent: React.FC<{ supplierId: string }> = ({ supplierId }) => {
  const { suppliers, updateSupplier } = useSuppliers();
  const router = useRouter();

  const supplierToEdit = suppliers.find((s) => s.id === supplierId);
  if (!supplierToEdit) {
    notFound();
  }

  const handleSubmit = async (data: SupplierFormValues) => {
    try {
      await updateSupplier({ ...supplierToEdit!, ...data });
      router.push("/suppliers");
    } catch (error: any) {
      const msg = error?.message || "Errore durante l'aggiornamento del fornitore.";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Modifica Fornitore</h1>
        <Link href="/suppliers">
          <Button variant="outline">Indietro</Button>
        </Link>
      </div>
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
        <SupplierForm
          initialData={{
            ragione_sociale: supplierToEdit!.ragione_sociale,
            partita_iva: supplierToEdit!.partita_iva ?? "",
            codice_fiscale: supplierToEdit!.codice_fiscale ?? "",
            indirizzo: supplierToEdit!.indirizzo ?? "",
            cap: supplierToEdit!.cap ?? "",
            citta: supplierToEdit!.citta ?? "",
            provincia: supplierToEdit!.provincia ?? "",
            telefono: supplierToEdit!.telefono ?? "",
            email: supplierToEdit!.email ?? "",
            pec: supplierToEdit!.pec ?? "",
            tipo_servizio: supplierToEdit!.tipo_servizio ?? "",
            attivo: supplierToEdit!.attivo ?? true,
            note: supplierToEdit!.note ?? "",
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default function EditSupplierPage({ params }: EditSupplierPageProps) {
  const { id } = use(params);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <SupplierProvider>
          <EditSupplierContent supplierId={id} />
        </SupplierProvider>
      </div>
      <Toaster />
    </div>
  );
}