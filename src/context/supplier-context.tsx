"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Supplier } from "@/types/supplier";
import { useAuth } from "@/context/auth-context";
import { ensureSuppliersTable } from "@/lib/suppliers-setup";

interface SupplierContextValue {
  suppliers: Supplier[];
  loading: boolean;
  addSupplier: (supplier: Omit<Supplier, "id" | "user_id" | "created_at" | "updated_at">) => Promise<void>;
  updateSupplier: (supplier: Supplier) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const SupplierContext = createContext<SupplierContextValue | undefined>(undefined);

export const SupplierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { user, loading: authLoading } = useAuth();
  const setupInProgress = useRef(false);
  // ✅ Questo ref tiene traccia se il componente è ancora montato
  const isMounted = useRef(true);

  const refresh = async () => {
    // ✅ Non fare nulla se il componente è stato smontato
    if (!isMounted.current) return;

    setLoading(true);
    try {
      console.log("[supplier-context] Fetching suppliers from Supabase...");
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("ragione_sociale", { ascending: true });

      // ✅ Controlla di nuovo dopo l'await (Chrome smonta/rimonta in StrictMode)
      if (!isMounted.current) return;

      if (error) throw error;
      setSuppliers(data || []);
    } catch (err: any) {
      if (!isMounted.current) return; // ✅ Ignora errori dopo lo smontaggio

      // ✅ Gestione corretta AbortError (controlla sia name che message)
      const isAbort =
        err?.name === "AbortError" ||
        err?.message?.includes("AbortError") ||
        err?.message?.includes("aborted");

      if (isAbort) {
        setSuppliers([]);
        return;
      }

      console.error("[supplier-context] Error fetching suppliers:", err);

      if (err?.code === "PGRST205") {
        if (!setupInProgress.current) {
          setupInProgress.current = true;
          toast.info("Inizializzazione fornitori in corso...");
          try {
            await ensureSuppliersTable();
            if (!isMounted.current) return; // ✅
            toast.success("Tabella fornitori creata!");
            const { data } = await supabase
              .from("suppliers")
              .select("*")
              .order("ragione_sociale", { ascending: true });
            if (!isMounted.current) return; // ✅
            setSuppliers(data || []);
          } catch (e: any) {
            if (!isMounted.current) return;
            console.error("[supplier-context] Setup failed:", e);
            toast.error(e?.message || "Impossibile creare la tabella fornitori.");
            setSuppliers([]);
          } finally {
            setupInProgress.current = false;
          }
        }
      } else {
        toast.error(err?.message || "Errore nel caricamento fornitori");
        setSuppliers([]);
      }
    } finally {
      // ✅ Aggiorna loading solo se ancora montato
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true; // ✅ Reset al montaggio

    if (!authLoading && user) {
      refresh();
    } else if (!authLoading && !user) {
      setSuppliers([]);
    }

    // ✅ Cleanup: segnala che il componente è smontato
    return () => {
      isMounted.current = false;
    };
  }, [user?.id, authLoading]);

  const addSupplier = async (
    supplier: Omit<Supplier, "id" | "user_id" | "created_at" | "updated_at">
  ) => {
    const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
    if (authErr) throw authErr;
    if (!authUser) throw new Error("Devi essere autenticato per salvare un fornitore");

    const payload = { ...supplier, user_id: authUser.id, attivo: supplier.attivo ?? true };
    const { error } = await supabase.from("suppliers").insert(payload);
    if (error) throw error;
    toast.success("Fornitore creato con successo");
    await refresh();
  };

  const updateSupplier = async (supplier: Supplier) => {
    const { id, ...rest } = supplier;
    const { error } = await supabase.from("suppliers").update(rest).eq("id", id);
    if (error) throw error;
    toast.success("Fornitore aggiornato con successo");
    await refresh();
  };

  const deleteSupplier = async (id: string) => {
    const { error } = await supabase.from("suppliers").delete().eq("id", id);
    if (error) throw error;
    toast.success("Fornitore eliminato");
    await refresh();
  };

  return (
    <SupplierContext.Provider value={{ suppliers, loading, addSupplier, updateSupplier, deleteSupplier, refresh }}>
      {children}
    </SupplierContext.Provider>
  );
};

export const useSuppliers = () => {
  const ctx = useContext(SupplierContext);
  if (!ctx) throw new Error("useSuppliers must be used within SupplierProvider");
  return ctx;
};