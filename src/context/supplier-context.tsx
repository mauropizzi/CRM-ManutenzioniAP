"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Supplier } from '@/types/supplier';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SupplierContextType {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  refreshSuppliers: () => Promise<void>;
  createSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  hasFetched: boolean;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

export function SupplierProvider({ children }: { children: React.ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.fetchSuppliers();
      setSuppliers(data);
      setHasFetched(true);
    } catch (error: any) {
      console.error('Error fetching suppliers:', error);
      setError(error.message);
      toast.error(`Errore nel caricamento dei fornitori: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSuppliers = useCallback(async () => {
    // Invalidate cache before refreshing
    apiClient.invalidate('suppliers');
    await fetchSuppliers();
  }, [fetchSuppliers]);

  const createSupplier = useCallback(async (supplier: Omit<Supplier, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplier])
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately
      setSuppliers((prev) => [...prev, data]);
      
      // Invalidate cache
      apiClient.invalidate('suppliers');
      
      toast.success('Fornitore creato con successo');
    } catch (error: any) {
      toast.error(`Errore nella creazione del fornitore: ${error.message}`);
      throw error;
    }
  }, []);

  const updateSupplier = useCallback(async (id: string, updates: Partial<Supplier>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately
      setSuppliers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...data } : s))
      );
      
      // Invalidate cache
      apiClient.invalidate('suppliers');
      
      toast.success('Fornitore aggiornato con successo');
    } catch (error: any) {
      toast.error(`Errore nell'aggiornamento del fornitore: ${error.message}`);
      throw error;
    }
  }, []);

  const deleteSupplier = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);

      if (error) throw error;

      // Update local state immediately
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      
      // Invalidate cache
      apiClient.invalidate('suppliers');
      
      toast.success('Fornitore eliminato con successo');
    } catch (error: any) {
      toast.error(`Errore nell'eliminazione del fornitore: ${error.message}`);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!hasFetched) {
      fetchSuppliers();
    }
  }, [hasFetched, fetchSuppliers]);

  return (
    <SupplierContext.Provider
      value={{
        suppliers,
        loading,
        error,
        refreshSuppliers,
        createSupplier,
        updateSupplier,
        deleteSupplier,
        hasFetched,
      }}
    >
      {children}
    </SupplierContext.Provider>
  );
}

export function useSuppliers() {
  const context = useContext(SupplierContext);
  if (!context) {
    throw new Error('useSuppliers must be used within a SupplierProvider');
  }
  return context;
}