import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

let cachedLogoDataUrl: string | null = null;

async function getLogoDataUrl() {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;

  const res = await fetch('/nuovo-logo.jpeg');
  if (!res.ok) throw new Error('Impossibile caricare il logo');

  const blob = await res.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Impossibile leggere il logo'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(blob);
  });

  cachedLogoDataUrl = dataUrl;
  return dataUrl;
}

const SEND_WORK_REPORT_EMAIL_URL =
  'https://nrdsgtuzpnamcovuzghb.supabase.co/functions/v1/send-work-report-email';

export async function sendWorkReportEmail(interventionId: string, recipients: string[] | string) {
  const recipientEmails = Array.isArray(recipients) ? recipients : [recipients];
  const logoDataUrl = await getLogoDataUrl();

  const res = await fetch(SEND_WORK_REPORT_EMAIL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ interventionId, recipientEmails, logoDataUrl }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error || 'Errore durante l’invio email');
  }

  return res.json();
}

export async function fetchWorkReportPdf(interventionId: string) {
  const logoDataUrl = await getLogoDataUrl();

  const res = await fetch(SEND_WORK_REPORT_EMAIL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ interventionId, logoDataUrl, pdfOnly: true }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error || 'Errore durante la generazione del PDF');
  }

  return res.json() as Promise<{ pdfBase64: string; filename: string }>;
}