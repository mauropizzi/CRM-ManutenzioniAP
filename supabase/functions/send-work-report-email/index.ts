import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from 'https://esm.sh/resend@1.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Funzione semplice per formattare la data
const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'N/D';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT');
  } catch {
    return 'N/D';
  }
};

serve(async (req) => {
  console.log("[send-work-report-email] Function started");
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { intervention: rawIntervention, recipientEmails } = body;

    if (!rawIntervention?.id || !recipientEmails?.length) {
      return new Response(JSON.stringify({ error: 'Missing data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check env vars
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase env vars' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch intervention
    const { data: intervention, error: dbError } = await supabaseClient
      .from('interventions')
      .select('*')
      .eq('id', rawIntervention.id)
      .single();

    if (dbError || !intervention) {
      return new Response(JSON.stringify({ error: 'Intervention not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse work_report_data
    let workReportData: any = {};
    try {
      if (intervention.work_report_data) {
        workReportData = typeof intervention.work_report_data === 'string' 
          ? JSON.parse(intervention.work_report_data)
          : intervention.work_report_data;
      }
    } catch (e) {
      workReportData = {};
    }

    // Calculate hours
    const totalHours = workReportData.time_entries?.reduce((sum: number, entry: any) => {
      return sum + (parseFloat(entry.total_hours) || 0);
    }, 0) || 0;

    // Build email HTML
    const timeEntriesHtml = workReportData.time_entries?.map((entry: any) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${formatDate(entry.date)}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${entry.technician || 'N/D'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${entry.time_slot_1_start || '--'} - ${entry.time_slot_1_end || '--'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${entry.time_slot_2_start && entry.time_slot_2_end ? `${entry.time_slot_2_start} - ${entry.time_slot_2_end}` : 'N/D'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${(parseFloat(entry.total_hours) || 0).toFixed(2)}</td>
      </tr>
    `).join('') || '';

    const materialsHtml = workReportData.materials?.map((m: any) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${m.unit || 'N/D'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${m.quantity || 0}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${m.description || 'N/D'}</td>
      </tr>
    `).join('') || '';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0056b3;">Bolla di Consegna Intervento</h2>
        <p>Gentile Cliente <strong>${intervention.client_company_name || 'Cliente'}</strong>,</p>
        <p>Le inviamo la bolla di consegna relativa all'intervento sul suo impianto.</p>
        
        <h3 style="color: #0056b3;">Dettagli Cliente</h3>
        <ul>
          <li><strong>Ragione Sociale:</strong> ${intervention.client_company_name || 'N/D'}</li>
          <li><strong>Indirizzo:</strong> ${intervention.client_address || 'N/D'}</li>
          <li><strong>Email:</strong> ${intervention.client_email || 'N/D'}</li>
          <li><strong>Telefono:</strong> ${intervention.client_phone || 'N/D'}</li>
          <li><strong>Referente:</strong> ${intervention.client_referent || 'N/D'}</li>
        </ul>

        <h3 style="color: #0056b3;">Dettagli Impianto</h3>
        <ul>
          <li><strong>Tipo Impianto:</strong> ${intervention.system_type || 'N/D'}</li>
          <li><strong>Marca:</strong> ${intervention.brand || 'N/D'}</li>
          <li><strong>Modello:</strong> ${intervention.model || 'N/D'}</li>
          <li><strong>Matricola:</strong> ${intervention.serial_number || 'N/D'}</li>
          <li><strong>Ubicazione:</strong> ${intervention.system_location || 'N/D'}</li>
        </ul>

        <h3 style="color: #0056b3;">Lavoro Svolto</h3>
        <p><strong>Descrizione:</strong> ${workReportData.work_description || 'Nessuna descrizione.'}</p>
        <p><strong>Note Operative:</strong> ${workReportData.operative_notes || 'Nessuna nota.'}</p>

        ${timeEntriesHtml ? `
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
            <tbody>${timeEntriesHtml}</tbody>
          </table>
          <p style="text-align: right; font-weight: bold;">Totale Ore: ${totalHours.toFixed(2)}</p>
          ${workReportData.kilometers ? `<p style="text-align: right; font-weight: bold;">Km: ${workReportData.kilometers}</p>` : ''}
        ` : ''}

        ${materialsHtml ? `
          <h3 style="color: #0056b3;">Materiali Utilizzati</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">U.M.</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Qta</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Descrizione</th>
              </tr>
            </thead>
            <tbody>${materialsHtml}</tbody>
          </table>
        ` : ''}

        <p style="margin-top: 30px;">Cordiali saluti,<br/>Antonelli & Zani Refrigerazioni</p>
      </div>
    `;

    // Initialize Resend
    const resend = new Resend(resendApiKey);

    console.log("[send-work-report-email] Sending via Resend to:", recipientEmails);

    // Send email via Resend
    const { data, error: resendError } = await resend.emails.send({
      from: 'Antonelli & Zani Refrigerazioni <onboarding@resend.dev>',
      to: recipientEmails,
      subject: `Bolla di Consegna - ${intervention.client_company_name || 'Intervento'}`,
      html: emailHtml,
    });

    if (resendError) {
      console.error("[send-work-report-email] Resend error:", resendError);
      
      // Gestione specifica per l'errore del dominio di test
      if (resendError.message?.includes('can only send to the email address associated with your account')) {
        return new Response(JSON.stringify({ 
          error: 'LIMITAZIONE_RESEND: Con il dominio di test (onboarding@resend.dev) puoi inviare solo al tuo indirizzo email verificato. Per inviare ai clienti, verifica un dominio personalizzato su Resend.',
          code: 'TEST_DOMAIN_LIMIT'
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: resendError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("[send-work-report-email] Email sent successfully:", data);
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("[send-work-report-email] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});