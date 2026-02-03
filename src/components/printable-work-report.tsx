import React, { useState } from 'react';
import SignaturePad from 'react-signature-pad';

interface PrintableWorkReportProps {
  intervention: InterventionRequest;
}

export const PrintableWorkReport = ({ intervention }: PrintableWorkReportProps) => {
  const [clienteFirma, setClienteFirma] = useState(null);
  const [tecnicoFirma, setTecnicoFirma] = useState(null);

  const handleClienteFirmaChange = (signature) => {
    setClienteFirma(signature);
  };

  const handleTecnicoFirmaChange = (signature) => {
    setTecnicoFirma(signature);
  };

  return (
    <div className="p-8 bg-white text-gray-900 print:p-0 print:text-black print:font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 print:mb-6 border-b pb-4 print:border-black">
        <div className="flex flex-col items-start">
          <Image src="/logo-crm-antonelli-zani.jpg" alt="Antonelli & Zani Logo" width={180} height={100} className="mb-2" />
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
            <p><span className="font-medium">Ragione Sociale:</span> {intervention.client_company_name}</p>
            <p><span className="font-medium">Indirizzo:</span> {intervention.client_address}</p>
            <p><span className="font-medium">Email:</span> {intervention.client_email}</p>
          </div>
          <div>
            <p><span className="font-medium">Telefono:</span> {intervention.client_phone}</p>
            <p><span className="font-medium">Referente:</span> {intervention.client_referent || 'N/D'}</p>
          </div>
        </div>
      </div>
      {/* Dati Impianto */}
      <div className="mb-8 print:mb-6 border rounded-lg p-4 print:border-black break-inside-avoid">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 print:text-black">Dati Impianto</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div>
            <p><span className="font-medium">Tipo Impianto:</span> {intervention.system_type}</p>
            <p><span className="font-medium">Marca:</span> {intervention.brand}</p>
            <p><span className="font-medium">Modello:</span> {intervention.model}</p>
          </div>
          <div>
            <p><span className="font-medium">Matricola:</span> {intervention.serial_number}</p>
            <p><span className="font-medium">Ubicazione:</span> {intervention.system_location}</p>
            <p><span className="font-medium">Rif. Interno:</span> {intervention.internal_ref || 'N/D'}</p>
          </div>
        </div>
      </div>
      {/* Dettagli Lavoro Svolto */}
      <div className="mb-8 print:mb-6 border rounded-lg p-4 print:border-black break-inside-avoid">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 print:text-black">Dettagli Lavoro Svolto</h3>
        <p className="text-sm mb-2"><span className="font-medium">Descrizione:</span> {intervention.work_report_data?.work_description || 'Nessuna descrizione fornita.'}</p>
        <p className="text-sm"><span className="font-medium">Note Operative:</span> {intervention.work_report_data?.operative_notes || 'Nessuna nota operativa.'}</p>
      </div>
      {/* Firme */}
      <div className="grid grid-cols-2 gap-8 mt-12 text-sm print:mt-8 break-inside-avoid">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800 print:text-black">Firma Cliente</h3>
          <SignaturePad width={400} height={200} onChange={handleClienteFirmaChange} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800 print:text-black">Firma Tecnico</h3>
          <SignaturePad width={400} height={200} onChange={handleTecnicoFirmaChange} />
        </div>
      </div>
    </div>
  );
};