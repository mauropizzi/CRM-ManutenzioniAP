"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      fetchTechnicians();
    } else if (!user) {
      setTechnicians([]);
      setLoading(false);
    }
  }, [user]);

  const fetchTechnicians = async () => {
    try {
      console.log('Fetching technicians from Supabase...');
      
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (String(error?.message || '').includes('AbortError')) {
          return;
        }
        console.error('Supabase error fetching technicians:', error);
        toast.error(`Errore nel caricamento dei tecnici: ${error.message}`);
        return;
      }

      console.log('Technicians fetched:', data);
      
      if (data) {
        setTechnicians(data as Technician[]);
      }
    } catch (error: any) {
      if (String(error?.message || '').includes('AbortError')) {
        return;
      }
      console.error('Exception fetching technicians:', error);
      toast.error(`Errore nel caricamento dei tecnici: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const addTechnician = async (newTechnician: Omit<Technician, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) {
        toast.error("Devi essere autenticato per aggiungere un tecnico");
        return;
      }

      const technicianWithUserId = {
        ...newTechnician,
        user_id: user.id,
      };

      console.log('Adding technician:', technicianWithUserId);
      
      const { data, error } = await supabase
        .from('technicians')
        .insert([technicianWithUserId])
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding technician:', error);
        toast.error(`Errore nell'aggiunta del tecnico: ${error.message}`);
        return;
      }

      console.log('Technician added:', data);

      if (data) {
        setTechnicians((prev) => [data as Technician, ...prev]);
        toast.success("Tecnico aggiunto con successo!");
      }
    } catch (error: any) {
      console.error('Exception adding technician:', error);
      toast.error(`Errore nell'aggiunta del tecnico: ${error?.message || 'Unknown error'}`);
    }
  };

  const updateTechnician = async (updatedTechnician: Technician) => {
    try {
      console.log('Updating technician:', updatedTechnician);
      
      const { data, error } = await supabase
        .from('technicians')
        .update(updatedTechnician)
        .eq('id', updatedTechnician.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating technician:', error);
        toast.error(`Errore nell'aggiornamento del tecnico: ${error.message}`);
        return;
      }

      console.log('Technician updated:', data);

      if (data) {
        setTechnicians((prev) =>
          prev.map((technician) =>
            technician.id === updatedTechnician.id ? (data as Technician) : technician
          )
        );
        toast.success("Tecnico aggiornato con successo!");
      }
    } catch (error: any) {
      console.error('Exception updating technician:', error);
      toast.error(`Errore nell'aggiornamento del tecnico: ${error?.message || 'Unknown error'}`);
    }
  };

  const deleteTechnician = async (id: string) => {
    try {
      console.log('Deleting technician:', id);
      
      const { error } = await supabase
        .from('technicians')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting technician:', error);
        toast.error(`Errore nell'eliminazione del tecnico: ${error.message}`);
        return;
      }

      setTechnicians((prev) => prev.filter((technician) => technician.id !== id));
      toast.success("Tecnico eliminato con successo!");
    } catch (error: any) {
      console.error('Exception deleting technician:', error);
      toast.error(`Errore nell'eliminazione del tecnico: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <TechnicianContext.Provider value={{ 
      technicians, 
      addTechnician, 
      updateTechnician, 
      deleteTechnician,
      loading 
    }}>
      {children}
    </TechnicianContext.Provider>
  );
};

export const useTechnicians = () => {
  const context = useContext(TechnicianContext);
  if (context === undefined) {
    throw new Error('useTechnicians must be used within a TechnicianProvider');
  }
  return context;
};