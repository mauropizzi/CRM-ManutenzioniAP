"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer } from '@/types/customer';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  loading: boolean;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch if we're in the browser
    if (typeof window !== 'undefined') {
      fetchCustomers();
    }
  }, []);

  const fetchCustomers = async () => {
    try {
      console.log('Fetching customers from Supabase...');
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching customers:', error);
        toast.error(`Errore nel caricamento dei clienti: ${error.message}`);
        return;
      }

      console.log('Customers fetched:', data);
      
      if (data) {
        setCustomers(data as Customer[]);
      }
    } catch (error: any) {
      console.error('Exception fetching customers:', error);
      toast.error(`Errore nel caricamento dei clienti: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (newCustomer: Omit<Customer, 'id'>) => {
    try {
      console.log('Adding customer:', newCustomer);
      
      const { data, error } = await supabase
        .from('customers')
        .insert([newCustomer])
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding customer:', error);
        toast.error(`Errore nell'aggiunta del cliente: ${error.message}`);
        return;
      }

      console.log('Customer added:', data);

      if (data) {
        setCustomers((prev) => [data as Customer, ...prev]);
        toast.success("Cliente aggiunto con successo!");
      }
    } catch (error: any) {
      console.error('Exception adding customer:', error);
      toast.error(`Errore nell'aggiunta del cliente: ${error?.message || 'Unknown error'}`);
    }
  };

  const updateCustomer = async (updatedCustomer: Customer) => {
    try {
      console.log('Updating customer:', updatedCustomer);
      
      const { data, error } = await supabase
        .from('customers')
        .update(updatedCustomer)
        .eq('id', updatedCustomer.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating customer:', error);
        toast.error(`Errore nell'aggiornamento del cliente: ${error.message}`);
        return;
      }

      console.log('Customer updated:', data);

      if (data) {
        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === updatedCustomer.id ? (data as Customer) : customer
          )
        );
        toast.success("Cliente aggiornato con successo!");
      }
    } catch (error: any) {
      console.error('Exception updating customer:', error);
      toast.error(`Errore nell'aggiornamento del cliente: ${error?.message || 'Unknown error'}`);
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      console.log('Deleting customer:', id);
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting customer:', error);
        toast.error(`Errore nell'eliminazione del cliente: ${error.message}`);
        return;
      }

      setCustomers((prev) => prev.filter((customer) => customer.id !== id));
      toast.success("Cliente eliminato con successo!");
    } catch (error: any) {
      console.error('Exception deleting customer:', error);
      toast.error(`Errore nell'eliminazione del cliente: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <CustomerContext.Provider value={{ 
      customers, 
      addCustomer, 
      updateCustomer, 
      deleteCustomer,
      loading 
    }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};