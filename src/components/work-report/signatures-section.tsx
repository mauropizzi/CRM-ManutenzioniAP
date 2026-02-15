"use client";

import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { WorkReportFormValues } from '@/components/work-report-form';
import { SignaturePad } from '@/components/signature-pad';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PenTool } from 'lucide-react';

export function SignaturesSection() {
  const {
    watch,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<WorkReportFormValues>();

  const clientAbsent = watch('client_absent');
  const clientSignature = watch('client_signature');
  const technicianSignature = watch('technician_signature');

  useEffect(() => {
    if (clientAbsent) {
      if (clientSignature) {
        setValue('client_signature', '', { shouldDirty: true, shouldValidate: true });
      }
      setValue('client_signer_name', '', { shouldDirty: true, shouldValidate: true });
    }
  }, [clientAbsent, clientSignature, setValue]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-warning/10 flex items-center justify-center">
            <PenTool className="h-5 w-5 text-warning" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg">Firme</CardTitle>
            <p className="text-sm text-text-secondary mt-0.5">
              Da smartphone puoi firmare direttamente con il dito. La firma tecnico è valida anche per fornitori.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sezione Cliente */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client_signer_name" className={clientAbsent ? 'opacity-50' : ''}>
                Nome e Cognome di chi firma (Cliente)
              </Label>
              <Input
                id="client_signer_name"
                placeholder="Inserisci nome e cognome"
                disabled={clientAbsent}
                {...register('client_signer_name')}
                className={`rounded-xl ${errors.client_signer_name ? 'border-rose-500' : ''}`}
              />
              {errors.client_signer_name?.message && (
                <p className="text-xs font-semibold text-rose-600">
                  {String(errors.client_signer_name.message)}
                </p>
              )}
            </div>

            <SignaturePad
              label="Firma cliente"
              hint={clientAbsent ? 'Cliente assente firma non raccolta' : 'Firma richiesta'}
              value={clientSignature}
              onChange={(v) => setValue('client_signature', v, { shouldDirty: true, shouldValidate: true })}
              disabled={clientAbsent}
            />
          </div>

          {/* Sezione Tecnico */}
          <div className="flex flex-col justify-end">
            <SignaturePad
              label="Firma tecnico"
              hint="Obbligatoria per chiusura"
              value={technicianSignature}
              onChange={(v) => setValue('technician_signature', v, { shouldDirty: true, shouldValidate: true })}
            />
            {errors.technician_signature?.message ? (
              <div className="mt-2 text-xs font-semibold text-rose-600">
                {String(errors.technician_signature.message)}
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}