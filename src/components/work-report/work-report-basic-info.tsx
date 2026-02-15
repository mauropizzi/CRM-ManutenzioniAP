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
import { Printer, Mail, ClipboardList } from 'lucide-react';
import { WorkReportFormValues } from '@/components/work-report-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkReportBasicInfoProps {
  clientName?: string;
  clientEmail?: string;
  interventionId?: string;
}

export const WorkReportBasicInfo = ({ clientName, clientEmail, interventionId }: WorkReportBasicInfoProps) => {
  const { control, getValues, setValue } = useFormContext<WorkReportFormValues>();
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
      const { pdfBase64 } = await fetchWorkReportPdf(interventionId);
      const bytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      window.open(url, '_blank', 'noopener,noreferrer');
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
      toast.error('Inserisci almeno un indirizzo email.');
      return;
    }

    const emails = recipientEmail
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

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
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Bolla di lavoro (operativo)</CardTitle>
              {clientName ? (
                <p className="text-sm text-text-secondary mt-0.5">Cliente: {clientName}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {interventionId && (
              <Button
                type="button"
                variant="outline"
                className="gap-2 rounded-xl"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
              >
                <Printer size={16} />
                {isGeneratingPdf ? 'Generazione…' : 'Scarica PDF'}
              </Button>
            )}

            {interventionId && (
              <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 rounded-xl text-primary hover:bg-primary/5"
                    onClick={() => setRecipientEmail(clientEmail || '')}
                  >
                    <Mail size={16} />
                    Invia Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[460px] rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-lg">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Invia Bolla di Consegna via Email</DialogTitle>
                    <DialogDescription className="text-text-secondary">
                      Puoi inserire più indirizzi separati da virgola.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 gap-2">
                      <FormLabel htmlFor="email" className="text-sm">
                        Email destinatari
                      </FormLabel>
                      <Input
                        id="email"
                        type="text"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="es. email1@dominio.it, email2@dominio.it"
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <DialogFooter className="gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEmailDialogOpen(false)}
                      className="rounded-xl"
                    >
                      Annulla
                    </Button>
                    <Button type="button" onClick={handleSendEmail} disabled={isSendingEmail} className="rounded-xl">
                      {isSendingEmail ? 'Invio…' : 'Invia'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <Select
              onValueChange={(value) => setValue('status', value as any)}
              defaultValue={getValues('status')}
            >
              <FormControl>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Seleziona stato" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="rounded-xl">
                <SelectItem value="Da fare">Da fare</SelectItem>
                <SelectItem value="In corso">In corso</SelectItem>
                <SelectItem value="Completato">Completato</SelectItem>
                <SelectItem value="Annullato">Annullato</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-4">
          <FormField
            control={control}
            name="client_absent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium">
                    Cliente assente (firma non raccolta)
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <FormField
            control={control}
            name="work_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrizione lavori svolti</FormLabel>
                <FormControl>
                  <Textarea placeholder="Descrivi l'intervento..." className="min-h-[120px] rounded-xl" {...field} />
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
                    className="min-h-[120px] rounded-xl"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};