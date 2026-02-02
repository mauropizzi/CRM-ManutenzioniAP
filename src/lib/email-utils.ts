import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const sendWorkReportEmail = async (interventionId: string, recipientEmail: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-work-report-email', {
      body: { interventionId, recipientEmail },
    });

    if (error) {
      console.error('Error invoking send-work-report-email function:', error);
      toast.error(`Errore nell'invio dell'email: ${error.message}`);
      throw error;
    }

    // Le funzioni Edge restituiscono un oggetto Response, quindi il 'data' qui è il body della risposta.
    // Dobbiamo parsare il JSON se la funzione Edge restituisce JSON.
    const responseBody = data as { error?: string; message?: string };

    if (responseBody.error) {
      console.error('Error from Edge Function:', responseBody.error);
      toast.error(`Errore nell'invio dell'email: ${responseBody.error}`);
      throw new Error(responseBody.error);
    }

    toast.success('Email inviata con successo!');
    return responseBody;
  } catch (error: any) {
    console.error('Exception in sendWorkReportEmail:', error);
    toast.error(`Errore nell'invio dell'email: ${error.message || 'Errore sconosciuto'}`);
    throw error;
  }
};