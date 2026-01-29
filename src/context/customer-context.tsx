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

  // Load customers from Supabase on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        toast.error("Errore nel caricamento dei clienti");
        return;
      }

      if (data) {
        setCustomers(data as Customer[]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Errore nel caricamento dei clienti");
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (newCustomer: Omit<Customer, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([newCustomer])
        .select()
        .single();

      if (error) {
        console.error('Error adding customer:', error);
        toast.error("Errore nell'aggiunta del cliente");
        return;
      }

      if (data) {
        setCustomers((prev) => [data as Customer, ...prev]);
        toast.success("Cliente aggiunto con successo!");
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Errore nell'aggiunta del cliente");
    }
  };

  const updateCustomer = async (updatedCustomer: Customer) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updatedCustomer)
        .eq('id', updatedCustomer.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer:', error);
        toast.error("Errore nell'aggiornamento del cliente");
        return;
      }

      if (data) {
        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === updatedCustomer.id ? (data as Customer) : customer
          )
        );
        toast.success("Cliente aggiornato con successo!");
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Errore nell'aggiornamento del cliente");
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting customer:', error);
        toast.error("Errore nell'eliminazione del cliente");
        return;
      }

      setCustomers((prev) => prev.filter((customer) => customer.id !== id));
      toast.success("Cliente eliminato con successo!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Errore nell'eliminazione del cliente");
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