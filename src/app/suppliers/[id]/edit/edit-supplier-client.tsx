"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Supplier } from "@/types/supplier";
import SupplierForm, { SupplierFormValues } from "@/components/supplier-form";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSuppliers } from "@/context/supplier-context";
import { useAuth } from "@/context/auth-context";

export default function EditSupplierClient({ supplierId }: { supplierId: string }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { suppliers, loading: suppliersLoading, updateSupplier } = useSuppliers();

  const supplierFromContext = useMemo(
    () => suppliers.find((s) => s.id === supplierId) ?? null,
    [suppliers, supplierId]
  );

  const [singleSupplier, setSingleSupplier] = useState<Supplier | null>(null);
  const [loadingOne, setLoadingOne] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const currentSupplier = supplierFromContext ?? singleSupplier;

  const fetchOne = useCallback(async () => {
    if (!user) return;
    setLoadingOne(true);
    setLoadError(null);

    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .eq("id", supplierId)
      .single();

    if (error) {
      const msg = error.message || "Impossibile caricare il fornitore";
      setSingleSupplier(null);
      setLoadError(msg);
      return;
    }

    setSingleSupplier((data as Supplier) ?? null);
    setLoadingOne(false);
  }, [supplierId, user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    // Se non c'è nel contesto (es. fetch abortito / refresh) prova a caricarlo singolarmente
    if (!authLoading && user && !suppliersLoading && !supplierFromContext && supplierId) {
      fetchOne().catch((e) => {
        const msg = e?.message || "Errore imprevisto nel caricamento";
        setLoadError(msg);
      });
    }
  }, [authLoading, user, suppliersLoading, supplierFromContext, supplierId, fetchOne]);

  const handleSubmit = async (data: SupplierFormValues) => {
    if (!currentSupplier) return;

    try {
      await updateSupplier({ ...currentSupplier, ...data });
      toast.success("Fornitore aggiornato");
      router.push("/suppliers");
    } catch (error: any) {
      toast.error(error?.message || "Errore durante l'aggiornamento del fornitore.");
    }
  };

  if (authLoading || suppliersLoading || loadingOne) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-2xl border bg-white p-8 shadow-sm dark:bg-gray-900">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Caricamento…</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!currentSupplier) {
    return (
      <div className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm dark:bg-gray-900">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Fornitore non disponibile</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {loadError ?? "Non riesco a trovare questo fornitore (potrebbe non esistere o non hai i permessi)."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={fetchOne} className="bg-blue-600 hover:bg-blue-700">
            Riprova
          </Button>
          <Button variant="outline" asChild>
            <Link href="/suppliers">Torna ai fornitori</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Modifica Fornitore</h1>
        <Button variant="outline" asChild>
          <Link href="/suppliers">Indietro</Link>
        </Button>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10">
        <SupplierForm
          initialData={{
            ragione_sociale: currentSupplier.ragione_sociale,
            partita_iva: currentSupplier.partita_iva ?? "",
            codice_fiscale: currentSupplier.codice_fiscale ?? "",
            indirizzo: currentSupplier.indirizzo ?? "",
            cap: currentSupplier.cap ?? "",
            citta: currentSupplier.citta ?? "",
            provincia: currentSupplier.provincia ?? "",
            telefono: currentSupplier.telefono ?? "",
            email: currentSupplier.email ?? "",
            pec: currentSupplier.pec ?? "",
            tipo_servizio: currentSupplier.tipo_servizio ?? "",
            attivo: currentSupplier.attivo ?? true,
            note: currentSupplier.note ?? "",
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
