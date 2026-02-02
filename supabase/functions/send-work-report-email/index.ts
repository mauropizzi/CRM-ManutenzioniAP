import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from 'https://esm.sh/resend@1.1.0';
import { format } from 'https://esm.sh/date-fns@3.6.0'; // Importa format da date-fns
import { it } from 'https://esm.sh/date-fns@3.6.0/locale/it'; // Importa la locale italiana

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { intervention: rawIntervention, recipientEmails } = await req.json(); // Ora riceve un array
    console.log("[send-work-report-email] Received request for interventionId:", rawIntervention.id, "recipientEmails:", recipientEmails);

    if (!rawIntervention || !recipientEmails || recipientEmails.length === 0) {
      console.error("[send-work-report-email] Missing intervention data or recipientEmails. Status: 400");
      return new Response(JSON.stringify({ error: 'Missing intervention data or recipientEmails' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Inizializza il client Supabase per la funzione Edge
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Recupera i dettagli dell'intervento dal DB per sicurezza e completezza
    const { data: intervention, error: interventionError } = await supabaseClient
      .from('interventions')
      .select('*')
      .eq('id', rawIntervention.id)
      .single();

    if (interventionError || !intervention) {
      console.error("[send-work-report-email] Error fetching intervention or not found. Status: 500. Error:", interventionError?.message);
      return new Response(JSON.stringify({ error: 'Intervention not found or database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log("[send-work-report-email] Intervention fetched successfully:", intervention.id);

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error("[send-work-report-email] RESEND_API_KEY is not set. Status: 500");
      return new Response(JSON.stringify({ error: 'Email service API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log("[send-work-report-email] RESEND_API_KEY is set.");

    const resend = new Resend(resendApiKey);

    // Deserializza work_report_data se presente
    const workReportData = intervention.work_report_data ? JSON.parse(JSON.stringify(intervention.work_report_data)) : {};

    // Calcola il totale delle ore
    const totalHours = workReportData.time_entries?.reduce((sum: number, entry: any) => sum + (entry.total_hours || 0), 0) || 0;

    // Costruisci un corpo email HTML più ricco
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0056b3;">Bolla di Consegna Intervento</h2>
        <p>Gentile Cliente <strong>${intervention.client_company_name}</strong>,</p>
        <p>Le inviamo la bolla di consegna relativa all'intervento sul suo impianto.</p>
        
        <h3 style="color: #0056b3;">Dettagli Cliente</h3>
        <ul>
          <li><strong>Ragione Sociale:</strong> ${intervention.client_company_name}</li>
          <li><strong>Indirizzo:</strong> ${intervention.client_address}</li>
          <li><strong>Email:</strong> ${intervention.client_email}</li>
          <li><strong>Telefono:</strong> ${intervention.client_phone}</li>
          <li><strong>Referente:</strong> ${intervention.client_referent || 'N/D'}</li>
        </ul>

        <h3 style="color: #0056b3;">Dettagli Impianto</h3>
        <ul>
          <li><strong>Tipo Impianto:</strong> ${intervention.system_type}</li>
          <li><strong>Marca:</strong> ${intervention.brand}</li>
          <li><strong>Modello:</strong> ${intervention.model}</li>
          <li><strong>Matricola:</strong> ${intervention.serial_number}</li>
          <li><strong>Ubicazione:</strong> ${intervention.system_location}</li>
          <li><strong>Rif. Interno:</strong> ${intervention.internal_ref || 'N/D'}</li>
        </ul>

        <h3 style="color: #0056b3;">Lavoro Svolto</h3>
        <p><strong>Descrizione:</strong> ${workReportData.work_description || 'Nessuna descrizione fornita.'}</p>
        <p><strong>Note Operative:</strong> ${workReportData.operative_notes || 'Nessuna nota operativa.'}</p>

        ${workReportData.time_entries && workReportData.time_entries.length > 0 ? `
          <h3 style="color: #0056b3;">Ore di Lavoro</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Data</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Tecnico</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Fascia 1</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Fascia 2</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Ore</th>
              </tr>
            </thead>
            <tbody>
              ${workReportData.time_entries.map((entry: any) => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">${entry.date ? format(new Date(entry.date), 'dd/MM/yyyy', { locale: it }) : 'N/D'}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${entry.technician}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${entry.time_slot_1_start} - ${entry.time_slot_1_end}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${entry.time_slot_2_start && entry.time_slot_2_end ? `${entry.time_slot_2_start} - ${entry.time_slot_2_end}` : 'N/D'}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${entry.total_hours.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="text-align: right; font-weight: bold;">Totale Ore: ${totalHours.toFixed(2)}</p>
          ${workReportData.kilometers !== undefined ? `<p style="text-align: right; font-weight: bold;">Km percorsi: ${workReportData.kilometers}</p>` : ''}
        ` : ''}

        ${workReportData.materials && workReportData.materials.length > 0 ? `
          <h3 style="color: #0056b3;">Materiali Utilizzati</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">U.M.</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Quantità</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Descrizione</th>
              </tr>
            </thead>
            <tbody>
              ${workReportData.materials.map((material: any) => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">${material.unit || 'N/D'}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${material.quantity}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${material.description || 'N/D'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <p style="margin-top: 30px;">Cordiali saluti,<br/>Antonelli & Pellizzari Refrigerazioni</p>
        <p style="font-size: 0.8em; color: #777; margin-top: 15px;">Questa è un'email generata automaticamente, non è possibile rispondere.</p>
      </div>
    `;

    const fromEmail = 'Antonelli & Pellizzari Refrigerazioni <onboarding@resend.dev>';
    console.log("[send-work-report-email] Attempting to send email from:", fromEmail, "to:", recipientEmails);

    const { data, error: resendError } = await resend.emails.send({
      from: fromEmail,
      to: recipientEmails, // Passa l'array di destinatari
      subject: `Bolla di Consegna Intervento ${intervention.client_company_name}`,
      html: emailHtml,
    });

    if (resendError) {
      console.error("[send-work-report-email] Error sending email via Resend. Status: 500. Error:", resendError);
      return new Response(JSON.stringify({ error: resendError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("[send-work-report-email] Email sent successfully:", data);
    return new Response(JSON.stringify({ message: 'Email sent successfully', data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("[send-work-report-email] Generic error in Edge Function. Status: 500. Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});