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

  const SignatureBox = ({ src, emptyNote, footerText }: { src?: string; emptyNote?: string; footerText?: string }) => {
    const has = Boolean(src && src.trim().length > 0);

    return (
      <div className="flex flex-col gap-1 w-full">
        <div className="h-24 w-full border border-gray-400 print:border-black bg-white flex items-center justify-center overflow-hidden relative">
          {has ? (
            // use <img> to avoid Next/Image limitations with data URLs in print
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src!} alt="Firma" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="w-full px-3">
              <div className="h-12" />
              <div className="border-b border-gray-400 print:border-black" />
              {emptyNote ? (
                <div className="mt-2 text-[11px] text-gray-600 print:text-black">{emptyNote}</div>
              ) : null}
            </div>
          )}
        </div>
        {footerText ? (
          <div className="text-[10px] text-gray-500 print:text-black italic">
            {footerText}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="bg-white text-black print:p-8 print:text-black print:font-sans print:text-[12px]">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 print:mb-4 border-b-2 border-gray-300 print:border-black pb-4">
        <div className="flex flex-col items-start">
          <Image
            src="/logo-crm-antonelli-zani.jpg"
            alt="Antonelli & Zanni Logo"
            width={200}
            height={80}
            className="mb-2 print:hidden"
          />
          <h1 className="text-xl font-bold print:text-lg">Antonelli & Zanni Refrigerazione Srl</h1>
          <p className="text-base print:text-sm">Via Roma, 123 - 20019 Settimo Milanese (MI)</p>
          <p className="text-sm print:text-xs">Tel: 02 123456 - Email: info@antonellizanni.it</p>
          <p className="text-sm print:text-xs">P.IVA: 12345678901 - C.F.: ABCDEF12G34H567I</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold print:text-xl mb-2">BOLLA DI CONSEGNA</div>
          <p className="text-sm print:text-xs">Data: {format(new Date(), 'dd/MM/yyyy', { locale: it })}</p>
          <p className="text-sm print:text-xs">Intervento: {intervention.id.substring(0, 8).toUpperCase()}</p>
        </div>
      </div>

      {/* Dati Cliente */}
      <div className="mb-6 print:mb-4 border border-gray-300 print:border-black p-4">
        <div className="font-bold text-base print:text-sm mb-2">DATI CLIENTE</div>
        <div className="grid grid-cols-2 gap-4 text-sm print:text-xs">
          <div>
            <div><span className="font-medium">Ragione Sociale:</span> {client_company_name}</div>
            <div><span className="font-medium">Indirizzo:</span> {client_address}</div>
            <div><span className="font-medium">Email:</span> {client_email}</div>
          </div>
          <div>
            <div><span className="font-medium">Telefono:</span> {client_phone}</div>
            <div><span className="font-medium">Referente:</span> {client_referent || 'N/D'}</div>
          </div>
        </div>
      </div>

      {/* Dati Impianto */}
      <div className="mb-6 print:mb-4 border border-gray-300 print:border-black p-4">
        <div className="font-bold text-base print:text-sm mb-2">DATI IMPIANTO</div>
        <div className="grid grid-cols-2 gap-4 text-sm print:text-xs">
          <div>
            <div><span className="font-medium">Tipo Impianto:</span> {system_type}</div>
            <div><span className="font-medium">Marca:</span> {brand}</div>
          </div>
          <div>
            <div><span className="font-medium">Matricola:</span> {serial_number}</div>
            <div><span className="font-medium">Ubicazione:</span> {system_location}</div>
            <div><span className="font-medium">Rif. Interno:</span> {internal_ref || 'N/D'}</div>
          </div>
        </div>
      </div>

      {/* Dettagli Lavoro Svolto */}
      <div className="mb-6 print:mb-4 border border-gray-300 print:border-black p-4">
        <div className="font-bold text-base print:text-sm mb-2">DETTAGLI LAVORO SVOLTO</div>
        <div className="text-sm print:text-xs mb-2">
          <span className="font-medium">Descrizione:</span> {work_report_data?.work_description || 'Nessuna descrizione fornita.'}
        </div>
        <div className="text-sm print:text-xs">
          <span className="font-medium">Note Operative:</span> {work_report_data?.operative_notes || 'Nessuna nota operativa.'}
        </div>
      </div>

      {/* Ore di Lavoro */}
      {work_report_data?.time_entries && work_report_data.time_entries.length > 0 && (
        <div className="mb-6 print:mb-4 border border-gray-300 print:border-black p-4">
          <div className="font-bold text-base print:text-sm mb-2">ORE DI LAVORO</div>
          <table className="w-full text-sm print:text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-300 print:border-black">
                <th className="text-left py-2 print:py-1">Data</th>
                <th className="text-left py-2 print:py-1">Risorsa</th>
                <th className="text-left py-2 print:py-1">Fascia 1</th>
                <th className="text-left py-2 print:py-1">Fascia 2</th>
                <th className="text-left py-2 print:py-1">Ore</th>
              </tr>
            </thead>
            <tbody>
              {work_report_data.time_entries.map((entry, index) => (
                <tr key={index} className="border-b border-gray-200 last:border-b-0 print:border-black">
                  <td className="py-2 print:py-1">{entry.date ? format(new Date(entry.date), 'dd/MM/yyyy') : 'N/D'}</td>
                  <td className="py-2 print:py-1">{formatResource(entry)}</td>
                  <td className="py-2 print:py-1">{entry.time_slot_1_start} - {entry.time_slot_1_end}</td>
                  <td className="py-2 print:py-1">{entry.time_slot_2_start && entry.time_slot_2_end ? `${entry.time_slot_2_start} - ${entry.time_slot_2_end}` : 'N/D'}</td>
                  <td className="py-2 print:py-1">{entry.total_hours.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right mt-4 print:mt-2 text-base font-bold print:text-sm">
            Totale Ore: {totalHours.toFixed(2)}
          </div>
          {work_report_data.kilometers !== undefined && (
            <div className="text-right mt-2 text-base font-bold print:text-sm">
              Km percorsi: {work_report_data.kilometers}
            </div>
          )}
        </div>
      )}

      {/* Materiali Utilizzati */}
      {work_report_data?.materials && work_report_data.materials.length > 0 && (
        <div className="mb-6 print:mb-4 border border-gray-300 print:border-black p-4">
          <div className="font-bold text-base print:text-sm mb-2">MATERIALI UTILIZZATI</div>
          <table className="w-full text-sm print:text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-300 print:border-black">
                <th className="text-left py-2 print:py-1">U.M.</th>
                <th className="text-left py-2 print:py-1">Quantità</th>
                <th className="text-left py-2 print:py-1">Descrizione</th>
              </tr>
            </thead>
            <tbody>
              {work_report_data.materials.map((material, index) => (
                <tr key={index} className="border-b border-gray-200 last:border-b-0 print:border-black">
                  <td className="py-2 print:py-1">{material.unit || 'N/D'}</td>
                  <td className="py-2 print:py-1">{material.quantity}</td>
                  <td className="py-2 print:py-1">{material.description || 'N/D'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Firme */}
      <div className="grid grid-cols-2 gap-8 mt-8 print:mt-6 text-sm print:text-xs">
        <div>
          <div className="font-bold mb-2 print:mb-1">FIRMA CLIENTE:</div>
          <SignatureBox 
            src={clientSig} 
            emptyNote={clientAbsent ? 'Cliente assente' : undefined} 
            footerText={signerName ? `Firmato da: ${signerName}` : undefined}
          />
        </div>
        <div>
          <div className="font-bold mb-2 print:mb-1">FIRMA TECNICO:</div>
          <SignatureBox src={techSig} />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 print:mt-6 pt-4 border-t border-gray-300 print:border-black text-xs text-gray-600 print:text-black text-center">
        <div>Antonelli & Zanni Refrigerazione Srl - Via Roma, 123 - 20019 Settimo Milanese (MI)</div>
        <div>Tel: 02 123456 - Email: info@antonellizanni.it - P.IVA: 12345678901</div>
      </div>
    </div>
  );
};