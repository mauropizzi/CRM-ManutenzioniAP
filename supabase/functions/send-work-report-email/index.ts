import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from 'https://esm.sh/resend@1.1.0';
import { jsPDF } from 'https://esm.sh/jspdf@2.5.1';
import autoTable from 'https://esm.sh/jspdf-autotable@3.5.31';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interventionId, recipientEmail } = await req.json();
    console.log("[send-work-report-email] Received request for interventionId:", interventionId, "recipientEmail:", recipientEmail);

    if (!interventionId || !recipientEmail) {
      console.error("[send-work-report-email] Missing interventionId or recipientEmail. Status: 400");
      return new Response(JSON.stringify({ error: 'Missing interventionId or recipientEmail' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Inizializza il client Supabase per la funzione Edge
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Usa la service role key per accesso server-side
    );

    // Recupera i dettagli dell'intervento
    const { data: intervention, error: interventionError } = await supabaseClient
      .from('interventions')
      .select('*')
      .eq('id', interventionId)
      .single();

    if (interventionError || !intervention) {
      console.error("[send-work-report-email] Error fetching intervention or not found. Status: 500. Error:", interventionError?.message);
      return new Response(JSON.stringify({ error: 'Intervention not found or database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log("[send-work-report-email] Intervention fetched successfully:", intervention.id);

    // Verifica RESEND_API_KEY
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

    // Generazione del PDF
    console.log("[send-work-report-email] Starting PDF generation...");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Antonelli & Pellizzari", 14, yPosition);
    yPosition += 8;
    doc.setFontSize(14);
    doc.text("Refrigerazioni", 14, yPosition);
    yPosition += 10;

    // Titolo Bolla
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text("Bolla di Consegna", pageWidth - 60, 20);
    doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, pageWidth - 70, 28);
    yPosition += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPosition, pageWidth - 14, yPosition);
    yPosition += 10;
    doc.setTextColor(0, 0, 0); // Reset to black

    // Funzione helper per aggiungere testo
    const addText = (label: string, value: string | undefined, yPos: number) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(label + ": ", 14, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(value || "N/D", 55, yPos);
      return yPos + 7;
    };

    // Sezione Dati Cliente
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

    // Sezione Dati Impianto
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

    // Sezione Lavori Svolto
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Dettagli Lavor", 14, yPosition);
    yPosition += 7;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const splitDesc = doc.splitTextToSize((intervention.work_report_data as any)?.work_description || "Nessuna descrizione", pageWidth - 28);
    doc.text(splitDesc, 14, yPosition);
    yPosition += (splitDesc.length * 5) + 5;

    const splitNotes = doc.splitTextToSize("Note Operative: " + ((intervention.work_report_data as any)?.operative_notes || "Nessuna nota"), pageWidth - 28);
    doc.text(splitNotes, 14, yPosition);
    yPosition += (splitNotes.length * 5) + 10;

    // Tabella Ore di Lavoro
    const timeEntries = (intervention.work_report_data as any)?.time_entries || [];
    if (timeEntries.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Ore di Lavoro", 14, yPosition);
      yPosition += 7;

      // Calcola totale ore
      const totalHours = timeEntries.reduce((sum: number, entry: any) => sum + (entry.total_hours || 0), 0);

      autoTable(doc, {
        startY: yPosition,
        head: [['Data', 'Tecnico', 'Fascia 1', 'Fascia 2', 'Ore']],
        body: timeEntries.map((entry: any) => [
          entry.date ? new Date(entry.date).toLocaleDateString('it-IT') : 'N/D',
          entry.technician,
          `${entry.time_slot_1_start} - ${entry.time_slot_1_end}`,
          entry.time_slot_2_start ? `${entry.time_slot_2_start} - ${entry.time_slot_2_end}` : 'N/D',
          entry.total_hours.toFixed(2)
        ]),
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }, // Blue header
        didDrawPage: (data) => {
            // Aggiungi totale ore sotto la tabella
            doc.setFontSize(10);
            doc.text(`Totale Ore: ${totalHours.toFixed(2)}`, data.table.startX, data.cursor.y + 10);
            const km = (intervention.work_report_data as any)?.kilometers;
             if (km !== undefined) {
                 doc.text(`Km percorsi: ${km}`, data.table.startX + 60, data.cursor.y + 10);
             }
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15; // Aggiorna Y dopo la tabella generata
    }

    // Aggiungi nuova pagina se necessario per i materiali (spazio mancante)
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    // Tabella Materiali
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
          mat.description || 'N/D'
        ]),
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });
    }

    // Converti il PDF in Data URL (base64)
    const pdfData = doc.output('datauristring');
    console.log("[send-work-report-email] PDF generated successfully.");

    // Configurazione Email
    // NOTA IMPORTANTE: Devi verificare il dominio "info@antonellipellizzari.it" (o quello che usi) nel dashboard di Resend
    // altrimenti l'invio fallirà.
    const fromEmail = '"Antonelli & Pellizzari" <info@antonellipellizzari.it>';
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Gentile ${intervention.client_company_name},</h2>
        <p style="color: #333;">
          Le inviamo alleghata la bolla di consegna in formato PDF relativa all'intervento sul suo impianto ${intervention.system_type} ${intervention.brand} ${intervention.model}.
        </p>
        <p style="color: #333;">Cordiali saluti,</p>
        <p style="color: #333; font-weight: bold;">Antonelli & Pellizzari Refrigerazioni</p>
      </div>
    `;
    
    console.log("[send-work-report-email] Attempting to send email from:", fromEmail, "to:", recipientEmail);

    const { data, error: resendError } = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: `Bolla di Consegna Intervento ${intervention.client_company_name}`,
      html: emailContent,
      attachments: [
        {
          filename: `Bolla_${intervention.client_company_name.replace(/\s+/g, '_')}.pdf`,
          content: pdfData.split(',')[1], // Rimuove l'header "data:application/pdf;base64,"
        }
      ]
    });

    if (resendError) {
      console.error("[send-work-report-email] Error sending email via Resend. Status: 500. Error:", resendError);
      
      // Messaggio di errore specifico se il problema è il dominio non verificato
      if (resendError.message.includes('from_address')) {
         console.error("[send-work-report-email] Domain verification error. Please verify the email domain in Resend dashboard.");
         return new Response(JSON.stringify({ error: 'Dominio email mittente non verificato in Resend. Controlla la dashboard di Resend.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
      }

      return new Response(JSON.stringify({ error: resendError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("[send-work-report-email] Email sent successfully with PDF attachment:", data);
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