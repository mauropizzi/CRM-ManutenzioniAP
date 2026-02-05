"use client";

import React, { useEffect, useState, use } from "react";
import SupplierForm, { SupplierFormValues } from "@/components/supplier-form";
import { SupplierProvider, useSuppliers } from "@/context/supplier-context";
import { useRouter, notFound } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Supplier } from "@/types/supplier";
import { supabase } from "@/integrations/supabase/client";

interface EditSupplierPageProps {
  params: Promise<{ id: string }>;
}

const EditSupplierContent: React.FC<{ supplierId: string }> = ({ supplierId }) => {
  const { suppliers, loading, updateSupplier } = useSuppliers();
  const router = useRouter();

  const [singleSupplier, setSingleSupplier] = useState<Supplier | null>(null);
  const [loadingOne, setLoadingOne] = useState<boolean>(false);

  const supplierToEdit = suppliers.find((s) => s.id === supplierId);
  const currentSupplier = supplierToEdit ?? singleSupplier;

  useEffect(() => {
    // Fallback: se non trovato nel contesto e non stiamo già caricando, prova a caricare il singolo fornitore
    if (!supplierToEdit && supplierId && !loading) {
      setLoadingOne(true);
      supabase
        .from("suppliers")
        .select("*")
        .eq("id", supplierId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            // Non mostrare 404 immediatamente: lascia l'utente sulla pagina e mostra un toast
            toast.error(error.message || "Impossibile caricare il fornitore");
            setSingleSupplier(null);
          } else {
            setSingleSupplier((data as Supplier) ?? null);
          }
        })
        .then(() => setLoadingOne(false));
    }
  }, [supplierId, supplierToEdit, loading]);

  if (loading || loadingOne) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border bg-white p-6 dark:bg-gray-900">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Caricamento fornitore...</span>
      </div>
    );
  }

  if (!currentSupplier) {
    // Se dopo i caricamenti non abbiamo il fornitore, allora 404
    notFound();
  }

  const handleSubmit = async (data: SupplierFormValues) => {
    try {
      await updateSupplier({ ...currentSupplier!, ...data });
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
            ragione_sociale: currentSupplier!.ragione_sociale,
            partita_iva: currentSupplier!.partita_iva ?? "",
            codice_fiscale: currentSupplier!.codice_fiscale ?? "",
            indirizzo: currentSupplier!.indirizzo ?? "",
            cap: currentSupplier!.cap ?? "",
            citta: currentSupplier!.citta ?? "",
            provincia: currentSupplier!.provincia ?? "",
            telefono: currentSupplier!.telefono ?? "",
            email: currentSupplier!.email ?? "",
            pec: currentSupplier!.pec ?? "",
            tipo_servizio: currentSupplier!.tipo_servizio ?? "",
            attivo: currentSupplier!.attivo ?? true,
            note: currentSupplier!.note ?? "",
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