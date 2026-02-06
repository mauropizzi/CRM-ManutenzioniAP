"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InterventionRequest, WorkReportData, TimeEntry } from '@/types/intervention';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth-context';

interface InterventionContextType {
  interventionRequests: InterventionRequest[];
  addInterventionRequest: (request: Omit<InterventionRequest, 'id' | 'user_id'>) => Promise<void>;
  updateInterventionRequest: (request: InterventionRequest) => Promise<void>;
  deleteInterventionRequest: (id: string) => Promise<void>;
  loading: boolean;
}

const InterventionContext = createContext<InterventionContextType | undefined>(undefined);

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

const serializeWorkReportData = (data: WorkReportData | undefined): any | undefined => {
  if (!data) return undefined;
  const serialized: any = {
    ...data,
    time_entries: data.time_entries?.map((entry: TimeEntry) => ({
      ...entry,
      date: entry.date ? entry.date.toISOString().split('T')[0] : undefined,
    })),
  };
  return serialized;
};

const normalizeCustomerId = (value: unknown): string | null => {
  const v = typeof value === 'string' ? value.trim() : '';
  if (!v || v === 'new-customer') return null;
  return v;
};

export const InterventionProvider = ({ children }: { children: ReactNode }) => {
  const [interventionRequests, setInterventionRequests] = useState<InterventionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      fetchInterventions();
    } else if (!user) {
      setInterventionRequests([]);
      setLoading(false);
    }
  }, [user]);

  const fetchInterventions = async () => {
    try {
      console.log('Fetching interventions from Supabase...');

      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (String(error?.message || '').includes('AbortError')) {
          return;
        }
        console.error('Supabase error fetching interventions:', error);
        toast.error(`Errore nel caricamento degli interventi: ${error.message}`);
        return;
      }

      console.log('Interventions fetched:', data);

      if (data) {
        const parsedData = data.map((item) => ({
          ...item,
          scheduled_date: item.scheduled_date ? new Date(item.scheduled_date) : undefined,
          work_report_data: parseWorkReportData(item.work_report_data),
        })) as InterventionRequest[];
        setInterventionRequests(parsedData);
      }
    } catch (error: any) {
      if (String(error?.message || '').includes('AbortError')) {
        return;
      }
      console.error('Exception fetching interventions:', error);
      toast.error(`Errore nel caricamento degli interventi: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const addInterventionRequest = async (newRequest: Omit<InterventionRequest, 'id' | 'user_id'>) => {
    // Get current user
    const {
      data: { user: authUser },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr) throw authErr;
    if (!authUser) throw new Error('Devi essere autenticato per aggiungere un intervento');

    const requestWithUserId = {
      ...newRequest,
      user_id: authUser.id,
      customer_id: normalizeCustomerId((newRequest as any).customer_id),
      work_report_data: serializeWorkReportData(newRequest.work_report_data),
    };

    console.log('Adding intervention:', requestWithUserId);

    const { data, error } = await supabase
      .from('interventions')
      .insert([requestWithUserId])
      .select()
      .single();

    if (error) {
      console.error('Supabase error adding intervention:', error);
      throw error;
    }

    console.log('Intervention added:', data);

    if (data) {
      const parsedData = {
        ...data,
        scheduled_date: data.scheduled_date ? new Date(data.scheduled_date) : undefined,
        work_report_data: parseWorkReportData(data.work_report_data),
      } as InterventionRequest;
      setInterventionRequests((prev) => [parsedData, ...prev]);
    }
  };

  const updateInterventionRequest = async (updatedRequest: InterventionRequest) => {
    console.log('Updating intervention:', updatedRequest);

    const updatePayload = {
      ...updatedRequest,
      customer_id: normalizeCustomerId((updatedRequest as any).customer_id),
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
      console.error('Supabase error updating intervention:', error);
      throw error;
    }

    console.log('Intervention updated:', data);

    if (data) {
      const parsedData = {
        ...data,
        scheduled_date: data.scheduled_date ? new Date(data.scheduled_date) : undefined,
        work_report_data: parseWorkReportData(data.work_report_data),
      } as InterventionRequest;
      setInterventionRequests((prev) => prev.map((req) => (req.id === updatedRequest.id ? parsedData : req)));
    }
  };

  const deleteInterventionRequest = async (id: string) => {
    try {
      console.log('Deleting intervention:', id);

      const { error } = await supabase.from('interventions').delete().eq('id', id);

      if (error) {
        console.error('Supabase error deleting intervention:', error);
        toast.error(`Errore nell'eliminazione dell'intervento: ${error.message}`);
        return;
      }

      setInterventionRequests((prev) => prev.filter((request) => request.id !== id));
      toast.success('Richiesta di intervento eliminata con successo!');
    } catch (error: any) {
      console.error('Exception deleting intervention:', error);
      toast.error(`Errore nell'eliminazione dell'intervento: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <InterventionContext.Provider
      value={{
        interventionRequests,
        addInterventionRequest,
        updateInterventionRequest,
        deleteInterventionRequest,
        loading,
      }}
    >
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