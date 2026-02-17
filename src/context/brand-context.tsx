"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Brand } from '@/types/brand';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BrandContextType {
  brands: Brand[];
  loading: boolean;
  error: string | null;
  refreshBrands: () => Promise<void>;
  createBrand: (brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBrand: (id: string, brand: Partial<Brand>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
  hasFetched: boolean;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.fetchBrands();
      setBrands(data);
      setHasFetched(true);
    } catch (error: any) {
      console.error('Error fetching brands:', error);
      setError(error.message);
      toast.error(`Errore nel caricamento delle marche: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshBrands = useCallback(async () => {
    // Invalidate cache before refreshing
    apiClient.invalidate('brands');
    await fetchBrands();
  }, [fetchBrands]);

  const createBrand = async (brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('brands')
      .insert([{ ...brand, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    setBrands(prev => [...prev, data as Brand]);
  };

  const updateBrand = useCallback(async (id: string, updates: Partial<Brand>) => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately
      setBrands((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...data } : b))
      );
      
      // Invalidate cache
      apiClient.invalidate('brands');
      
      toast.success('Marca aggiornata con successo');
    } catch (error: any) {
      toast.error(`Errore nell'aggiornamento della marca: ${error.message}`);
      throw error;
    }
  }, []);

  const deleteBrand = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('brands').delete().eq('id', id);

      if (error) throw error;

      // Update local state immediately
      setBrands((prev) => prev.filter((b) => b.id !== id));
      
      // Invalidate cache
      apiClient.invalidate('brands');
      
      toast.success('Marca eliminata con successo');
    } catch (error: any) {
      toast.error(`Errore nell'eliminazione della marca: ${error.message}`);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!hasFetched) {
      fetchBrands();
    }
  }, [hasFetched, fetchBrands]);

  return (
    <BrandContext.Provider
      value={{
        brands,
        loading,
        error,
        refreshBrands,
        createBrand,
        updateBrand,
        deleteBrand,
        hasFetched,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrands() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrands must be used within a BrandProvider');
  }
  return context;
}