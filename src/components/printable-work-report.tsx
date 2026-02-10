"use client";

import React from 'react';
import { InterventionRequest } from '@/types/intervention';
import Image from 'next/image';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface PrintableWorkReportProps {
  intervention: InterventionRequest;
}

export const PrintableWorkReport = ({ intervention }: PrintableWorkReportProps) => {
  const {
    client_company_name,
    client_email,
    client_phone,
    client_address,
    client_referent,
    system_type,
    brand,
    model,
    serial_number,
    system_location,
    internal_ref,
    work_report_data,
  } = intervention;

  const totalHours = work_report_data?.time_entries?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;

  const formatResource = (entry: any) => {
    const type = entry?.resource_type === 'supplier' ? 'Fornitore' : 'Tecnico';
    return `${type}: ${entry?.technician || 'N/D'}`;
  };

  const clientSig = (work_report_data?.client_signature || '').trim();
  const techSig = (work_report_data?.technician_signature || '').trim();
  const clientAbsent = Boolean((work_report_data as any)?.client_absent);
  const signerName = work_report_data?.client_signer_name || '';

  // Aggiungo calcolo materiali non vuoti
  const materials = (work_report_data?.materials || []).filter(
    (m) => (m?.description || '').trim().length > 0
  );

  const SignatureBox = ({ src, emptyNote, footerText }: { src?: string; emptyNote?: string; footerText?: string }) => {
    const has = Boolean(src && src.trim().length > 0);

    return (
      <div className="flex flex-col gap-1 w-full">
        <div className="h-24 w-full rounded-md border border-gray-300 print:border-gray-300 bg-white flex items-center justify-center overflow-hidden relative">
          {has ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src!} alt="Firma" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="w-full px-3 text-center">
              {emptyNote ? (
                <div className="text-[11px] text-gray-500 print:text-gray-500">{emptyNote}</div>
              ) : (
                <div className="h-12 border-b border-gray-200 print:border-gray-200" />
              )}
            </div>
          )}
        </div>
        {footerText ? (
          <div className="text-[10px] text-gray-500 print:text-gray-500 italic">
            {footerText}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="p-8 bg-white text-gray-900 print:p-0 print:text-black print:font-sans max-w-[210mm] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 print:mb-6 border-b pb-4 print:border-black">
        <div className="flex flex-col items-start">
          <Image
            src="/nuovo-logo.jpeg"
            alt="Logo Antonelli & Zanni Refrigerazione"
            width={180}
            height={100}
            className="mb-2"
          />
          <h1 className="text-xl font-extrabold leading-tight text-gray-900 print:text-black">
            Antonelli & Zanni Refrigerazione Srl
          </h1>
          <div className="mt-1 space-y-0.5 text-[12px] leading-snug text-gray-700 print:text-black">
            <p>Via Fabio Filzi, 10, 25062 Concesio BS</p>
            <p>Partita IVA: 03509590984</p>
            <p>PEC: antonelli.zanni@legalmail.it</p>
            <p>Tel. 030 258 4894</p>
          </div>
        </div>
        <div className="text-right mt-4">
          <h2 className="text-4xl font-bold text-[#1a368c] print:text-[#1a368c] mb-2">Bolla di Consegna</h2>
          <p className="text-sm text-gray-700 print:text-black font-medium">Data: {format(new Date(), 'dd/MM/yyyy', { locale: it })}</p>
          <p className="text-sm text-gray-700 print:text-black">Intervento ID: {intervention.id.substring(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Dati Cliente */}
        <div className="border border-gray-200 rounded-lg p-4 print:border-gray-300 break-inside-avoid">
          <h3 className="text-lg font-bold mb-3 text-gray-800 print:text-black border-b pb-1">Dati Cliente</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
            <p><span className="font-bold">Ragione Sociale:</span> {client_company_name}</p>
            <p><span className="font-bold">Telefono:</span> {client_phone}</p>
            <p><span className="font-bold">Indirizzo:</span> {client_address}</p>
            <p><span className="font-bold">Referente:</span> {client_referent || 'N/D'}</p>
            <p><span className="font-bold">Email:</span> {client_email}</p>
          </div>
        </div>

        {/* Dati Impianto */}
        <div className="border border-gray-200 rounded-lg p-4 print:border-gray-300 break-inside-avoid">
          <h3 className="text-lg font-bold mb-3 text-gray-800 print:text-black border-b pb-1">Dati Impianto</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
            <p><span className="font-bold">Tipo Impianto:</span> {system_type}</p>
            <p><span className="font-bold">Matricola:</span> {serial_number}</p>
            <p><span className="font-bold">Marca:</span> {brand}</p>
            <p><span className="font-bold">Ubicazione:</span> {system_location}</p>
            <p><span className="font-bold">Modello:</span> {model}</p>
            <p><span className="font-bold">Rif. Interno:</span> {internal_ref || 'N/D'}</p>
          </div>
        </div>

        {/* Lavoro Svolto */}
        <div className="border border-gray-200 rounded-lg p-4 print:border-gray-300 break-inside-avoid">
          <h3 className="text-lg font-bold mb-3 text-gray-800 print:text-black border-b pb-1">Dettagli Lavoro Svolto</h3>
          <div className="text-[13px] space-y-2">
            <p><span className="font-bold">Descrizione:</span> {work_report_data?.work_description || 'Nessuna descrizione fornita.'}</p>
            <p><span className="font-bold">Note Operative:</span> {work_report_data?.operative_notes || 'Nessuna nota operativa.'}</p>
          </div>
        </div>

        {/* Ore */}
        {work_report_data?.time_entries && work_report_data.time_entries.length > 0 && (
          <div className="break-inside-avoid">
            <h3 className="text-lg font-bold mb-2 text-gray-800 print:text-black">Ore di lavoro (uomo/ora)</h3>
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-2 font-bold">Data</th>
                  <th className="text-left py-2 font-bold">Risorsa</th>
                  <th className="text-left py-2 font-bold">Fascia 1</th>
                  <th className="text-left py-2 font-bold">Fascia 2</th>
                  <th className="text-left py-2 font-bold">Ore</th>
                </tr>
              </thead>
              <tbody>
                {work_report_data.time_entries.map((entry, index) => (
                  <tr key={index} className="border-b border-gray-200 last:border-b-0 print:border-gray-200">
                    <td className="py-2">{entry.date ? format(new Date(entry.date), 'dd/MM/yyyy') : 'N/D'}</td>
                    <td className="py-2">{formatResource(entry)}</td>
                    <td className="py-2">{entry.time_slot_1_start} - {entry.time_slot_1_end}</td>
                    <td className="py-2">{entry.time_slot_2_start && entry.time_slot_2_end ? `${entry.time_slot_2_start} - ${entry.time_slot_2_end}` : 'N/D'}</td>
                    <td className="py-2">{entry.total_hours.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-col items-end mt-2 space-y-1">
              <div className="text-sm font-bold">Totale Ore: {totalHours.toFixed(2)}</div>
              {work_report_data.kilometers !== undefined && (
                <div className="text-sm font-bold">Km percorsi: {work_report_data.kilometers}</div>
              )}
            </div>
          </div>
        )}

        {/* Materiali */}
        {materials.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4 print:border-gray-300 break-inside-avoid">
            <h3 className="text-lg font-bold mb-3 text-gray-800 print:text-black border-b pb-1">
              Ricambi / Materiali utilizzati
            </h3>
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-2 font-bold w-20">Q.tà</th>
                  <th className="text-left py-2 font-bold w-24">Unità</th>
                  <th className="text-left py-2 font-bold">Descrizione</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m, idx) => (
                  <tr key={idx} className="border-b border-gray-200 last:border-b-0 print:border-gray-200">
                    <td className="py-2">{typeof m.quantity === 'number' ? m.quantity : '-'}</td>
                    <td className="py-2">{m.unit || 'PZ'}</td>
                    <td className="py-2">{m.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Firme */}
        <div className="grid grid-cols-2 gap-10 mt-10 text-[13px] break-inside-avoid">
          <div>
            <p className="font-bold mb-2 text-gray-900 print:text-black">Firma Cliente:</p>
            <SignatureBox 
              src={clientSig} 
              emptyNote={clientAbsent ? 'Cliente assente firma non raccolta' : undefined} 
              footerText={signerName ? `Firmato da: ${signerName}` : undefined}
            />
          </div>
          <div>
            <p className="font-bold mb-2 text-gray-900 print:text-black">Firma Tecnico:</p>
            <SignatureBox src={techSig} />
          </div>
        </div>
      </div>
    </div>
  );
};