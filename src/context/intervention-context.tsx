"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { InterventionRequest } from '@/types/intervention';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface InterventionContextType {
  interventionRequests: InterventionRequest[];
  loading: boolean;
  error: string | null;
  refreshInterventions: () => Promise<void>;
  updateInterventionRequest: (intervention: InterventionRequest) => Promise<void>;
  hasFetched: boolean;
}

const InterventionContext = createContext<InterventionContextType | undefined>(undefined);

export function InterventionProvider({ children }: { children: React.ReactNode }) {
  const [interventionRequests, setInterventionRequests] = useState<InterventionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchInterventions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.fetchInterventions();
      setInterventionRequests(data);
      setHasFetched(true);
    } catch (error: any) {
      console.error('Error fetching interventions:', error);
      setError(error.message);
      toast.error(`Errore nel caricamento degli interventi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshInterventions = useCallback(async () => {
    // Invalidate cache before refreshing
    apiClient.invalidate('interventions');
    await fetchInterventions();
  }, [fetchInterventions]);

  const updateInterventionRequest = useCallback(async (intervention: InterventionRequest) => {
    try {
      const { data, error } = await supabase
        .from('intervention_requests')
        .update(intervention)
        .eq('id', intervention.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately
      setInterventionRequests((prev) =>
        prev.map((i) => (i.id === intervention.id ? { ...i, ...data } : i))
      );
      
      // Invalidate cache
      apiClient.invalidate('interventions');
      
      toast.success('Intervento aggiornato con successo');
    } catch (error: any) {
      toast.error(`Errore nell'aggiornamento dell'intervento: ${error.message}`);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!hasFetched) {
      fetchInterventions();
    }
  }, [hasFetched, fetchInterventions]);

  return (
    <InterventionContext.Provider
      value={{
        interventionRequests,
        loading,
        error,
        refreshInterventions,
        updateInterventionRequest,
        hasFetched,
      }}
    >
      {children}
    </InterventionContext.Provider>
  );
}

export function useInterventionRequests() {
  const context = useContext(InterventionContext);
  if (!context) {
    throw new Error('useInterventionRequests must be used within an InterventionProvider');
  }
  return context;
}