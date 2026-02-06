"use client";

import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import Link from 'next/link';
import { InterventionRequest } from '@/types/intervention';
import { ClientDetailsSection, SystemDetailsSection, SchedulingDetailsSection } from './intervention-form/';

export const interventionFormSchema = z
  .object({
    customer_id: z.string().optional(),
    client_company_name: z.string().min(2, { message: "La ragione sociale deve contenere almeno 2 caratteri." }),
    client_email: z.string().email({ message: "Inserisci un'email valida." }),
    client_phone: z.string().min(10, { message: "Il numero di telefono deve contenere almeno 10 cifre." }),
    client_address: z.string().min(5, { message: "L'indirizzo deve contenere almeno 5 caratteri." }),
    client_referent: z.string().optional().or(z.literal('')),
    system_type: z.string().min(2, { message: "Il tipo di impianto deve contenere almeno 2 caratteri." }),
    brand: z.string().min(2, { message: "La marca deve contenere almeno 2 caratteri." }),
    model: z.string().min(2, { message: "Il modello deve contenere almeno 2 caratteri." }),
    serial_number: z.string().min(2, { message: "La matricola deve contenere almeno 2 caratteri." }),
    system_location: z.string().min(5, { message: "L'ubicazione dell'impianto deve contenere almeno 5 caratteri." }),
    internal_ref: z.string().optional().or(z.literal('')),
    scheduled_date: z.date().optional(),
    scheduled_time: z.string().optional().or(z.literal('')),
    status: z.enum(['Da fare', 'In corso', 'Completato', 'Annullato']),
    assigned_technicians: z.string().optional().or(z.literal('')),
    assigned_supplier: z.string().optional().or(z.literal('')),
    office_notes: z.string().optional().or(z.literal('')),
  })
  .refine(
    (v) => {
      const hasTech = Boolean(v.assigned_technicians && v.assigned_technicians.trim().length > 0);
      const hasSupplier = Boolean(v.assigned_supplier && v.assigned_supplier.trim().length > 0);
      return !(hasTech && hasSupplier);
    },
    {
      message: "Puoi assegnare la richiesta o a un tecnico o a un fornitore (non entrambi).",
      path: ['assigned_technicians'],
    }
  );

export type InterventionFormValues = z.infer<typeof interventionFormSchema>;

interface InterventionFormProps {
  initialData?: InterventionRequest;
  onSubmit: (data: InterventionFormValues) => void;
}

const generateTimeOptions = () => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      times.push(`${hour}:${minute}`);
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

export const InterventionForm = ({ initialData, onSubmit }: InterventionFormProps) => {
  const methods = useForm<InterventionFormValues>({
    resolver: zodResolver(interventionFormSchema),
    defaultValues: {
      customer_id: initialData?.customer_id ?? '',
      client_company_name: initialData?.client_company_name ?? '',
      client_email: initialData?.client_email ?? '',
      client_phone: initialData?.client_phone ?? '',
      client_address: initialData?.client_address ?? '',
      client_referent: initialData?.client_referent ?? '',
      system_type: initialData?.system_type ?? '',
      brand: initialData?.brand ?? '',
      model: initialData?.model ?? '',
      serial_number: initialData?.serial_number ?? '',
      system_location: initialData?.system_location ?? '',
      internal_ref: initialData?.internal_ref ?? '',
      scheduled_date: initialData?.scheduled_date,
      scheduled_time: initialData?.scheduled_time ?? '',
      status: initialData?.status ?? 'Da fare',
      assigned_technicians: initialData?.assigned_technicians ?? '',
      assigned_supplier: (initialData as any)?.assigned_supplier ?? '',
      office_notes: initialData?.office_notes ?? '',
    },
  });

  const handleSubmit = (values: InterventionFormValues) => {
    console.log('InterventionForm handleSubmit called with:', values);
    onSubmit(values);
  };

  React.useEffect(() => {
    if (Object.keys(methods.formState.errors).length > 0) {
      console.error('Form validation errors:', methods.formState.errors);
    }
  }, [methods.formState.errors]);

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-8 p-4">
          <ClientDetailsSection />
          <SystemDetailsSection />
          <SchedulingDetailsSection timeOptions={timeOptions} />

          {Object.keys(methods.formState.errors).length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <p className="font-semibold">Correggi i seguenti errori:</p>
              <ul className="mt-2 list-disc list-inside text-sm">
                {Object.entries(methods.formState.errors).map(([field, error]) => (
                  <li key={field}>{error?.message as any}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Link href="/interventions" passHref>
              <Button
                type="button"
                variant="outline"
                className="rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Annulla
              </Button>
            </Link>
            <Button
              type="submit"
              className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
              disabled={methods.formState.isSubmitting}
            >
              {methods.formState.isSubmitting ? 'Registrazione...' : initialData ? 'Salva Modifiche' : 'Registra Richiesta'}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
};