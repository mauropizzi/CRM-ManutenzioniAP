"use client";

import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCustomers } from '@/context/customer-context';
import { InterventionFormValues } from '@/components/intervention-form';
import { InterventionRequest } from '@/types/intervention';

interface ClientDetailsSectionProps {
  initialData?: InterventionRequest;
}

export const ClientDetailsSection = ({ initialData }: ClientDetailsSectionProps) => {
  const { control, watch, setValue } = useFormContext<InterventionFormValues>();
  const { customers, loading: customersLoading } = useCustomers();

  const selectedCustomerId = watch('customer_id');
  const isCustomerSelected = !!selectedCustomerId;

  useEffect(() => {
    if (customersLoading) {
      console.log('Customers still loading, deferring client data population.');
      return;
    }

    if (selectedCustomerId === 'new-customer' || selectedCustomerId === '') {
      setValue('client_company_name', '');
      setValue('client_email', '');
      setValue('client_phone', '');
      setValue('client_address', '');
      setValue('client_referent', '');
    } else {
      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
      if (selectedCustomer) {
        setValue('client_company_name', selectedCustomer.ragione_sociale);
        setValue('client_email', selectedCustomer.email);
        setValue('client_phone', selectedCustomer.telefono);
        setValue('client_address', selectedCustomer.indirizzo);
        setValue('client_referent', selectedCustomer.referente || '');
      } else {
        if (initialData && initialData.customer_id === selectedCustomerId) {
          setValue('client_company_name', initialData.client_company_name ?? '');
          setValue('client_email', initialData.client_email ?? '');
          setValue('client_phone', initialData.client_phone ?? '');
          setValue('client_address', initialData.client_address ?? '');
          setValue('client_referent', initialData.client_referent ?? '');
        } else {
          setValue('client_company_name', '');
          setValue('client_email', '');
          setValue('client_phone', '');
          setValue('client_address', '');
          setValue('client_referent', '');
        }
      }
    }
  }, [selectedCustomerId, customers, customersLoading, setValue, initialData]);

  return (
    <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Anagrafica cliente</h3>
      
      <FormField
        control={control}
        name="customer_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700 dark:text-gray-300">Seleziona Cliente Esistente (opz.)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? ''}>
              <FormControl>
                <SelectTrigger className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Seleziona un cliente o inserisci i dati manualmente" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="rounded-md border-gray-300 bg-white dark:bg-gray-900">
                <SelectItem value="new-customer">Nuovo Cliente</SelectItem>
                {customersLoading ? (
                  <SelectItem value="loading" disabled>Caricamento clienti...</SelectItem>
                ) : (
                  customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.ragione_sociale}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormDescription className="text-gray-600 dark:text-gray-400">
              Seleziona un cliente esistente per pre-compilare i campi sottostanti.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="client_company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Ragione sociale / Nome *</FormLabel>
              <FormControl>
                <Input placeholder="Ragione sociale o nome" {...field} disabled={isCustomerSelected && selectedCustomerId !== 'new-customer'} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="client_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Email cliente *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="cliente@email.it" {...field} disabled={isCustomerSelected && selectedCustomerId !== 'new-customer'} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="client_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Telefono *</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="1234567890" {...field} disabled={isCustomerSelected && selectedCustomerId !== 'new-customer'} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="client_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Indirizzo *</FormLabel>
              <FormControl>
                <Input placeholder="Via Roma 1, Milano" {...field} disabled={isCustomerSelected && selectedCustomerId !== 'new-customer'} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="client_referent"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Referente cliente (opz.)</FormLabel>
              <FormControl>
                <Input placeholder="Nome Referente" {...field} disabled={isCustomerSelected && selectedCustomerId !== 'new-customer'} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};