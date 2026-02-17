"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Material } from '@/types/material';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MaterialContextType {
  materials: Material[];
  loading: boolean;
  error: string | null;
  refreshMaterials: () => Promise<void>;
  createMaterial: (material: Omit<Material, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateMaterial: (id: string, material: Partial<Material>) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  hasFetched: boolean;
}

const MaterialContext = createContext<MaterialContextType | undefined>(undefined);

export function MaterialProvider({ children }: { children: React.ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.fetchMaterials();
      setMaterials(data);
      setHasFetched(true);
    } catch (error: any) {
      console.error('Error fetching materials:', error);
      setError(error.message);
      toast.error(`Errore nel caricamento dei materiali: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMaterials = useCallback(async () => {
    // Invalidate cache before refreshing
    apiClient.invalidate('materials');
    await fetchMaterials();
  }, [fetchMaterials]);

  const createMaterial = useCallback(async (material: Omit<Material, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .insert([material])
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately
      setMaterials((prev) => [...prev, data]);
      
      // Invalidate cache so next fetch gets fresh data
      apiClient.invalidate('materials');
      
      toast.success('Materiale creato con successo');
    } catch (error: any) {
      toast.error(`Errore nella creazione del materiale: ${error.message}`);
      throw error;
    }
  }, []);

  const updateMaterial = useCallback(async (id: string, updates: Partial<Material>) => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately
      setMaterials((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...data } : m))
      );
      
      // Invalidate cache
      apiClient.invalidate('materials');
      
      toast.success('Materiale aggiornato con successo');
    } catch (error: any) {
      toast.error(`Errore nell'aggiornamento del materiale: ${error.message}`);
      throw error;
    }
  }, []);

  const deleteMaterial = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('materials').delete().eq('id', id);

      if (error) throw error;

      // Update local state immediately
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      
      // Invalidate cache
      apiClient.invalidate('materials');
      
      toast.success('Materiale eliminato con successo');
    } catch (error: any) {
      toast.error(`Errore nell'eliminazione del materiale: ${error.message}`);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!hasFetched) {
      fetchMaterials();
    }
  }, [hasFetched, fetchMaterials]);

  return (
    <MaterialContext.Provider
      value={{
        materials,
        loading,
        error,
        refreshMaterials,
        createMaterial,
        updateMaterial,
        deleteMaterial,
        hasFetched,
      }}
    >
      {children}
    </MaterialContext.Provider>
  );
}

export function useMaterials() {
  const context = useContext(MaterialContext);
  if (!context) {
    throw new Error('useMaterials must be used within a MaterialProvider');
  }
  return context;
}