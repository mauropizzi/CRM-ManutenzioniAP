"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { InterventionRequest, WorkReportData, TimeEntry } from '@/types/intervention';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth-context';
import { useCustomers } from '@/context/customer-context';

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

const normFiscal = (value: unknown) => String(value ?? '').trim().toUpperCase();
const emptyToNull = (value: unknown) => {
  const v = String(value ?? '').trim();
  return v.length > 0 ? v : null;
};

export const InterventionProvider = ({ children }: { children: ReactNode }) => {
  const [interventionRequests, setInterventionRequests] = useState<InterventionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { refreshCustomers } = useCustomers();
  // Lock per evitare aggiornamenti concorrenti dello stesso intervento
  const updateLocks = useRef<Set<string>>(new Set());

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
    const {
      data: { user: authUser },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr) throw authErr;
    if (!authUser) throw new Error('Devi essere autenticato per aggiungere un intervento');

    // 1) Se il cliente è inserito manualmente, crealo in anagrafica (con blocco duplicati)
    let customerId = normalizeCustomerId((newRequest as any).customer_id);

    const cf = normFiscal((newRequest as any).client_codice_fiscale);
    const piva = normFiscal((newRequest as any).client_partita_iva);

    if (!customerId) {
      const orParts: string[] = [];
      if (piva) orParts.push(`partita_iva.eq.${piva}`);
      if (cf) orParts.push(`codice_fiscale.eq.${cf}`);

      if (orParts.length > 0) {
        const { data: existing, error: dupErr } = await supabase
          .from('customers')
          .select('id, ragione_sociale, partita_iva, codice_fiscale')
          .or(orParts.join(','))
          .limit(1);

        if (dupErr) throw dupErr;
        if (existing && existing.length > 0) {
          const name = (existing[0] as any).ragione_sociale || 'cliente';
          throw new Error(`Cliente già presente in anagrafica (${name}). Verifica Partita IVA / Codice Fiscale.`);
        }
      }

      const customerPayload = {
        user_id: authUser.id,
        ragione_sociale: (newRequest as any).client_company_name,
        codice_fiscale: cf || null,
        partita_iva: piva || null,
        indirizzo: (newRequest as any).client_address,
        citta: emptyToNull((newRequest as any).client_citta),
        cap: emptyToNull((newRequest as any).client_cap),
        provincia: emptyToNull(String((newRequest as any).client_provincia ?? '').trim().toUpperCase()),
        telefono: (newRequest as any).client_phone,
        email: (newRequest as any).client_email,
        referente: emptyToNull((newRequest as any).client_referent),
        pec: emptyToNull((newRequest as any).client_pec),
        sdi: emptyToNull((newRequest as any).client_sdi),
        attivo: true,
      };

      const { data: createdCustomer, error: createCustomerErr } = await supabase
        .from('customers')
        .insert([customerPayload])
        .select('id')
        .single();

      if (createCustomerErr) {
        if (String(createCustomerErr?.code || '') === '23505') {
          throw new Error('Cliente già presente in anagrafica. Verifica Partita IVA / Codice Fiscale.');
        }
        throw createCustomerErr;
      }

      customerId = (createdCustomer as any)?.id ?? null;
      if (!customerId) throw new Error('Impossibile creare il cliente in anagrafica');

      // Aggiorna lista clienti in memoria (così compare subito in Anagrafica)
      await refreshCustomers();
    }

    // 2) Inserisci intervento (rimuovendo i campi extra usati solo per il cliente)
    const {
      client_codice_fiscale,
      client_partita_iva,
      client_citta,
      client_cap,
      client_provincia,
      client_pec,
      client_sdi,
      ...rest
    } = newRequest as any;

    const requestWithUserId = {
      ...rest,
      user_id: authUser.id,
      customer_id: customerId,
      work_report_data: serializeWorkReportData((newRequest as any).work_report_data),
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

    // Evita doppie chiamate concorrenti sullo stesso ID
    if (updateLocks.current.has(updatedRequest.id)) {
      console.warn('Duplicate update ignored for intervention:', updatedRequest.id);
      return;
    }
    updateLocks.current.add(updatedRequest.id);

    try {
      const {
        client_codice_fiscale,
        client_partita_iva,
        client_citta,
        client_cap,
        client_provincia,
        client_pec,
        client_sdi,
        ...rest
      } = updatedRequest as any;

      const updatePayload = {
        ...rest,
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
    } finally {
      updateLocks.current.delete(updatedRequest.id);
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