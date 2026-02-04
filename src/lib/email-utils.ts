import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function sendWorkReportEmail(interventionId: string, recipients: string[] | string) {
  const recipientEmails = Array.isArray(recipients) ? recipients : [recipients];

  const res = await fetch(
    'https://nrdsgtuzpnamcovuzghb.supabase.co/functions/v1/send-work-report-email',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ interventionId, recipientEmails }),
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error || 'Errore durante l’invio email');
  }

  return res.json();
}