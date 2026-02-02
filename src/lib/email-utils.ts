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

    // Gestione risposta di successo
    if (data && data.success) {
      console.log('[email-utils] Email sent successfully, messageId:', data.messageId);
      toast.success(`Email inviata con successo a ${recipientEmails.join(', ')}!`, { duration: 5000 });
      return data;
    }

    // Gestione errore dalla funzione
    if (data && data.error) {
      console.error('[email-utils] Error from edge function:', data.error);
      toast.error(`Errore: ${data.error}`, { duration: 6000 });
      throw new Error(data.error);
    }

    // Caso inatteso
    console.warn('[email-utils] Unexpected response:', data);
    toast.success('Email processata (verifica la dashboard Brevo)');
    return data;
    
  } catch (error: any) {
    console.error('[email-utils] Exception:', error);
    if (!error.message?.includes('toast')) {
      toast.error(`Errore: ${error.message || 'Errore sconosciuto'}`);
    }
    throw error;
  }
};