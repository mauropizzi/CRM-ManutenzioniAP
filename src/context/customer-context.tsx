"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Customer } from '@/types/customer';
import { toast } from 'sonner';

interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const addCustomer = (newCustomer: Omit<Customer, 'id'>) => {
    const customerWithId = { ...newCustomer, id: crypto.randomUUID() };
    setCustomers((prev) => [...prev, customerWithId]);
    toast.success("Cliente aggiunto con successo!");
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      )
    );
    toast.success("Cliente aggiornato con successo!");
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((customer) => customer.id !== id));
    toast.success("Cliente eliminato con successo!");
  };

  return (
    <CustomerContext.Provider value={{ customers, addCustomer, updateCustomer, deleteCustomer }}>
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