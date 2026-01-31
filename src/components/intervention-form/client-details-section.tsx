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

interface ClientDetailsSectionProps {} // Rimosso initialData dalla prop

export const ClientDetailsSection = () => {
  const { control, watch, setValue, getValues } = useFormContext<InterventionFormValues>(); // Aggiunto getValues
  const { customers, loading: customersLoading } = useCustomers();

  const selectedCustomerId = watch('customer_id');
  const isCustomerSelected = !!selectedCustomerId;

  useEffect(() => {
    // Questo effetto dovrebbe reagire ai cambiamenti di selectedCustomerId (dall'interazione utente)
    // o quando i dati dei clienti sono finalmente caricati.
    // Il popolamento iniziale dei campi è gestito dai defaultValues nel form padre.

    if (customersLoading) {
      // Se i clienti sono ancora in caricamento, non possiamo risolvere l'ID del cliente.
      // I campi dovrebbero mantenere i loro valori attuali (dai defaultValues o input precedente).
      return;
    }

    if (selectedCustomerId === 'new-customer' || !selectedCustomerId) {
      // L'utente ha selezionato esplicitamente "Nuovo Cliente" o ha cancellato la selezione.
      // Pulisci tutti i campi dei dettagli del cliente per consentire l'input manuale.
      setValue('client_company_name', '');
      setValue('client_email', '');
      setValue('client_phone', '');
      setValue('client_address', '');
      setValue('client_referent', '');
    } else {
      // È selezionato un ID cliente esistente. Cerca di trovarlo nei clienti caricati.
      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
      if (selectedCustomer) {
        // Trovato il cliente, popola i campi con i suoi dati.
        setValue('client_company_name', selectedCustomer.ragione_sociale);
        setValue('client_email', selectedCustomer.email);
        setValue('client_phone', selectedCustomer.telefono);
        setValue('client_address', selectedCustomer.indirizzo);
        setValue('client_referent', selectedCustomer.referente || '');
      }
      // IMPORTANTE: Se selectedCustomerId è presente ma il cliente NON viene trovato (es. eliminato, o race condition di caricamento asincrono),
      // NON cancelliamo i campi qui. Dovrebbero mantenere i valori impostati da defaultValues dal form padre.
      // Questo impedisce di cancellare i dati pre-popolati nelle pagine di modifica se l'elenco dei clienti si carica più tardi o se il cliente è mancante.
    }
  }, [selectedCustomerId, customers, customersLoading, setValue]); // Dipendenze

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
                  <SelectValue placeholder="Seleziona un cliente o inserisci i dati manualmente">
                    {/* Visualizza il nome del cliente attualmente monitorato dallo stato del form */}
                    {getValues('client_company_name') || "Seleziona un cliente o inserisci i dati manualmente"}
                  </SelectValue>
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