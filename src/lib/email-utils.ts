import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { InterventionRequest } from '@/types/intervention';

export const sendWorkReportEmail = async (intervention: InterventionRequest, recipientEmails: string[]) => {
  console.log('[email-utils] Starting email send to:', recipientEmails);
  
  try {
    const { data, error } = await supabase.functions.invoke('send-work-report-email', {
      body: { intervention, recipientEmails },
    });

    console.log('[email-utils] Edge function response:', { data, error });

    if (error) {
      console.error('[email-utils] Error invoking function:', error);
      toast.error(`Errore nell'invio dell'email: ${error.message}`);
      throw error;
    }

    // Gestione errore specifico Resend (dominio di test)
    if (data?.code === 'TEST_DOMAIN_LIMIT') {
      toast.error(data.error, { 
        duration: 8000,
        description: "Per inviare ai clienti, verifica un dominio personalizzato su Resend o usa il tuo indirizzo email per i test."
      });
      throw new Error(data.error);
    }

    // Gestione altri errori
    if (data?.error) {
      console.error('[email-utils] Error from edge function:', data.error);
      toast.error(`Errore: ${data.error}`, { duration: 6000 });
      throw new Error(data.error);
    }

    // Successo
    if (data?.success) {
      console.log('[email-utils] Email sent successfully:', data.data);
      toast.success(`Email inviata con successo!`, { duration: 5000 });
      return data;
    }

    // Caso inatteso
    console.warn('[email-utils] Unexpected response:', data);
    return data;
    
  } catch (error: any) {
    console.error('[email-utils] Exception:', error);
    // Non mostrare toast se già mostrato sopra
    if (!error.message?.includes('LIMITAZIONE_RESEND')) {
      toast.error(`Errore: ${error.message || 'Errore sconosciuto'}`);
    }
    throw error;
  }
};