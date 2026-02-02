"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InterventionRequest, WorkReportData, TimeEntry } from '@/types/intervention';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth-context'; // Importo useAuth

interface InterventionContextType {
  interventionRequests: InterventionRequest[];
  addInterventionRequest: (request: Omit<InterventionRequest, 'id' | 'user_id'>) => Promise<void>;
  updateInterventionRequest: (request: InterventionRequest) => Promise<void>;
  deleteInterventionRequest: (id: string) => Promise<void>;
  loading: boolean;
}

const InterventionContext = createContext<InterventionContextType | undefined>(undefined);

// Helper per deserializzare work_report_data
const parseWorkReportData = (data: any): WorkReportData | undefined => {
  if (!data) return undefined;
  const parsed: WorkReportData = {
    ...data,
    time_entries: data.time_entries?.map((entry: any) => ({
      ...entry,
      date: entry.date ? new Date(entry.date) : undefined,
    })),
  };
  return parsed;
};

// Helper per serializzare work_report_data
const serializeWorkReportData = (data: WorkReportData | undefined): any | undefined => {
  if (!data) return undefined;
  const serialized: any = {
    ...data,
    time_entries: data.time_entries?.map((entry: TimeEntry) => ({
      ...entry,
      date: entry.date ? entry.date.toISOString().split('T')[0] : undefined, // Formato 'YYYY-MM-DD' per il database
    })),
  };
  return serialized;
};


export const InterventionProvider = ({ children }: { children: ReactNode }) => {
  const [interventionRequests, setInterventionRequests] = useState<InterventionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Ottengo l'utente dal contesto di autenticazione

  useEffect(() => {
    if (typeof window !== 'undefined' && user) { // Recupero gli interventi solo se l'utente è autenticato
      fetchInterventions();
    } else if (!user) {
      setInterventionRequests([]);
      setLoading(false);
    }
  }, [user]); // Dipendenza dall'oggetto utente

  const fetchInterventions = async () => {
    try {
      console.log('[InterventionContext] Fetching interventions from Supabase...');
      
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[InterventionContext] Supabase error fetching interventions:', error);
        toast.error(`Errore nel caricamento degli interventi: ${error.message}`);
        return;
      }

      console.log('[InterventionContext] Interventions fetched:', data);
      
      if (data) {
        // Mappa i dati per convertire le stringhe di scheduled_date in oggetti Date
        const parsedData = data.map(item => ({
          ...item,
          scheduled_date: item.scheduled_date ? new Date(item.scheduled_date) : undefined,
          work_report_data: parseWorkReportData(item.work_report_data), // Deserializza work_report_data
        })) as InterventionRequest[];
        setInterventionRequests(parsedData);
      }
    } catch (error: any) {
      console.error('[InterventionContext] Exception fetching interventions:', error);
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
        // Serializza work_report_data prima dell'inserimento
        work_report_data: serializeWorkReportData(newRequest.work_report_data),
      };

      console.log('[InterventionContext] Adding intervention:', requestWithUserId);
      
      const { data, error } = await supabase
        .from('interventions')
        .insert([requestWithUserId])
        .select()
        .single();

      if (error) {
        console.error('[InterventionContext] Supabase error adding intervention:', error);
        toast.error(`Errore nell'aggiunta dell'intervento: ${error.message}`);
        return;
      }

      console.log('[InterventionContext] Intervention added:', data);

      if (data) {
        // Deserializza work_report_data dopo l'inserimento per mantenere la coerenza nel frontend
        const parsedData = {
          ...data,
          scheduled_date: data.scheduled_date ? new Date(data.scheduled_date) : undefined,
          work_report_data: parseWorkReportData(data.work_report_data),
        } as InterventionRequest;
        setInterventionRequests((prev) => [parsedData, ...prev]);
        toast.success("Richiesta di intervento aggiunta con successo!");
      }
    } catch (error: any) {
      console.error('[InterventionContext] Exception adding intervention:', error);
      toast.error(`Errore nell'aggiunta dell'intervento: ${error?.message || 'Unknown error'}`);
    }
  };

  const updateInterventionRequest = async (updatedRequest: InterventionRequest) => {
    try {
      console.log('[InterventionContext] Updating intervention:', updatedRequest);
      
      // Prepara l'oggetto per l'aggiornamento, serializzando work_report_data
      const updatePayload = {
        ...updatedRequest,
        scheduled_date: updatedRequest.scheduled_date ? updatedRequest.scheduled_date.toISOString().split('T')[0] : null,
        work_report_data: serializeWorkReportData(updatedRequest.work_report_data),
      };

      const { data, error } = await supabase
        .from('interventions')
        .update(updatePayload)
        .eq('id', updatedRequest.id)
        .select()
        .single();

      if (error) {
        console.error('[InterventionContext] Supabase error updating intervention:', error);
        toast.error(`Errore nell'aggiornamento dell'intervento: ${error.message}`);
        return;
      }

      console.log('[InterventionContext] Intervention updated:', data);

      if (data) {
        // Deserializza work_report_data dopo l'aggiornamento per mantenere la coerenza nel frontend
        const parsedData = {
          ...data,
          scheduled_date: data.scheduled_date ? new Date(data.scheduled_date) : undefined,
          work_report_data: parseWorkReportData(data.work_report_data),
        } as InterventionRequest;
        setInterventionRequests((prev) =>
          prev.map((request) =>
            request.id === updatedRequest.id ? parsedData : request
          )
        );
        toast.success("Richiesta di intervento aggiornata con successo!");
      }
    } catch (error: any) {
      console.error('[InterventionContext] Exception updating intervention:', error);
      toast.error(`Errore nell'aggiornamento dell'intervento: ${error?.message || 'Unknown error'}`);
    }
  };

  const deleteInterventionRequest = async (id: string) => {
    try {
      if (!user) {
        toast.error("Devi essere autenticato per eliminare un intervento.");
        console.warn('[InterventionContext] Attempted to delete intervention without authenticated user.');
        return;
      }

      console.log(`[InterventionContext] Attempting to delete intervention with ID: ${id} by user: ${user.id}`);
      
      const { error } = await supabase
        .from('interventions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`[InterventionContext] Supabase error deleting intervention ID ${id}:`, error);
        toast.error(`Errore nell'eliminazione dell'intervento: ${error.message}`);
        return;
      }

      setInterventionRequests((prev) => prev.filter((request) => request.id !== id));
      toast.success("Richiesta di intervento eliminata con successo!");
      console.log(`[InterventionContext] Intervention ID ${id} deleted successfully.`);
    } catch (error: any) {
      console.error(`[InterventionContext] Exception deleting intervention ID ${id}:`, error);
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