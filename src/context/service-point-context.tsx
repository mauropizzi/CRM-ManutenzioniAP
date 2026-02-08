"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ServicePoint } from "@/types/service-point";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

interface ServicePointContextType {
  servicePoints: ServicePoint[];
  addServicePoint: (sp: Omit<ServicePoint, "id" | "user_id" | "created_at" | "updated_at">) => Promise<void>;
  updateServicePoint: (sp: ServicePoint) => Promise<void>;
  deleteServicePoint: (id: string) => Promise<void>;
  refreshServicePoints: () => Promise<void>;
  loading: boolean;
}

const ServicePointContext = createContext<ServicePointContextType | undefined>(undefined);

export const ServicePointProvider = ({ children }: { children: ReactNode }) => {
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshServicePoints = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_points")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error(`Errore nel caricamento dei Punti di Servizio: ${error.message}`);
        return;
      }

      setServicePoints((data as ServicePoint[]) || []);
    } catch (error: any) {
      toast.error(`Errore nel caricamento dei Punti di Servizio: ${error?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      refreshServicePoints();
    } else if (!user) {
      setServicePoints([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addServicePoint = async (newSP: Omit<ServicePoint, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData.user;
      if (!currentUser) {
        toast.error("Devi essere autenticato per aggiungere un punto di servizio");
        return;
      }

      const toInsert = {
        ...newSP,
        user_id: currentUser.id,
      };

      const { data, error } = await supabase
        .from("service_points")
        .insert([toInsert])
        .select()
        .single();

      if (error) {
        toast.error(`Errore durante la creazione: ${error.message}`);
        return;
      }

      if (data) {
        setServicePoints((prev) => [data as ServicePoint, ...prev]);
        toast.success("Punto di servizio aggiunto");
      }
    } catch (error: any) {
      toast.error(error?.message || "Errore durante la creazione del punto di servizio");
    }
  };

  const updateServicePoint = async (sp: ServicePoint) => {
    try {
      const { data, error } = await supabase
        .from("service_points")
        .update(sp)
        .eq("id", sp.id)
        .select()
        .single();

      if (error) {
        toast.error(`Errore durante l'aggiornamento: ${error.message}`);
        return;
      }

      if (data) {
        setServicePoints((prev) => prev.map((p) => (p.id === sp.id ? (data as ServicePoint) : p)));
        toast.success("Punto di servizio aggiornato");
      }
    } catch (error: any) {
      toast.error(error?.message || "Errore durante l'aggiornamento del punto di servizio");
    }
  };

  const deleteServicePoint = async (id: string) => {
    try {
      const { error } = await supabase.from("service_points").delete().eq("id", id);
      if (error) {
        toast.error(`Errore durante l'eliminazione: ${error.message}`);
        return;
      }
      setServicePoints((prev) => prev.filter((p) => p.id !== id));
      toast.success("Punto di servizio eliminato");
    } catch (error: any) {
      toast.error(error?.message || "Errore durante l'eliminazione del punto di servizio");
    }
  };

  return (
    <ServicePointContext.Provider
      value={{
        servicePoints,
        addServicePoint,
        updateServicePoint,
        deleteServicePoint,
        refreshServicePoints,
        loading,
      }}
    >
      {children}
    </ServicePointContext.Provider>
  );
};

export const useServicePoints = () => {
  const ctx = useContext(ServicePointContext);
  if (!ctx) {
    throw new Error("useServicePoints must be used within ServicePointProvider");
  }
  return ctx;
};