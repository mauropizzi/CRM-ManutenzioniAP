"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { SystemType } from '@/types/system-type';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type SystemTypeCreateInput = Omit<SystemType, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

interface SystemTypeContextType {
  systemTypes: SystemType[];
  loading: boolean;
  error: string | null;
  refreshSystemTypes: () => Promise<void>;
  createSystemType: (systemType: SystemTypeCreateInput) => Promise<void>;
  updateSystemType: (id: string, systemType: Partial<SystemType>) => Promise<void>;
  deleteSystemType: (id: string) => Promise<void>;
  hasFetched: boolean;
}

const SystemTypeContext = createContext<SystemTypeContextType | undefined>(undefined);

export function SystemTypeProvider({ children }: { children: React.ReactNode }) {
  const [systemTypes, setSystemTypes] = useState<SystemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchSystemTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.fetchSystemTypes();
      setSystemTypes(data);
      setHasFetched(true);
    } catch (error: any) {
      console.error('Error fetching system types:', error);
      setError(error.message);
      toast.error(`Errore nel caricamento dei tipi di impianto: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSystemTypes = useCallback(async () => {
    // Invalidate cache before refreshing
    apiClient.invalidate('system-types');
    await fetchSystemTypes();
  }, [fetchSystemTypes]);

  const createSystemType = async (systemType: SystemTypeCreateInput) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('system_types')
      .insert([{ ...systemType, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    setSystemTypes(prev => [...prev, data as SystemType]);
  };

  const updateSystemType = useCallback(async (id: string, updates: Partial<SystemType>) => {
    try {
      const { data, error } = await supabase
        .from('system_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately
      setSystemTypes((prev) =>
        prev.map((st) => (st.id === id ? { ...st, ...data } : st))
      );
      
      // Invalidate cache
      apiClient.invalidate('system-types');
      
      toast.success('Tipo impianto aggiornato con successo');
    } catch (error: any) {
      toast.error(`Errore nell'aggiornamento del tipo impianto: ${error.message}`);
      throw error;
    }
  }, []);

  const deleteSystemType = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('system_types').delete().eq('id', id);

      if (error) throw error;

      // Update local state immediately
      setSystemTypes((prev) => prev.filter((st) => st.id !== id));
      
      // Invalidate cache
      apiClient.invalidate('system-types');
      
      toast.success('Tipo impianto eliminato con successo');
    } catch (error: any) {
      toast.error(`Errore nell'eliminazione del tipo impianto: ${error.message}`);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!hasFetched) {
      fetchSystemTypes();
    }
  }, [hasFetched, fetchSystemTypes]);

  return (
    <SystemTypeContext.Provider
      value={{
        systemTypes,
        loading,
        error,
        refreshSystemTypes,
        createSystemType,
        updateSystemType,
        deleteSystemType,
        hasFetched,
      }}
    >
      {children}
    </SystemTypeContext.Provider>
  );
}

export function useSystemTypes() {
  const context = useContext(SystemTypeContext);
  if (!context) {
    throw new Error('useSystemTypes must be used within a SystemTypeProvider');
  }
  return context;
}