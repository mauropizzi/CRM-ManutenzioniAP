"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Technician } from '@/types/technician';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TechnicianContextType {
  technicians: Technician[];
  loading: boolean;
  error: string | null;
  refreshTechnicians: () => Promise<void>;
  createTechnician: (technician: Omit<Technician, 'id'>) => Promise<void>;
  updateTechnician: (id: string, technician: Partial<Technician>) => Promise<void>;
  deleteTechnician: (id: string) => Promise<void>;
  hasFetched: boolean;
}

const TechnicianContext = createContext<TechnicianContextType | undefined>(undefined);

export function TechnicianProvider({ children }: { children: React.ReactNode }) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchTechnicians = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.fetchTechnicians();
      setTechnicians(data);
      setHasFetched(true);
    } catch (error: any) {
      console.error('Error fetching technicians:', error);
      setError(error.message);
      toast.error(`Errore nel caricamento dei tecnici: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTechnicians = useCallback(async () => {
    // Invalidate cache before refreshing
    apiClient.invalidate('technicians');
    await fetchTechnicians();
  }, [fetchTechnicians]);

  const createTechnician = useCallback(async (technician: Omit<Technician, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('technicians')
        .insert([technician])
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately
      setTechnicians((prev) => [...prev, data]);
      
      // Invalidate cache
      apiClient.invalidate('technicians');
      
      toast.success('Tecnico creato con successo');
    } catch (error: any) {
      toast.error(`Errore nella creazione del tecnico: ${error.message}`);
      throw error;
    }
  }, []);

  const updateTechnician = useCallback(async (id: string, updates: Partial<Technician>) => {
    try {
      const { data, error } = await supabase
        .from('technicians')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately
      setTechnicians((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...data } : t))
      );
      
      // Invalidate cache
      apiClient.invalidate('technicians');
      
      toast.success('Tecnico aggiornato con successo');
    } catch (error: any) {
      toast.error(`Errore nell'aggiornamento del tecnico: ${error.message}`);
      throw error;
    }
  }, []);

  const deleteTechnician = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('technicians').delete().eq('id', id);

      if (error) throw error;

      // Update local state immediately
      setTechnicians((prev) => prev.filter((t) => t.id !== id));
      
      // Invalidate cache
      apiClient.invalidate('technicians');
      
      toast.success('Tecnico eliminato con successo');
    } catch (error: any) {
      toast.error(`Errore nell'eliminazione del tecnico: ${error.message}`);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!hasFetched) {
      fetchTechnicians();
    }
  }, [hasFetched, fetchTechnicians]);

  return (
    <TechnicianContext.Provider
      value={{
        technicians,
        loading,
        error,
        refreshTechnicians,
        createTechnician,
        updateTechnician,
        deleteTechnician,
        hasFetched,
      }}
    >
      {children}
    </TechnicianContext.Provider>
  );
}

export function useTechnicians() {
  const context = useContext(TechnicianContext);
  if (!context) {
    throw new Error('useTechnicians must be used within a TechnicianProvider');
  }
  return context;
}