"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Customer } from '@/types/customer';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CustomerContextType {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  refreshCustomers: () => Promise<void>;
  createCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  hasFetched: boolean;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.fetchCustomers();
      setCustomers(data);
      setHasFetched(true);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      setError(error.message);
      toast.error(`Errore nel caricamento dei clienti: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCustomers = useCallback(async () => {
    // Invalidate cache before refreshing
    apiClient.invalidate('customers');
    await fetchCustomers();
  }, [fetchCustomers]);

  const createCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately
      setCustomers((prev) => [...prev, data]);
      
      // Invalidate cache
      apiClient.invalidate('customers');
      
      toast.success('Cliente creato con successo');
    } catch (error: any) {
      toast.error(`Errore nella creazione del cliente: ${error.message}`);
      throw error;
    }
  }, []);

  const updateCustomer = useCallback(async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c))
      );
      
      // Invalidate cache
      apiClient.invalidate('customers');
      
      toast.success('Cliente aggiornato con successo');
    } catch (error: any) {
      toast.error(`Errore nell'aggiornamento del cliente: ${error.message}`);
      throw error;
    }
  }, []);

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id);

      if (error) throw error;

      // Update local state immediately
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      
      // Invalidate cache
      apiClient.invalidate('customers');
      
      toast.success('Cliente eliminato con successo');
    } catch (error: any) {
      toast.error(`Errore nell'eliminazione del cliente: ${error.message}`);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!hasFetched) {
      fetchCustomers();
    }
  }, [hasFetched, fetchCustomers]);

  return (
    <CustomerContext.Provider
      value={{
        customers,
        loading,
        error,
        refreshCustomers,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        hasFetched,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
}