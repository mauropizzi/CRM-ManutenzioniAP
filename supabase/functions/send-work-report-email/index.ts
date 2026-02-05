// @ts-nocheck

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from 'https://esm.sh/resend@1.1.0';
import jsPDF from "https://esm.sh/jspdf@2.5.1";
import autoTable from "https://esm.sh/jspdf-autotable@3.5.31";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interventionId, recipientEmails } = await req.json();
    console.log("[send-work-report-email] Received request for interventionId:", interventionId, "recipientEmails:", recipientEmails);

    if (!interventionId || !recipientEmails || !Array.isArray(recipientEmails) || recipientEmails.length === 0) {
      console.error("[send-work-report-email] Missing interventionId or recipientEmails. Status: 400");
      return new Response(JSON.stringify({ error: 'Missing interventionId or recipientEmails' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: intervention, error: interventionError } = await supabaseClient
      .from('interventions')
      .select('*')
      .eq('id', interventionId)
      .single();

    if (interventionError || !intervention) {
      console.error("[send-work-report-email] Error fetching intervention:", interventionError?.message);
      return new Response(JSON.stringify({ error: 'Intervention not found' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error("[send-work-report-email] RESEND_API_KEY is not set.");
      return new Response(JSON.stringify({ error: 'Email service configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resend = new Resend(resendApiKey);

    const sanitizeText = (text: any) => {
      if (!text) return "";
      const str = String(text);
      const normalized = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const safeText = normalized.replace(/&/g, " e ");
      return safeText;
    };

    console.log("[send-work-report-email] Generating PDF...");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Antonelli  e  Pellizzari", 14, yPosition);
    yPosition += 8;
    doc.setFontSize(14);
    doc.text("Refrigerazioni", 14, yPosition);
    yPosition += 10;

    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text("Bolla di Consegna", pageWidth - 60, 20);
    doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, pageWidth - 70, 28);
    yPosition += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPosition, pageWidth - 14, yPosition);
    yPosition += 10;
    doc.setTextColor(0, 0, 0);

    const addText = (label: string, value: string | undefined, yPos: number) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(label + ": ", 14, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(sanitizeText(value) || "N/D", 55, yPos);
      return yPos + 7;
    };

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Dati Cliente", 14, yPosition);
    yPosition += 7;
    yPosition = addText("Ragione Sociale", intervention.client_company_name, yPosition);
    yPosition = addText("Indirizzo", intervention.client_address, yPosition);
    yPosition = addText("Email", intervention.client_email, yPosition);
    yPosition = addText("Telefono", intervention.client_phone, yPosition);
    yPosition = addText("Referente", intervention.client_referent, yPosition);
    yPosition += 5;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Dati Impianto", 14, yPosition);
    yPosition += 7;
    yPosition = addText("Tipo Impianto", intervention.system_type, yPosition);
    yPosition = addText("Marca", intervention.brand, yPosition);
    yPosition = addText("Modello", intervention.model, yPosition);
    yPosition = addText("Matricola", intervention.serial_number, yPosition);
    yPosition = addText("Ubicazione", intervention.system_location, yPosition);
    yPosition = addText("Rif. Interno", intervention.internal_ref, yPosition);
    yPosition += 5;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Dettagli Lavoro", 14, yPosition);
    yPosition += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const workDesc = (intervention.work_report_data as any)?.work_description || "Nessuna descrizione";
    const splitDesc = doc.splitTextToSize(sanitizeText(workDesc), pageWidth - 28);
    doc.text(splitDesc, 14, yPosition);
    yPosition += (splitDesc.length * 5) + 5;

    const workNotes = (intervention.work_report_data as any)?.operative_notes || "Nessuna nota";
    const splitNotes = doc.splitTextToSize("Note Operative: " + sanitizeText(workNotes), pageWidth - 28);
    doc.text(splitNotes, 14, yPosition);
    yPosition += (splitNotes.length * 5) + 10;

    const timeEntries = (intervention.work_report_data as any)?.time_entries || [];
    if (timeEntries.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Ore di Lavoro", 14, yPosition);
      yPosition += 7;

      const totalHours = timeEntries.reduce((sum: number, entry: any) => sum + (entry.total_hours || 0), 0);

      autoTable(doc, {
        startY: yPosition,
        head: [['Data', 'Tecnico', 'Fascia 1', 'Fascia 2', 'Ore']],
        body: timeEntries.map((entry: any) => [
          entry.date ? new Date(entry.date).toLocaleDateString('it-IT') : 'N/D',
          sanitizeText(entry.technician),
          `${entry.time_slot_1_start} - ${entry.time_slot_1_end}`,
          entry.time_slot_2_start ? `${entry.time_slot_2_start} - ${entry.time_slot_2_end}` : 'N/D',
          entry.total_hours.toFixed(2)
        ]),
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });

      const finalY = (doc as any).lastAutoTable.finalY;
      doc.setFontSize(10);
      doc.text(`Totale Ore: ${totalHours.toFixed(2)}`, 14, finalY + 10);

      const km = (intervention.work_report_data as any)?.kilometers;
      if (km !== undefined) {
        doc.text(`Km percorsi: ${km}`, 14, finalY + 18);
      }

      yPosition = finalY + 25;
    }

    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    const materials = (intervention.work_report_data as any)?.materials || [];
    if (materials.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Materiali Utilizzati", 14, yPosition);
      yPosition += 7;

      autoTable(doc, {
        startY: yPosition,
        head: [['U.M.', 'Quantità', 'Descrizione']],
        body: materials.map((mat: any) => [
          mat.unit || 'N/D',
          mat.quantity,
          sanitizeText(mat.description) || 'N/D'
        ]),
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });
    }

    const pdfData = doc.output('datauristring');
    const pdfBase64 = pdfData.split(',')[1];

    // IMPORTANT: If you send from Resend's onboarding domain, Resend may only deliver to verified recipients.
    // Prefer a verified sender on your domain.
    const fromEmailEnv = Deno.env.get('RESEND_FROM_EMAIL');
    const fromEmail = fromEmailEnv ?? '"Antonelli & Pellizzari Refrigerazioni" <bolla@send.lumafinsrl.com>';

    const subject = `Bolla di Consegna - ${intervention.client_company_name}`;
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Gentile ${intervention.client_company_name},</h2>
        <p style="color: #333;">
          Le inviamo alleghata la bolla di consegna in formato PDF relativa all'intervento sul suo impianto 
          <b>${intervention.system_type} ${intervention.brand} ${intervention.model}</b>.
        </p>
        <p style="color: #333;">Cordiali saluti,</p>
        <p style="color: #333; font-weight: bold;">Antonelli & Pellizzari Refrigerazioni</p>
      </div>
    `;

    console.log("[send-work-report-email] Sending email...", { fromEmail, recipientsCount: recipientEmails.length });
    const results: Array<{ to: string; ok: boolean; error?: string }> = [];

    if (recipientEmails.length > 1) {
      console.log("[send-work-report-email] Attempting single send with BCC...", { to: recipientEmails[0], bccCount: recipientEmails.length - 1 });
      const { error: resendError } = await resend.emails.send({
        from: fromEmail,
        to: recipientEmails[0],
        bcc: recipientEmails.slice(1),
        subject,
        html: emailContent,
        attachments: [
          {
            filename: `Bolla_${(intervention.client_company_name || 'sconosciuto').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}.pdf`,
            content: pdfBase64
          }
        ]
      });

      if (resendError) {
        console.error("[send-work-report-email] BCC send failed, falling back to per-recipient sends:", resendError);
      } else {
        recipientEmails.forEach((addr) => results.push({ to: addr, ok: true }));
        return new Response(JSON.stringify({ message: 'Email inviate (BCC)', results }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    for (const to of recipientEmails) {
      const { error: resendError } = await resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html: emailContent,
        attachments: [
          {
            filename: `Bolla_${(intervention.client_company_name || 'sconosciuto').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}.pdf`,
            content: pdfBase64
          }
        ]
      });

      if (resendError) {
        console.error("[send-work-report-email] Error sending email:", resendError);
        results.push({ to, ok: false, error: resendError.message });
      } else {
        results.push({ to, ok: true });
      }
    }

    const allOk = results.every(r => r.ok);
    return new Response(JSON.stringify({ message: allOk ? 'Email inviate' : 'Alcune email non sono state inviate', results }), {
      status: allOk ? 200 : 207,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("[send-work-report-email] Generic error:", error.message);
    console.error("[send-work-report-email] Error stack:", error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});