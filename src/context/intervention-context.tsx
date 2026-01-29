"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InterventionRequest } from '@/types/intervention';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface InterventionContextType {
  interventionRequests: InterventionRequest[];
  addInterventionRequest: (request: Omit<InterventionRequest, 'id'>) => Promise<void>;
  updateInterventionRequest: (request: InterventionRequest) => Promise<void>;
  deleteInterventionRequest: (id: string) => Promise<void>;
  loading: boolean;
}

const InterventionContext = createContext<InterventionContextType | undefined>(undefined);

export const InterventionProvider = ({ children }: { children: ReactNode }) => {
  const [interventionRequests, setInterventionRequests] = useState<InterventionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Load interventions from Supabase on mount
  useEffect(() => {
    fetchInterventions();
  }, []);

  const fetchInterventions = async () => {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching interventions:', error);
        toast.error("Errore nel caricamento degli interventi");
        return;
      }

      if (data) {
        setInterventionRequests(data as InterventionRequest[]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Errore nel caricamento degli interventi");
    } finally {
      setLoading(false);
    }
  };

  const addInterventionRequest = async (newRequest: Omit<InterventionRequest, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .insert([newRequest])
        .select()
        .single();

      if (error) {
        console.error('Error adding intervention:', error);
        toast.error("Errore nell'aggiunta dell'intervento");
        return;
      }

      if (data) {
        setInterventionRequests((prev) => [data as InterventionRequest, ...prev]);
        toast.success("Richiesta di intervento aggiunta con successo!");
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Errore nell'aggiunta dell'intervento");
    }
  };

  const updateInterventionRequest = async (updatedRequest: InterventionRequest) => {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .update(updatedRequest)
        .eq('id', updatedRequest.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating intervention:', error);
        toast.error("Errore nell'aggiornamento dell'intervento");
        return;
      }

      if (data) {
        setInterventionRequests((prev) =>
          prev.map((request) =>
            request.id === updatedRequest.id ? (data as InterventionRequest) : request
          )
        );
        toast.success("Richiesta di intervento aggiornata con successo!");
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Errore nell'aggiornamento dell'intervento");
    }
  };

  const deleteInterventionRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('interventions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting intervention:', error);
        toast.error("Errore nell'eliminazione dell'intervento");
        return;
      }

      setInterventionRequests((prev) => prev.filter((request) => request.id !== id));
      toast.success("Richiesta di intervento eliminata con successo!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Errore nell'eliminazione dell'intervento");
    }
  };

  return (
    <InterventionContext.Provider value={{ 
      interventionRequests, 
      addInterventionRequest, 
      updateInterventionRequest, 
      deleteInterventionRequest,
      loading 
    }}>
      {children}
    </InterventionContext.Provider>
  );
};

export const useInterventionRequests = () => {
  const context = useContext(InterventionContext);
  if (context === undefined) {
    throw new Error('useInterventionRequests must be used within an InterventionProvider');
  }
  return context;
};