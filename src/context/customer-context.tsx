"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Customer } from '@/types/customer';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth-context';

interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'user_id'>) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  refreshCustomers: () => Promise<void>;
  loading: boolean;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isMounted = useRef(true);

  const refreshCustomers = async () => {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isMounted.current) return;
      if (error) {
        if (error.name === 'AbortError' || error.message?.includes('aborted')) return;
        toast.error(`Errore nel caricamento dei clienti: ${error.message}`);
        return;
      }
      setCustomers((data as Customer[]) || []);
    } catch (error: any) {
      if (!isMounted.current) return;
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) return;
      toast.error(`Errore nel caricamento dei clienti: ${error?.message || 'Unknown error'}`);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    if (user) {
      refreshCustomers();
    } else {
      setCustomers([]);
      setLoading(false);
    }
    return () => { isMounted.current = false; };
  }, [user]);

  const addCustomer = async (newCustomer: Omit<Customer, 'id' | 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Devi essere autenticato per aggiungere un cliente"); return; }
      const { data, error } = await supabase.from('customers').insert([{ ...newCustomer, user_id: user.id }]).select().single();
      if (error) { toast.error(`Errore nell'aggiunta del cliente: ${error.message}`); return; }
      if (data) { setCustomers((prev) => [data as Customer, ...prev]); toast.success("Cliente aggiunto con successo!"); }
    } catch (error: any) {
      toast.error(`Errore nell'aggiunta del cliente: ${error?.message || 'Unknown error'}`);
    }
  };

  const updateCustomer = async (updatedCustomer: Customer) => {
    try {
      const { data, error } = await supabase.from('customers').update(updatedCustomer).eq('id', updatedCustomer.id).select().single();
      if (error) { toast.error(`Errore nell'aggiornamento del cliente: ${error.message}`); return; }
      if (data) {
        setCustomers((prev) => prev.map((c) => c.id === updatedCustomer.id ? (data as Customer) : c));
        toast.success("Cliente aggiornato con successo!");
      }
    } catch (error: any) {
      toast.error(`Errore nell'aggiornamento del cliente: ${error?.message || 'Unknown error'}`);
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) { toast.error(`Errore nell'eliminazione del cliente: ${error.message}`); return; }
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      toast.success("Cliente eliminato con successo!");
    } catch (error: any) {
      toast.error(`Errore nell'eliminazione del cliente: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <CustomerContext.Provider value={{ customers, addCustomer, updateCustomer, deleteCustomer, refreshCustomers, loading }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) throw new Error('useCustomers must be used within a CustomerProvider');
  return context;
};