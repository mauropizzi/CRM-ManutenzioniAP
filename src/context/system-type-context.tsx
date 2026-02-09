"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth-context';
import type { SystemType } from '@/types/system-type';

interface SystemTypeContextValue {
  systemTypes: SystemType[];
  loading: boolean;
  refresh: () => Promise<void>;
  addSystemType: (name: string) => Promise<void>;
  updateSystemType: (id: string, name: string) => Promise<void>;
  deleteSystemType: (id: string) => Promise<void>;
}

const SystemTypeContext = createContext<SystemTypeContextValue | undefined>(undefined);

export function SystemTypeProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [systemTypes, setSystemTypes] = useState<SystemType[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_types')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setSystemTypes((data as SystemType[]) || []);
    } catch (err: any) {
      if (String(err?.message || '').includes('AbortError')) return;
      console.error('[system-type-context] Error fetching system types:', err);
      toast.error(err?.message || 'Errore nel caricamento dei tipi impianto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      refresh();
    } else if (!authLoading && !user) {
      setSystemTypes([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  const addSystemType = async (name: string) => {
    const cleanName = name.trim();
    if (!cleanName) {
      toast.error('Inserisci un nome');
      return;
    }

    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!authData.user) throw new Error('Devi essere autenticato');

      const { error } = await supabase.from('system_types').insert({
        user_id: authData.user.id,
        name: cleanName,
      });

      if (error) throw error;
      toast.success('Tipo impianto creato');
      await refresh();
    } catch (err: any) {
      console.error('[system-type-context] Error adding system type:', err);
      if (err?.code === '23505') {
        toast.error('Questo tipo impianto esiste già');
        return;
      }
      toast.error(err?.message || 'Errore nella creazione del tipo impianto');
    }
  };

  const updateSystemType = async (id: string, name: string) => {
    const cleanName = name.trim();
    if (!cleanName) {
      toast.error('Inserisci un nome');
      return;
    }

    try {
      const { error } = await supabase
        .from('system_types')
        .update({ name: cleanName })
        .eq('id', id);

      if (error) throw error;
      toast.success('Tipo impianto aggiornato');
      await refresh();
    } catch (err: any) {
      console.error('[system-type-context] Error updating system type:', err);
      if (err?.code === '23505') {
        toast.error('Questo tipo impianto esiste già');
        return;
      }
      toast.error(err?.message || 'Errore nell\'aggiornamento del tipo impianto');
    }
  };

  const deleteSystemType = async (id: string) => {
    try {
      const { error } = await supabase.from('system_types').delete().eq('id', id);
      if (error) throw error;
      toast.success('Tipo impianto eliminato');
      await refresh();
    } catch (err: any) {
      console.error('[system-type-context] Error deleting system type:', err);
      toast.error(err?.message || 'Errore nell\'eliminazione del tipo impianto');
    }
  };

  return (
    <SystemTypeContext.Provider
      value={{ systemTypes, loading, refresh, addSystemType, updateSystemType, deleteSystemType }}
    >
      {children}
    </SystemTypeContext.Provider>
  );
}

export function useSystemTypes() {
  const ctx = useContext(SystemTypeContext);
  if (!ctx) throw new Error('useSystemTypes must be used within SystemTypeProvider');
  return ctx;
}
