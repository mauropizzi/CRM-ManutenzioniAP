"use client";

import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Printer, Mail } from 'lucide-react';
import { WorkReportFormValues } from '@/components/work-report-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { fetchWorkReportPdf, sendWorkReportEmail } from '@/lib/email-utils';
import { toast } from 'sonner';

interface WorkReportBasicInfoProps {
  clientName?: string;
  clientEmail?: string; // Aggiunto clientEmail come prop
  interventionId?: string;
}

export const WorkReportBasicInfo = ({ clientName, clientEmail, interventionId }: WorkReportBasicInfoProps) => {
  const { control, getValues, setValue } = useFormContext<WorkReportFormValues>(); // Destrutturato setValue
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(clientEmail || '');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!interventionId) {
      toast.error('ID intervento non disponibile per la generazione del PDF.');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const { pdfBase64, filename } = await fetchWorkReportPdf(interventionId);
      const bytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // Apri in una nuova scheda (evita download automatico per non creare doppio evento)
      window.open(url, '_blank', 'noopener,noreferrer');

      // cleanup (lasciamo un attimo tempo al browser)
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (e: any) {
      toast.error(e?.message || 'Errore durante la generazione del PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSendEmail = async () => {
    if (!interventionId) {
      toast.error("ID intervento non disponibile per l'invio dell'email.");
      return;
    }
    if (!recipientEmail) {
      toast.error("Inserisci almeno un indirizzo email.");
      return;
    }

    // Parsa più indirizzi separati da virgole
    const emails = recipientEmail
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    // Validazione semplice email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalid = emails.filter((e) => !emailRegex.test(e));
    if (invalid.length > 0) {
      toast.error(`Email non valide: ${invalid.join(', ')}`);
      return;
    }

    setIsSendingEmail(true);
    try {
      await sendWorkReportEmail(interventionId, emails);
      setIsEmailDialogOpen(false);
      toast.success(`Email inviata a ${emails.length} destinatario/i.`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-6 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Bolla di lavoro (operativo)
        </h3>
        {clientName && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Cliente: {clientName}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <FormField
          control={control}
          name="client_absent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-medium">
                  Cliente assente (firma non raccolta)
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        {/* Pulsante PDF (stesso identico dell'email) */}
        {interventionId && (
          <Button
            type="button"
            variant="outline"
            className="ml-auto flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
          >
            <Printer size={16} />
            {isGeneratingPdf ? 'Generazione...' : 'Scarica PDF'}
          </Button>
        )}

        {/* Pulsante Invia Email */}
        {interventionId && (
          <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-blue-600 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700"
                onClick={() => setRecipientEmail(clientEmail || '')}
              >
                <Mail size={16} />
                Invia Email
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-lg bg-white dark:bg-gray-900 p-6 shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">Invia Bolla di Consegna via Email</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Inserisci l'indirizzo email del destinatario.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <FormLabel htmlFor="email" className="text-right text-gray-700 dark:text-gray-300">
                    Email
                  </FormLabel>
                  <Input
                    id="email"
                    type="text"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="es. email1@dominio.it, email2@dominio.it"
                    className="col-span-3 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEmailDialogOpen(false)}
                  className="rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Annulla
                </Button>
                <Button 
                  type="button" 
                  onClick={handleSendEmail} 
                  disabled={isSendingEmail}
                  className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                >
                  {isSendingEmail ? 'Invio...' : 'Invia'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <div className="ml-auto">
          <Select onValueChange={(value) => setValue('status', value as any)} defaultValue={getValues('status')}>
            <FormControl>
              <SelectTrigger className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Seleziona stato" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="rounded-md border-gray-300 bg-white dark:bg-gray-900">
              <SelectItem value="Da fare">Da fare</SelectItem>
              <SelectItem value="In corso">In corso</SelectItem>
              <SelectItem value="Completato">Completato</SelectItem>
              <SelectItem value="Annullato">Annullato</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="work_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrizione lavori svolti</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrivi l'intervento..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="operative_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note operative (opz.)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Es. misure, pressioni, anomalie..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};