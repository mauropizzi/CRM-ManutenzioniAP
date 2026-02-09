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
    const { interventionId, recipientEmails, logoDataUrl } = await req.json();
    console.log("[send-work-report-email] Received request", { interventionId, recipientEmails, hasLogo: Boolean(logoDataUrl) });

    if (!interventionId || !recipientEmails || !Array.isArray(recipientEmails) || recipientEmails.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing interventionId or recipientEmails' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const recipients = Array.from(
      new Set(recipientEmails.map((e: any) => String(e || '').trim().toLowerCase()).filter(Boolean))
    );

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
      return new Response(JSON.stringify({ error: 'Intervention not found' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const resend = new Resend(resendApiKey);

    const sanitizeText = (text: any) => {
      if (!text) return "";
      const str = String(text);
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, " e ");
    };

    const clampToDataUrl = (maybeDataUrl: any) => {
      const v = String(maybeDataUrl || '').trim();
      if (!v) return '';
      if (v.startsWith('data:image/')) return v;
      if (/^[A-Za-z0-9+/=]+$/.test(v)) return `data:image/png;base64,${v}`;
      return '';
    };

    const logo = clampToDataUrl(logoDataUrl);

    const addSignatureBox = (doc: any, opts: { label: string; dataUrl?: string; x: number; y: number; w: number; h: number; note?: string; footer?: string }) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(opts.label, opts.x, opts.y - 2);

      const boxY = opts.y;
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(opts.x, boxY, opts.w, opts.h, 2, 2);

      const sig = clampToDataUrl(opts.dataUrl);
      if (sig) {
        try {
          const fmt = sig.startsWith('data:image/png') ? 'PNG' : 'JPEG';
          doc.addImage(sig, fmt, opts.x + 2, boxY + 2, opts.w - 4, opts.h - 4, undefined, 'FAST');
        } catch (e) {
          console.warn('[send-work-report-email] Signature error', e);
        }
      } else if (opts.note) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(opts.note, opts.x + opts.w/2, boxY + opts.h/2 + 2, { align: 'center' });
      }

      if (opts.footer) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text(opts.footer, opts.x, boxY + opts.h + 5);
      }
    };

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    // Header
    const headerTop = 10;

    if (logo) {
      try {
        const fmt = logo.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        doc.addImage(logo, fmt, margin, headerTop, 46, 18, undefined, 'FAST');
      } catch (e) {
        console.warn('[send-work-report-email] Logo addImage error', e);
      }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text("Antonelli & Zanni", margin, headerTop + 30);
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Refrigerazione", margin, headerTop + 38);

    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 54, 140); // Matches #1a368c
    doc.text("Bolla di Consegna", pageWidth - margin, headerTop + 12, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, pageWidth - margin, headerTop + 20, { align: 'right' });
    doc.text(`Intervento ID: ${intervention.id.substring(0, 8).toUpperCase()}`, pageWidth - margin, headerTop + 25, { align: 'right' });

    let y = headerTop + 45;
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    const addSection = (title: string, data: [string, string | undefined][], columns = 2) => {
      if (y + 40 > pageHeight) { doc.addPage(); y = 20; }
      
      const startY = y;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(title, margin + 4, y + 8);
      
      doc.setFontSize(9);
      let dataY = y + 16;
      const colWidth = (pageWidth - margin * 2) / columns;

      data.forEach((item, i) => {
        const col = i % columns;
        const row = Math.floor(i / columns);
        const curY = dataY + (row * 6);
        
        doc.setFont("helvetica", "bold");
        doc.text(item[0] + ":", margin + 4 + (col * colWidth), curY);
        doc.setFont("helvetica", "normal");
        doc.text(sanitizeText(item[1]) || "N/D", margin + 35 + (col * colWidth), curY);
      });

      const sectionHeight = 16 + Math.ceil(data.length / columns) * 6 + 4;
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(margin, startY, pageWidth - margin * 2, sectionHeight, 2, 2);
      y += sectionHeight + 8;
    };

    addSection("Dati Cliente", [
      ["Ragione Sociale", intervention.client_company_name],
      ["Telefono", intervention.client_phone],
      ["Indirizzo", intervention.client_address],
      ["Referente", intervention.client_referent],
      ["Email", intervention.client_email]
    ]);

    addSection("Dati Impianto", [
      ["Tipo Impianto", intervention.system_type],
      ["Matricola", intervention.serial_number],
      ["Marca", intervention.brand],
      ["Ubicazione", intervention.system_location],
      ["Modello", intervention.model],
      ["Rif. Interno", intervention.internal_ref]
    ]);

    // Dettagli Lavoro
    const wr = intervention.work_report_data || {};
    const workDesc = wr.work_description || "Nessuna descrizione";
    const operativeNotes = wr.operative_notes || "Nessuna nota";
    
    const splitDesc = doc.splitTextToSize("Descrizione: " + sanitizeText(workDesc), pageWidth - margin * 2 - 10);
    const splitNotes = doc.splitTextToSize("Note Operative: " + sanitizeText(operativeNotes), pageWidth - margin * 2 - 10);
    const workHeight = 15 + (splitDesc.length + splitNotes.length) * 5 + 5;

    if (y + workHeight > pageHeight) { doc.addPage(); y = 20; }
    const workStartY = y;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Dettagli Lavoro Svolto", margin + 4, y + 8);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(splitDesc, margin + 4, y + 16);
    doc.text(splitNotes, margin + 4, y + 16 + splitDesc.length * 5 + 2);
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(margin, workStartY, pageWidth - margin * 2, workHeight, 2, 2);
    y += workHeight + 10;

    // Ore
    const timeEntries = wr.time_entries || [];
    if (timeEntries.length > 0) {
      if (y + 30 > pageHeight) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Ore di Lavoro", margin, y);
      y += 5;

      autoTable(doc, {
        startY: y,
        head: [['Data', 'Risorsa', 'Fascia 1', 'Fascia 2', 'Ore']],
        body: timeEntries.map((e: any) => [
          e.date ? new Date(e.date).toLocaleDateString('it-IT') : 'N/D',
          `${e.resource_type === 'supplier' ? 'Fornitore' : 'Tecnico'}: ${sanitizeText(e.technician) || 'N/D'}`,
          `${e.time_slot_1_start} - ${e.time_slot_1_end}`,
          e.time_slot_2_start ? `${e.time_slot_2_start} - ${e.time_slot_2_end}` : 'N/D',
          (e.total_hours || 0).toFixed(2)
        ]),
        theme: 'plain',
        styles: { fontSize: 8 },
        headStyles: { fontStyle: 'bold', borderBottom: { color: [0, 0, 0], width: 0.1 } },
        margin: { left: margin, right: margin }
      });

      y = (doc as any).lastAutoTable.finalY + 8;
      const totalHours = timeEntries.reduce((s: number, e: any) => s + (e.total_hours || 0), 0);
      doc.setFontSize(10);
      doc.text(`Totale Ore: ${totalHours.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
      if (wr.kilometers) {
        y += 6;
        doc.text(`Km percorsi: ${wr.kilometers}`, pageWidth - margin, y, { align: 'right' });
      }
      y += 12;
    }

    // Firme
    if (y + 50 > pageHeight) { doc.addPage(); y = 20; }
    const boxW = (pageWidth - margin * 2 - 10) / 2;
    addSignatureBox(doc, {
      label: 'Firma Cliente:',
      dataUrl: wr.client_signature,
      x: margin,
      y: y + 5,
      w: boxW,
      h: 28,
      note: wr.client_absent ? 'Cliente assente' : undefined,
      footer: wr.client_signer_name ? `Firmato da: ${sanitizeText(wr.client_signer_name)}` : undefined
    });
    addSignatureBox(doc, {
      label: 'Firma Tecnico:',
      dataUrl: wr.technician_signature,
      x: margin + boxW + 10,
      y: y + 5,
      w: boxW,
      h: 28
    });

    const pdfBase64 = doc.output('datauristring').split(',')[1];
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? '"Antonelli & Zanni Refrigerazione Srl" <bolla@send.lumafinsrl.com>';

    for (const to of recipients) {
      await resend.emails.send({
        from: fromEmail,
        to,
        subject: `Bolla di Consegna - ${intervention.client_company_name}`,
        html: `<p>Gentile ${intervention.client_company_name}, alleghiamo la bolla di consegna relativa all'intervento.</p>`,
        attachments: [{ filename: `Bolla_${interventionId.substring(0, 8)}.pdf`, content: pdfBase64 }]
      });
    }

    return new Response(JSON.stringify({ message: 'Email inviate' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});