"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Customer } from '@/types/customer';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useSystemTypes } from '@/context/system-type-context';
import { useBrands } from '@/context/brand-context';
import Link from 'next/link';

export const formSchema = z.object({
  ragione_sociale: z.string().min(2, { message: "La ragione sociale deve contenere almeno 2 caratteri." }),
  codice_fiscale: z.string().min(16, { message: "Il codice fiscale deve contenere 16 caratteri." }).max(16, { message: "Il codice fiscale deve contenere 16 caratteri." }),
  partita_iva: z.string().min(11, { message: "La partita IVA deve contenere 11 caratteri." }).max(11, { message: "La partita IVA deve contenere 11 caratteri." }),
  indirizzo: z.string().min(5, { message: "L'indirizzo deve contenere almeno 5 caratteri." }),
  citta: z.string().min(2, { message: "La città deve contenere almeno 2 caratteri." }),
  cap: z.string().min(5, { message: "Il CAP deve contenere 5 cifre." }).max(5, { message: "Il CAP deve contenere 5 cifre." }),
  provincia: z.string().min(2, { message: "La provincia deve contenere 2 caratteri." }).max(2, { message: "La provincia deve contenere 2 caratteri." }),
  telefono: z.string().min(10, { message: "Il numero di telefono deve contenere almeno 10 cifre." }),
  email: z.string().email({ message: "Inserisci un'email valida." }),
  referente: z.string().optional(),
  pec: z.string().optional(),
  sdi: z.string().optional(),
  attivo: z.boolean(),
  note: z.string().optional(),
  system_type_id: z.string().optional().nullable(),
  brand_id: z.string().optional().nullable(),
  system_type: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
});

export type CustomerFormValues = z.infer<typeof formSchema>;

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: CustomerFormValues) => void;
}

export const CustomerForm = ({ initialData, onSubmit }: CustomerFormProps) => {
  const { systemTypes, loading: systemTypesLoading } = useSystemTypes();
  const { brands, loading: brandsLoading } = useBrands();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ragione_sociale: initialData?.ragione_sociale ?? '',
      codice_fiscale: initialData?.codice_fiscale ?? '',
      partita_iva: initialData?.partita_iva ?? '',
      indirizzo: initialData?.indirizzo ?? '',
      citta: initialData?.citta ?? '',
      cap: initialData?.cap ?? '',
      provincia: initialData?.provincia ?? '',
      telefono: initialData?.telefono ?? '',
      email: initialData?.email ?? '',
      referente: initialData?.referente ?? '',
      pec: initialData?.pec ?? '',
      sdi: initialData?.sdi ?? '',
      attivo: initialData?.attivo ?? true,
      note: initialData?.note ?? '',
      system_type_id: initialData?.system_type_id ?? null,
      brand_id: initialData?.brand_id ?? null,
      system_type: initialData?.system_type ?? null,
      brand: initialData?.brand ?? null,
    },
  });

  useEffect(() => {
    form.reset({
      ragione_sociale: initialData?.ragione_sociale ?? '',
      codice_fiscale: initialData?.codice_fiscale ?? '',
      partita_iva: initialData?.partita_iva ?? '',
      indirizzo: initialData?.indirizzo ?? '',
      citta: initialData?.citta ?? '',
      cap: initialData?.cap ?? '',
      provincia: initialData?.provincia ?? '',
      telefono: initialData?.telefono ?? '',
      email: initialData?.email ?? '',
      referente: initialData?.referente ?? '',
      pec: initialData?.pec ?? '',
      sdi: initialData?.sdi ?? '',
      attivo: initialData?.attivo ?? true,
      note: initialData?.note ?? '',
      system_type_id: initialData?.system_type_id ?? null,
      brand_id: initialData?.brand_id ?? null,
      system_type: initialData?.system_type ?? null,
      brand: initialData?.brand ?? null,
    });
  }, [initialData, form]);

  const handleSubmit = (values: CustomerFormValues) => {
    // If we have an ID for system type or brand, let's also set the names
    if (values.system_type_id) {
      const type = systemTypes.find(t => t.id === values.system_type_id);
      if (type) values.system_type = type.name;
    }
    if (values.brand_id) {
      const brand = brands.find(b => b.id === values.brand_id);
      if (brand) values.brand = brand.name;
    }
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-4">
        {/* Sezione Dati Anagrafici */}
        <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Dati Anagrafici</h3>
          <FormField
            control={form.control}
            name="ragione_sociale"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Ragione Sociale</FormLabel>
                <FormControl>
                  <Input placeholder="Ragione Sociale" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="codice_fiscale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Codice Fiscale</FormLabel>
                  <FormControl>
                    <Input placeholder="Codice Fiscale" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="partita_iva"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Partita IVA</FormLabel>
                  <FormControl>
                    <Input placeholder="Partita IVA" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Sezione Impianto Predefinito */}
        <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Impianto / Marca Predefiniti</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="system_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Tipo impianto</FormLabel>
                  <Select
                    value={field.value || ''}
                    onValueChange={(val) => field.onChange(val)}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Seleziona tipo impianto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-md border-gray-300 bg-white dark:bg-gray-900">
                      {systemTypesLoading ? (
                        <SelectItem value="__loading__" disabled>
                          Caricamento...
                        </SelectItem>
                      ) : (
                        systemTypes.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Marca</FormLabel>
                  <Select value={field.value || ''} onValueChange={(val) => field.onChange(val)}>
                    <FormControl>
                      <SelectTrigger className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Seleziona marca" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-md border-gray-300 bg-white dark:bg-gray-900">
                      {brandsLoading ? (
                        <SelectItem value="__loading__" disabled>
                          Caricamento...
                        </SelectItem>
                      ) : (
                        brands.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Sezione Indirizzo */}
        <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Indirizzo</h3>
          <FormField
            control={form.control}
            name="indirizzo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Indirizzo</FormLabel>
                <FormControl>
                  <Input placeholder="Via Roma 1" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="citta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Città</FormLabel>
                  <FormControl>
                    <Input placeholder="Milano" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">CAP</FormLabel>
                  <FormControl>
                    <Input placeholder="20100" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="provincia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Provincia</FormLabel>
                  <FormControl>
                    <Input placeholder="MI" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Sezione Contatti */}
        <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Contatti</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Telefono</FormLabel>
                  <FormControl>
                    <Input placeholder="123-456-7890" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="referente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Referente</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome Referente" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pec"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">PEC</FormLabel>
                  <FormControl>
                    <Input placeholder="pec@example.com" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sdi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Codice SDI</FormLabel>
                  <FormControl>
                    <Input placeholder="Codice SDI" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Sezione Stato e Note */}
        <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Stato e Note</h3>
          <FormField
            control={form.control}
            name="attivo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base text-gray-700 dark:text-gray-300">Attivo</FormLabel>
                  <FormDescription className="text-gray-600 dark:text-gray-400">
                    Indica se il cliente è attivo.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-blue-500 dark:data-[state=unchecked]:bg-gray-700"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Note</FormLabel>
                <FormControl>
                  <Textarea placeholder="Aggiungi note sul cliente..." {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Link href="/customers" passHref>
            <Button type="button" variant="outline" className="rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
              Annulla
            </Button>
          </Link>
          <Button type="submit" className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
            {initialData ? 'Salva Modifiche' : 'Aggiungi Cliente'}
          </Button>
        </div>
      </form>
    </Form>
  );
};