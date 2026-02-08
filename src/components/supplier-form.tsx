"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import type { Resolver, SubmitHandler } from "react-hook-form";

const supplierSchema = z.object({
  ragione_sociale: z.string().min(2, "Inserisci la ragione sociale"),
  partita_iva: z.string().optional().or(z.literal("")),
  codice_fiscale: z.string().optional().or(z.literal("")),
  indirizzo: z.string().optional().or(z.literal("")),
  cap: z.string().optional().or(z.literal("")),
  citta: z.string().optional().or(z.literal("")),
  provincia: z.string().optional().or(z.literal("")),
  telefono: z.string().optional().or(z.literal("")),
  email: z.string().email("Email non valida").optional().or(z.literal("")),
  pec: z.string().email("PEC non valida").optional().or(z.literal("")),
  tipo_servizio: z.string().optional().or(z.literal("")),
  attivo: z.boolean().default(true),
  note: z.string().optional().or(z.literal("")),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  initialData?: Partial<SupplierFormValues>;
  onSubmit: (data: SupplierFormValues) => Promise<void> | void;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({ initialData, onSubmit }) => {
  const methods = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema) as Resolver<SupplierFormValues>,
    defaultValues: {
      ragione_sociale: initialData?.ragione_sociale ?? "",
      partita_iva: initialData?.partita_iva ?? "",
      codice_fiscale: initialData?.codice_fiscale ?? "",
      indirizzo: initialData?.indirizzo ?? "",
      cap: initialData?.cap ?? "",
      citta: initialData?.citta ?? "",
      provincia: initialData?.provincia ?? "",
      telefono: initialData?.telefono ?? "",
      email: initialData?.email ?? "",
      pec: initialData?.pec ?? "",
      tipo_servizio: initialData?.tipo_servizio ?? "",
      attivo: initialData?.attivo ?? true,
      note: initialData?.note ?? "",
    },
  });

  const handleSubmit: SubmitHandler<SupplierFormValues> = (values) => onSubmit(values);

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={methods.control}
              name="ragione_sociale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ragione sociale</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Es. Alfa Service S.r.l." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="partita_iva"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partita IVA</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Es. 01234567890" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="codice_fiscale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Codice Fiscale</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Es. RSSMRA80A01H501U" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="indirizzo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Indirizzo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Via Roma 10" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="cap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CAP</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Es. 20100" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="citta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Città</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Milano" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="provincia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provincia</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="MI" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefono</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Es. +39 02 1234567" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="info@fornitore.it" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="pec"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PEC</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="pec@fornitore.it" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="tipo_servizio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo servizio</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger className="bg-white dark:bg-gray-950">
                        <SelectValue placeholder="Seleziona il tipo di servizio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Manutentore">Manutentore</SelectItem>
                      <SelectItem value="Elettricista">Elettricista</SelectItem>
                      <SelectItem value="Idraulico">Idraulico</SelectItem>
                      <SelectItem value="Muratore">Muratore</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="attivo"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel>Attivo</FormLabel>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={methods.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Annotazioni interne..." className="min-h-[100px]" />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Salva</Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
};

export default SupplierForm;