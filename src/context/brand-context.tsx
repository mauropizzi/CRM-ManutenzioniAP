"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth-context';
import type { Brand } from '@/types/brand';

interface BrandContextValue {
  brands: Brand[];
  loading: boolean;
  refresh: () => Promise<void>;
  addBrand: (name: string) => Promise<void>;
  updateBrand: (id: string, name: string) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
}

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setBrands((data as Brand[]) || []);
    } catch (err: any) {
      if (String(err?.message || '').includes('AbortError')) return;
      console.error('[brand-context] Error fetching brands:', err);
      toast.error(err?.message || 'Errore nel caricamento delle marche');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      refresh();
    } else if (!authLoading && !user) {
      setBrands([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  const addBrand = async (name: string) => {
    const cleanName = name.trim();
    if (!cleanName) {
      toast.error('Inserisci un nome');
      return;
    }

    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!authData.user) throw new Error('Devi essere autenticato');

      const { error } = await supabase.from('brands').insert({
        user_id: authData.user.id,
        name: cleanName,
      });

      if (error) throw error;
      toast.success('Marca creata');
      await refresh();
    } catch (err: any) {
      console.error('[brand-context] Error adding brand:', err);
      if (err?.code === '23505') {
        toast.error('Questa marca esiste già');
        return;
      }
      toast.error(err?.message || 'Errore nella creazione della marca');
    }
  };

  const updateBrand = async (id: string, name: string) => {
    const cleanName = name.trim();
    if (!cleanName) {
      toast.error('Inserisci un nome');
      return;
    }

    try {
      const { error } = await supabase
        .from('brands')
        .update({ name: cleanName })
        .eq('id', id);

      if (error) throw error;
      toast.success('Marca aggiornata');
      await refresh();
    } catch (err: any) {
      console.error('[brand-context] Error updating brand:', err);
      if (err?.code === '23505') {
        toast.error('Questa marca esiste già');
        return;
      }
      toast.error(err?.message || 'Errore nell\'aggiornamento della marca');
    }
  };

  const deleteBrand = async (id: string) => {
    try {
      const { error } = await supabase.from('brands').delete().eq('id', id);
      if (error) throw error;
      toast.success('Marca eliminata');
      await refresh();
    } catch (err: any) {
      console.error('[brand-context] Error deleting brand:', err);
      toast.error(err?.message || 'Errore nell\'eliminazione della marca');
    }
  };

  return (
    <BrandContext.Provider
      value={{ brands, loading, refresh, addBrand, updateBrand, deleteBrand }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrands() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error('useBrands must be used within BrandProvider');
  return ctx;
}
