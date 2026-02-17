"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ServicePoint } from '@/types/service-point';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ServicePointContextType {
  servicePoints: ServicePoint[];
  loading: boolean;
  error: string | null;
  refreshServicePoints: (customerId?: string) => Promise<void>;
  createServicePoint: (servicePoint: Omit<ServicePoint, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateServicePoint: (id: string, servicePoint: Partial<ServicePoint>) => Promise<void>;
  deleteServicePoint: (id: string) => Promise<void>;
  hasFetched: boolean;
}

const ServicePointContext = createContext<ServicePointContextType | undefined>(undefined);

export function ServicePointProvider({ children }: { children: React.ReactNode }) {
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState<string>();

  const fetchServicePoints = useCallback(async (customerId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.fetchServicePoints(customerId);
      setServicePoints(data);
      setCurrentCustomerId(customerId);
      setHasFetched(true);
    } catch (error: any) {
      console.error('Error fetching service points:', error);
      setError(error.message);
      toast.error(`Errore nel caricamento dei punti di servizio: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshServicePoints = useCallback(async (customerId?: string) => {
    // Invalidate cache before refreshing
    apiClient.invalidate('service-points');
    await fetchServicePoints(customerId);
  }, [fetchServicePoints]);

  const createServicePoint = useCallback(async (servicePoint: Omit<ServicePoint, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('service_points')
        .insert([servicePoint])
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately
      setServicePoints((prev) => [...prev, data]);
      
      // Invalidate cache
      apiClient.invalidate('service-points');
      
      toast.success('Punto di servizio creato con successo');
    } catch (error: any) {
      toast.error(`Errore nella creazione del punto di servizio: ${error.message}`);
      throw error;
    }
  }, []);

  const updateServicePoint = useCallback(async (id: string, updates: Partial<ServicePoint>) => {
    try {
      const { data, error } = await supabase
        .from('service_points')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately
      setServicePoints((prev) =>
        prev.map((sp) => (sp.id === id ? { ...sp, ...data } : sp))
      );
      
      // Invalidate cache
      apiClient.invalidate('service-points');
      
      toast.success('Punto di servizio aggiornato con successo');
    } catch (error: any) {
      toast.error(`Errore nell'aggiornamento del punto di servizio: ${error.message}`);
      throw error;
    }
  }, []);

  const deleteServicePoint = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('service_points').delete().eq('id', id);

      if (error) throw error;

      // Update local state immediately
      setServicePoints((prev) => prev.filter((sp) => sp.id !== id));
      
      // Invalidate cache
      apiClient.invalidate('service-points');
      
      toast.success('Punto di servizio eliminato con successo');
    } catch (error: any) {
      toast.error(`Errore nell'eliminazione del punto di servizio: ${error.message}`);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!hasFetched) {
      fetchServicePoints();
    }
  }, [hasFetched, fetchServicePoints]);

  return (
    <ServicePointContext.Provider
      value={{
        servicePoints,
        loading,
        error,
        refreshServicePoints,
        createServicePoint,
        updateServicePoint,
        deleteServicePoint,
        hasFetched,
      }}
    >
      {children}
    </ServicePointContext.Provider>
  );
}

export function useServicePoints() {
  const context = useContext(ServicePointContext);
  if (!context) {
    throw new Error('useServicePoints must be used within a ServicePointProvider');
  }
  return context;
}