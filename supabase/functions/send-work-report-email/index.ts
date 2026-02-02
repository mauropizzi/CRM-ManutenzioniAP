import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { format } from 'https://esm.sh/date-fns@3.6.0';
import { it } from 'https://esm.sh/date-fns@3.6.0/locale/it';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configurazione Brevo (Sendinblue)
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

serve(async (req) => {
  console.log("[send-work-report-email] Function invoked with method:", req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("[send-work-report-email] Request body received:", JSON.stringify(body, null, 2));
    
    const { intervention: rawIntervention, recipientEmails } = body;

    if (!rawIntervention || !recipientEmails || recipientEmails.length === 0) {
      console.error("[send-work-report-email] Missing intervention data or recipientEmails");
      return new Response(JSON.stringify({ error: 'Missing intervention data or recipientEmails' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("[send-work-report-email] Processing intervention:", rawIntervention.id);
    console.log("[send-work-report-email] Recipient emails:", recipientEmails);

    // Inizializza il client Supabase per la funzione Edge
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log("[send-work-report-email] SUPABASE_URL exists:", !!supabaseUrl);
    console.log("[send-work-report-email] SUPABASE_SERVICE_ROLE_KEY exists:", !!supabaseServiceKey);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[send-work-report-email] Missing Supabase environment variables");
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing Supabase credentials' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Recupera i dettagli dell'intervento dal DB per sicurezza e completezza
    console.log("[send-work-report-email] Fetching intervention from database...");
    const { data: intervention, error: interventionError } = await supabaseClient
      .from('interventions')
      .select('*')
      .eq('id', rawIntervention.id)
      .single();

    if (interventionError || !intervention) {
      console.error("[send-work-report-email] Error fetching intervention:", interventionError?.message);
      return new Response(JSON.stringify({ error: 'Intervention not found or database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log("[send-work-report-email] Intervention fetched successfully:", intervention.id);

    // Recupera API Key Brevo
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    console.log("[send-work-report-email] BREVO_API_KEY exists:", !!brevoApiKey);
    
    if (!brevoApiKey) {
      console.error("[send-work-report-email] BREVO_API_KEY is not set in environment variables");
      return new Response(JSON.stringify({ 
        error: 'BREVO_API_KEY not configured. Please add it to Supabase Edge Function secrets in the dashboard: Project Settings > Edge Functions > Secrets' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Deserializza work_report_data se presente
    let workReportData = {};
    try {
      workReportData = intervention.work_report_data ? JSON.parse(JSON.stringify(intervention.work_report_data)) : {};
      console.log("[send-work-report-email] Work report data parsed successfully");
    } catch (parseError) {
      console.error("[send-work-report-email] Error parsing work_report_data:", parseError);
      workReportData = {};
    }

    // Calcola il totale delle ore
    const totalHours = workReportData.time_entries?.reduce((sum: number, entry: any) => sum + (entry.total_hours || 0), 0) || 0;
    console.log("[send-work-report-email] Total hours calculated:", totalHours);

    // Costruisci il corpo email HTML
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

        <p style="margin-top: 30px;">Cordiali saluti,<br/>Antonelli & Zani Refrigerazioni</p>
        <p style="font-size: 0.8em; color: #777; margin-top: 15px;">Questa è un'email generata automaticamente, non è possibile rispondere.</p>
      </div>
    `;

    // Prepara i destinatari nel formato richiesto da Brevo
    const toRecipients = recipientEmails.map((email: string) => ({
      email: email,
      name: intervention.client_company_name || 'Cliente'
    }));

    console.log("[send-work-report-email] Preparing to send email via Brevo to:", toRecipients);

    // Invia email tramite API Brevo
    console.log("[send-work-report-email] Sending request to Brevo API...");
    
    const brevoResponse = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Antonelli & Zani Refrigerazioni',
          email: 'noreply@antonellizani.it'
        },
        to: toRecipients,
        subject: `Bolla di Consegna Intervento - ${intervention.client_company_name}`,
        htmlContent: emailHtml,
      }),
    });

    console.log("[send-work-report-email] Brevo response status:", brevoResponse.status);

    if (!brevoResponse.ok) {
      let errorMessage = 'Unknown Brevo error';
      try {
        const errorData = await brevoResponse.json();
        console.error("[send-work-report-email] Brevo API error response:", errorData);
        errorMessage = errorData.message || JSON.stringify(errorData);
      } catch (e) {
        const errorText = await brevoResponse.text();
        console.error("[send-work-report-email] Brevo API error text:", errorText);
        errorMessage = errorText || `HTTP ${brevoResponse.status}`;
      }
      
      return new Response(JSON.stringify({ 
        error: `Errore Brevo: ${errorMessage}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const responseData = await brevoResponse.json();
    console.log("[send-work-report-email] Email sent successfully. MessageId:", responseData.messageId);

    return new Response(JSON.stringify({ 
      message: 'Email sent successfully', 
      messageId: responseData.messageId 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("[send-work-report-email] Unhandled exception:", error.message, error.stack);
    return new Response(JSON.stringify({ error: `Internal server error: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});