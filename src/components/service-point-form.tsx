"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ServicePoint } from "@/types/service-point";

const servicePointSchema = z.object({
  customer_id: z.string().uuid(),
  nome_punto_servizio: z.string().min(2, "Inserisci il nome del punto servizio"),
  indirizzo: z.string().optional().or(z.literal("")),
  citta: z.string().optional().or(z.literal("")),
  cap: z.string().optional().or(z.literal("")),
  provincia: z.string().optional().or(z.literal("")),
  telefono: z.string().optional().or(z.literal("")),
  email: z.string().email("Email non valida").optional().or(z.literal("")),
  note: z.string().optional().or(z.literal("")),
  tipo_impianti: z.array(z.string()).optional(),
  marche: z.array(z.string()).optional(),
});

export type ServicePointFormValues = z.infer<typeof servicePointSchema>;

// Ensure the form values satisfy react-hook-form FieldValues by widening with Record<string, any>
type FormValues = ServicePointFormValues & Record<string, any>;

interface Props {
  initialData?: Partial<ServicePointFormValues>;
  onSubmit: (data: ServicePointFormValues) => Promise<void> | void;
}

export const ServicePointForm: React.FC<Props> = ({ initialData, onSubmit }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(servicePointSchema),
    defaultValues: {
      customer_id: initialData?.customer_id ?? "",
      nome_punto_servizio: initialData?.nome_punto_servizio ?? "",
      indirizzo: initialData?.indirizzo ?? "",
      citta: initialData?.citta ?? "",
      cap: initialData?.cap ?? "",
      provincia: initialData?.provincia ?? "",
      telefono: initialData?.telefono ?? "",
      email: initialData?.email ?? "",
      note: initialData?.note ?? "",
      tipo_impianti: initialData?.tipo_impianti ?? [],
      marche: initialData?.marche ?? [],
    },
  });

  const { control, handleSubmit, reset } = form;

  useEffect(() => {
    reset({
      customer_id: initialData?.customer_id ?? "",
      nome_punto_servizio: initialData?.nome_punto_servizio ?? "",
      indirizzo: initialData?.indirizzo ?? "",
      citta: initialData?.citta ?? "",
      cap: initialData?.cap ?? "",
      provincia: initialData?.provincia ?? "",
      telefono: initialData?.telefono ?? "",
      email: initialData?.email ?? "",
      note: initialData?.note ?? "",
      tipo_impianti: initialData?.tipo_impianti ?? [],
      marche: initialData?.marche ?? [],
    });
  }, [initialData, reset]);

  const tipoArray = useFieldArray<FormValues, "tipo_impianti">({
    control,
    name: "tipo_impianti",
  });

  const marcheArray = useFieldArray<FormValues, "marche">({
    control,
    name: "marche",
  });

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit((data) => onSubmit(data as ServicePointFormValues))}
        className="space-y-6 p-4"
      >
        <FormField
          control={form.control}
          name="nome_punto_servizio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Punto Servizio</FormLabel>
              <FormControl>
                <Input placeholder="Es. Sede Centrale - Impianti" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="indirizzo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Indirizzo</FormLabel>
                <FormControl>
                  <Input placeholder="Via Roma 1" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="citta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Città</FormLabel>
                <FormControl>
                  <Input placeholder="Milano" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cap"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CAP</FormLabel>
                <FormControl>
                  <Input placeholder="20100" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="provincia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provincia</FormLabel>
                <FormControl>
                  <Input placeholder="MI" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefono</FormLabel>
                <FormControl>
                  <Input placeholder="+39 02 1234567" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="info@cliente.it" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4">
          <FormLabel>Tipi di Impianto</FormLabel>
          <div className="space-y-2">
            {tipoArray.fields.map((f, idx) => (
              <div key={f.id} className="flex gap-2">
                <input
                  {...form.register(`tipo_impianti.${idx}` as const)}
                  placeholder={`Tipo impianto ${idx + 1}`}
                  className="flex-1 rounded-md border px-2 py-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => tipoArray.remove(idx)}
                >
                  Rimuovi
                </Button>
              </div>
            ))}

            <div>
              <Button
                type="button"
                onClick={() => tipoArray.append("")}
                className="mr-2"
              >
                Aggiungi Tipo Impianto
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <FormLabel>Marche</FormLabel>
          <div className="space-y-2">
            {marcheArray.fields.map((f, idx) => (
              <div key={f.id} className="flex gap-2">
                <input
                  {...form.register(`marche.${idx}` as const)}
                  placeholder={`Marca ${idx + 1}`}
                  className="flex-1 rounded-md border px-2 py-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => marcheArray.remove(idx)}
                >
                  Rimuovi
                </Button>
              </div>
            ))}

            <div>
              <Button
                type="button"
                onClick={() => marcheArray.append("")}
                className="mr-2"
              >
                Aggiungi Marca
              </Button>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Annotazioni..." />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Hidden customer_id field is expected to be set by parent/new page */}
        <input type="hidden" {...form.register("customer_id")} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit">Salva Punto Servizio</Button>
        </div>
      </form>
    </Form>
  );
};

export default ServicePointForm;