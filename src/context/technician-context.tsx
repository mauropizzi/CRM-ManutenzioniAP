"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Technician } from '@/types/technician';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth-context';

interface TechnicianContextType {
  technicians: Technician[];
  addTechnician: (technician: Omit<Technician, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTechnician: (technician: Technician) => Promise<void>;
  deleteTechnician: (id: string) => Promise<void>;
  loading: boolean;
}

const TechnicianContext = createContext<TechnicianContextType | undefined>(undefined);

export const TechnicianProvider = ({ children }: { children: ReactNode }) => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isMounted = useRef(true);

  const fetchTechnicians = async () => {
    if (!isMounted.current) return;
    try {
      const { data, error } = await supabase.from('technicians').select('*').order('created_at', { ascending: false });
      if (!isMounted.current) return;
      if (error) {
        if (error.name === 'AbortError' || error.message?.includes('aborted')) return;
        toast.error(`Errore nel caricamento dei tecnici: ${error.message}`);
        return;
      }
      if (data) setTechnicians(data as Technician[]);
    } catch (error: any) {
      if (!isMounted.current) return;
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) return;
      toast.error(`Errore nel caricamento dei tecnici: ${error?.message || 'Unknown error'}`);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    if (user) {
      fetchTechnicians();
    } else {
      setTechnicians([]);
      setLoading(false);
    }
    return () => { isMounted.current = false; };
  }, [user]);

  const addTechnician = async (newTechnician: Omit<Technician, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) { toast.error("Devi essere autenticato per aggiungere un tecnico"); return; }
      const { data, error } = await supabase.from('technicians').insert([{ ...newTechnician, user_id: user.id }]).select().single();
      if (error) { toast.error(`Errore nell'aggiunta del tecnico: ${error.message}`); return; }
      if (data) { setTechnicians((prev) => [data as Technician, ...prev]); toast.success("Tecnico aggiunto con successo!"); }
    } catch (error: any) {
      toast.error(`Errore nell'aggiunta del tecnico: ${error?.message || 'Unknown error'}`);
    }
  };

  const updateTechnician = async (updatedTechnician: Technician) => {
    try {
      const { data, error } = await supabase.from('technicians').update(updatedTechnician).eq('id', updatedTechnician.id).select().single();
      if (error) { toast.error(`Errore nell'aggiornamento del tecnico: ${error.message}`); return; }
      if (data) {
        setTechnicians((prev) => prev.map((t) => t.id === updatedTechnician.id ? (data as Technician) : t));
        toast.success("Tecnico aggiornato con successo!");
      }
    } catch (error: any) {
      toast.error(`Errore nell'aggiornamento del tecnico: ${error?.message || 'Unknown error'}`);
    }
  };

  const deleteTechnician = async (id: string) => {
    try {
      const { error } = await supabase.from('technicians').delete().eq('id', id);
      if (error) { toast.error(`Errore nell'eliminazione del tecnico: ${error.message}`); return; }
      setTechnicians((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tecnico eliminato con successo!");
    } catch (error: any) {
      toast.error(`Errore nell'eliminazione del tecnico: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <TechnicianContext.Provider value={{ technicians, addTechnician, updateTechnician, deleteTechnician, loading }}>
      {children}
    </TechnicianContext.Provider>
  );
};

export const useTechnicians = () => {
  const context = useContext(TechnicianContext);
  if (context === undefined) throw new Error('useTechnicians must be used within a TechnicianProvider');
  return context;
};