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

  return (
    <div className="p-8 bg-white text-gray-900 print:p-0 print:text-black print:font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 print:mb-6 border-b pb-4 print:border-black">
        <div className="flex flex-col items-start">
          <Image
            src="/logo-crm-antonelli-zani.jpg"
            alt="Antonelli & Zani Logo"
            width={180} // Slightly larger logo for prominence
            height={100}
            className="mb-2"
          />
          <h1 className="text-2xl font-bold text-gray-900 print:text-black">Antonelli & Zani</h1>
          <p className="text-lg text-gray-700 print:text-black">Refrigerazioni</p>
        </div>
        <div className="text-right mt-4">
          <h2 className="text-3xl font-bold text-blue-700 print:text-blue-900 mb-2">Bolla di Consegna</h2>
          <p className="text-sm text-gray-700 print:text-black">Data: {format(new Date(), 'dd/MM/yyyy', { locale: it })}</p>
          <p className="text-sm text-gray-700 print:text-black">Intervento ID: {intervention.id.substring(0, 8).toUpperCase()}</p>
        </div>
      </div>

      {/* Dati Cliente */}
      <div className="mb-8 print:mb-6 border rounded-lg p-4 print:border-black break-inside-avoid">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 print:text-black">Dati Cliente</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div>
            <p><span className="font-medium">Ragione Sociale:</span> {client_company_name}</p>
            <p><span className="font-medium">Indirizzo:</span> {client_address}</p>
            <p><span className="font-medium">Email:</span> {client_email}</p>
          </div>
          <div>
            <p><span className="font-medium">Telefono:</span> {client_phone}</p>
            <p><span className="font-medium">Referente:</span> {client_referent || 'N/D'}</p>
          </div>
        </div>
      </div>

      {/* Dati Impianto */}
      <div className="mb-8 print:mb-6 border rounded-lg p-4 print:border-black break-inside-avoid">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 print:text-black">Dati Impianto</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div>
            <p><span className="font-medium">Tipo Impianto:</span> {system_type}</p>
            <p><span className="font-medium">Marca:</span> {brand}</p>
            <p><span className="font-medium">Modello:</span> {model}</p>
          </div>
          <div>
            <p><span className="font-medium">Matricola:</span> {serial_number}</p>
            <p><span className="font-medium">Ubicazione:</span> {system_location}</p>
            <p><span className="font-medium">Rif. Interno:</span> {internal_ref || 'N/D'}</p>
          </div>
        </div>
      </div>

      {/* Dettagli Lavoro Svolto */}
      <div className="mb-8 print:mb-6 border rounded-lg p-4 print:border-black break-inside-avoid">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 print:text-black">Dettagli Lavoro Svolto</h3>
        <p className="text-sm mb-2"><span className="font-medium">Descrizione:</span> {work_report_data?.work_description || 'Nessuna descrizione fornita.'}</p>
        <p className="text-sm"><span className="font-medium">Note Operative:</span> {work_report_data?.operative_notes || 'Nessuna nota operativa.'}</p>
      </div>

      {/* Ore di Lavoro */}
      {work_report_data?.time_entries && work_report_data.time_entries.length > 0 && (
        <div className="mb-8 print:mb-6 border rounded-lg p-4 print:border-black break-inside-avoid">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 print:text-black">Ore di Lavoro</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300 print:border-black">
                <th className="text-left py-2">Data</th>
                <th className="text-left py-2">Tecnico</th>
                <th className="text-left py-2">Fascia 1</th>
                <th className="text-left py-2">Fascia 2</th>
                <th className="text-left py-2">Ore</th>
              </tr>
            </thead>
            <tbody>
              {work_report_data.time_entries.map((entry, index) => (
                <tr key={index} className="border-b border-gray-200 last:border-b-0 print:border-black">
                  <td className="py-2">{entry.date ? format(new Date(entry.date), 'dd/MM/yyyy') : 'N/D'}</td>
                  <td className="py-2">{entry.technician}</td>
                  <td className="py-2">{entry.time_slot_1_start} - {entry.time_slot_1_end}</td>
                  <td className="py-2">{entry.time_slot_2_start && entry.time_slot_2_end ? `${entry.time_slot_2_start} - ${entry.time_slot_2_end}` : 'N/D'}</td>
                  <td className="py-2">{entry.total_hours.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right mt-4 text-base font-semibold text-gray-900 print:text-black">
            Totale Ore: {totalHours.toFixed(2)}
          </div>
          {work_report_data.kilometers !== undefined && (
            <div className="text-right mt-2 text-base font-semibold text-gray-900 print:text-black">
              Km percorsi: {work_report_data.kilometers}
            </div>
          )}
        </div>
      )}

      {/* Materiali Utilizzati */}
      {work_report_data?.materials && work_report_data.materials.length > 0 && (
        <div className="mb-8 print:mb-6 border rounded-lg p-4 print:border-black break-inside-avoid">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 print:text-black">Materiali Utilizzati</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300 print:border-black">
                <th className="text-left py-2">U.M.</th>
                <th className="text-left py-2">Quantità</th>
                <th className="text-left py-2">Descrizione</th>
              </tr>
            </thead>
            <tbody>
              {work_report_data.materials.map((material, index) => (
                <tr key={index} className="border-b border-gray-200 last:border-b-0 print:border-black">
                  <td className="py-2">{material.unit || 'N/D'}</td>
                  <td className="py-2">{material.quantity}</td>
                  <td className="py-2">{material.description || 'N/D'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Firme */}
      <div className="grid grid-cols-2 gap-8 mt-12 text-sm print:mt-8 break-inside-avoid">
        <div>
          <p className="font-medium mb-2 text-gray-900 print:text-black">Firma Cliente:</p>
          <div className="border-b border-gray-400 w-full h-16 print:border-black"></div>
        </div>
        <div>
          <p className="font-medium mb-2 text-gray-900 print:text-black">Firma Tecnico:</p>
          <div className="border-b border-gray-400 w-full h-16 print:border-black"></div>
        </div>
      </div>
    </div>
  );
};