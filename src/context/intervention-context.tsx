"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InterventionRequest } from '@/types/intervention';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface InterventionContextType {
  interventionRequests: InterventionRequest[];
  addInterventionRequest: (request: Omit<InterventionRequest, 'id' | 'user_id'>) => Promise<void>;
  updateInterventionRequest: (request: InterventionRequest) => Promise<void>;
  deleteInterventionRequest: (id: string) => Promise<void>;
  loading: boolean;
}

const InterventionContext = createContext<InterventionContextType | undefined>(undefined);

export const InterventionProvider = ({ children }: { children: ReactNode }) => {
  const [interventionRequests, setInterventionRequests] = useState<InterventionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchInterventions();
    }
  }, []);

  const fetchInterventions = async () => {
    try {
      console.log('Fetching interventions from Supabase...');
      
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching interventions:', error);
        toast.error(`Errore nel caricamento degli interventi: ${error.message}`);
        return;
      }

      console.log('Interventions fetched:', data);
      
      if (data) {
        // Mappa i dati per convertire le stringhe di scheduled_date in oggetti Date
        const parsedData = data.map(item => ({
          ...item,
          scheduled_date: item.scheduled_date ? new Date(item.scheduled_date) : undefined,
        })) as InterventionRequest[];
        setInterventionRequests(parsedData);
      }
    } catch (error: any) {
      console.error('Exception fetching interventions:', error);
      toast.error(`Errore nel caricamento degli interventi: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const addInterventionRequest = async (newRequest: Omit<InterventionRequest, 'id' | 'user_id'>) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Devi essere autenticato per aggiungere un intervento");
        return;
      }

      const requestWithUserId = {
        ...newRequest,
        user_id: user.id,
      };

      console.log('Adding intervention:', requestWithUserId);
      
      const { data, error } = await supabase
        .from('interventions')
        .insert([requestWithUserId])
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding intervention:', error);
        toast.error(`Errore nell'aggiunta dell'intervento: ${error.message}`);
        return;
      }

      console.log('Intervention added:', data);

      if (data) {
        setInterventionRequests((prev) => [data as InterventionRequest, ...prev]);
        toast.success("Richiesta di intervento aggiunta con successo!");
      }
    } catch (error: any) {
      console.error('Exception adding intervention:', error);
      toast.error(`Errore nell'aggiunta dell'intervento: ${error?.message || 'Unknown error'}`);
    }
  };

  const updateInterventionRequest = async (updatedRequest: InterventionRequest) => {
    try {
      console.log('Updating intervention:', updatedRequest);
      
      const { data, error } = await supabase
        .from('interventions')
        .update(updatedRequest)
        .eq('id', updatedRequest.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating intervention:', error);
        toast.error(`Errore nell'aggiornamento dell'intervento: ${error.message}`);
        return;
      }

      console.log('Intervention updated:', data);

      if (data) {
        setInterventionRequests((prev) =>
          prev.map((request) =>
            request.id === updatedRequest.id ? (data as InterventionRequest) : request
          )
        );
        toast.success("Richiesta di intervento aggiornata con successo!");
      }
    } catch (error: any) {
      console.error('Exception updating intervention:', error);
      toast.error(`Errore nell'aggiornamento dell'intervento: ${error?.message || 'Unknown error'}`);
    }
  };

  const deleteInterventionRequest = async (id: string) => {
    try {
      console.log('Deleting intervention:', id);
      
      const { error } = await supabase
        .from('interventions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting intervention:', error);
        toast.error(`Errore nell'eliminazione dell'intervento: ${error.message}`);
        return;
      }

      setInterventionRequests((prev) => prev.filter((request) => request.id !== id));
      toast.success("Richiesta di intervento eliminata con successo!");
    } catch (error: any) {
      console.error('Exception deleting intervention:', error);
      toast.error(`Errore nell'eliminazione dell'intervento: ${error?.message || 'Unknown error'}`);
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