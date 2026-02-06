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

export const ClientDetailsSection = () => {
  const { control, watch, setValue } = useFormContext<InterventionFormValues>();
  const { customers, loading: customersLoading } = useCustomers();

  const selectedCustomerId = watch('customer_id');
  const isCustomerSelected = !!selectedCustomerId;

  useEffect(() => {
    if (customersLoading) return;

    // Manual mode by default: do NOT clear fields when no selection.
    if (selectedCustomerId === 'new-customer') {
      setValue('client_company_name', '');
      setValue('client_codice_fiscale', '');
      setValue('client_partita_iva', '');
      setValue('client_address', '');
      setValue('client_citta', '');
      setValue('client_cap', '');
      setValue('client_provincia', '');
      setValue('client_phone', '');
      setValue('client_email', '');
      setValue('client_referent', '');
      setValue('client_pec', '');
      setValue('client_sdi', '');
      return;
    }

    if (!selectedCustomerId) return;

    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
    if (!selectedCustomer) return;

    setValue('client_company_name', selectedCustomer.ragione_sociale);
    setValue('client_codice_fiscale', selectedCustomer.codice_fiscale ?? '');
    setValue('client_partita_iva', selectedCustomer.partita_iva ?? '');
    setValue('client_address', selectedCustomer.indirizzo ?? '');
    setValue('client_citta', selectedCustomer.citta ?? '');
    setValue('client_cap', selectedCustomer.cap ?? '');
    setValue('client_provincia', selectedCustomer.provincia ?? '');
    setValue('client_phone', selectedCustomer.telefono ?? '');
    setValue('client_email', selectedCustomer.email ?? '');
    setValue('client_referent', selectedCustomer.referente ?? '');
    setValue('client_pec', selectedCustomer.pec ?? '');
    setValue('client_sdi', selectedCustomer.sdi ?? '');
  }, [selectedCustomerId, customers, customersLoading, setValue]);

  const fieldsDisabled = isCustomerSelected && selectedCustomerId !== 'new-customer';

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
                <SelectItem value="new-customer">Nuovo Cliente (manuale)</SelectItem>
                {customersLoading ? (
                  <SelectItem value="loading" disabled>
                    Caricamento clienti...
                  </SelectItem>
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
              Se selezioni un cliente esistente, i campi vengono pre-compilati. Se lasci vuoto o scegli "Nuovo Cliente", puoi inserire i dati manualmente.
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
                <Input
                  placeholder="Ragione sociale o nome"
                  {...field}
                  disabled={fieldsDisabled}
                  className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
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
              <FormLabel className="text-gray-700 dark:text-gray-300">Referente (opz.)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome referente"
                  {...field}
                  disabled={fieldsDisabled}
                  className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="client_codice_fiscale"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Codice Fiscale *</FormLabel>
              <FormControl>
                <Input
                  placeholder="16 caratteri"
                  {...field}
                  disabled={fieldsDisabled}
                  className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="client_partita_iva"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Partita IVA *</FormLabel>
              <FormControl>
                <Input
                  placeholder="11 cifre"
                  {...field}
                  disabled={fieldsDisabled}
                  className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={control}
          name="client_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Indirizzo *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Via Roma 1"
                  {...field}
                  disabled={fieldsDisabled}
                  className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="client_citta"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Città *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Milano"
                    {...field}
                    disabled={fieldsDisabled}
                    className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="client_cap"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">CAP *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="20100"
                    {...field}
                    disabled={fieldsDisabled}
                    className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="client_provincia"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Provincia *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="MI"
                    {...field}
                    disabled={fieldsDisabled}
                    className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="client_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Telefono *</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="1234567890"
                  {...field}
                  disabled={fieldsDisabled}
                  className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
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
              <FormLabel className="text-gray-700 dark:text-gray-300">Email *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="cliente@email.it"
                  {...field}
                  disabled={fieldsDisabled}
                  className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="client_pec"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">PEC (opz.)</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="pec@dominio.it"
                  {...field}
                  disabled={fieldsDisabled}
                  className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="client_sdi"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Codice SDI (opz.)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Es. ABCDEFG"
                  {...field}
                  disabled={fieldsDisabled}
                  className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};