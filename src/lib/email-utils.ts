import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { InterventionRequest } from '@/types/intervention'; // Import InterventionRequest

export const sendWorkReportEmail = async (intervention: InterventionRequest, recipientEmails: string[]) => {
  try {
    // Pass the entire intervention object and the array of recipient emails to the Edge Function
    const { data, error } = await supabase.functions.invoke('send-work-report-email', {
      body: { intervention, recipientEmails },
    });

    if (error) {
      console.error('Error invoking send-work-report-email function:', error);
      toast.error(`Errore nell'invio dell'email: ${error.message}`);
      throw error;
    }

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