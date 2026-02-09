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

export async function sendWorkReportEmail(interventionId: string, recipients: string[] | string) {
  const recipientEmails = Array.isArray(recipients) ? recipients : [recipients];
  const logoDataUrl = await getLogoDataUrl();

  const res = await fetch(
    'https://nrdsgtuzpnamcovuzghb.supabase.co/functions/v1/send-work-report-email',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ interventionId, recipientEmails, logoDataUrl }),
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error || 'Errore durante l’invio email');
  }

  return res.json();
}