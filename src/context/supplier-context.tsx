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
  const { user } = useAuth();
  const setupInProgress = useRef(false);

  const refresh = async () => {
    setLoading(true);
    try {
      console.log("[supplier-context] Fetching suppliers from Supabase...");
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("ragione_sociale", { ascending: true });

      if (error) throw error;
      setSuppliers(data || []);
      console.log("[supplier-context] Suppliers fetched:", data);
    } catch (err: any) {
      console.error("[supplier-context] Error fetching suppliers:", err);
      if (err?.code === "PGRST205") {
        // La tabella non esiste
        toast.info("Tabella 'suppliers' non trovata. Apri Setup e crea la tabella (2 click).");
        setSuppliers([]);
        // Facoltativo: ping function di setup per verificare stato
        if (!setupInProgress.current) {
          setupInProgress.current = true;
          try {
            const res = await ensureSuppliersTable();
            if (!res?.ok) {
              console.log("[supplier-context] Setup check:", res);
            }
          } catch (_) {}
          setupInProgress.current = false;
        }
      } else {
        toast.error(err?.message || "Errore nel caricamento fornitori");
        setSuppliers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [user?.id]);

  const addSupplier = async (
    supplier: Omit<Supplier, "id" | "user_id" | "created_at" | "updated_at">
  ) => {
    const payload = {
      ...supplier,
      user_id: user?.id ?? null,
      attivo: supplier.attivo ?? true,
    };

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
    <SupplierContext.Provider
      value={{ suppliers, loading, addSupplier, updateSupplier, deleteSupplier, refresh }}
    >
      {children}
    </SupplierContext.Provider>
  );
};

export const useSuppliers = () => {
  const ctx = useContext(SupplierContext);
  if (!ctx) throw new Error("useSuppliers must be used within SupplierProvider");
  return ctx;
}