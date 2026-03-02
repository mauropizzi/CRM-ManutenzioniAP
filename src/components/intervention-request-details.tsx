import React from 'react';
import { TimeEntry, WorkReportData, MaterialUsed } from '@/types/intervention';

interface InterventionRequestDetailsProps {
  request: {
    id: string;
    work_report_data?: {
      time_entries?: TimeEntry[];
      kilometers?: number;
      materials?: MaterialUsed[];
    };
    created_at?: string;
  };
}

/**
 * InterventionRequestDetails
 *
 * Componente per visualizzare i dettagli completi di una richiesta di intervento
 * in modo strutturato e organizzato.
 */
export default function InterventionRequestDetails({ request }: InterventionRequestDetailsProps) {
  const { work_report_data } = request;

  if (!work_report_data) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Nessun dato della richiesta disponibile
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con ID della richiesta */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dettagli Richiesta #{request.id?.slice(0, 8) || 'N/A'}
          </h2>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Aggiornato: {request.created_at ? new Date(request.created_at).toLocaleDateString('it-IT') : '-'}
        </div>
      </div>

      {/* Sezione tecnica */}
      {work_report_data?.time_entries && work_report_data.time_entries.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border border-gray-700 dark:border-gray-600">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Dati Tecnici
            </h3>
          </div>

          {work_report_data.time_entries.map((entry, index) => {
            if (!entry?.date) {
              return null;
            }

            const startTime = new Date(entry.date);
            const endTime = new Date(entry.date);
            const duration = entry.total_hours || 0;

            return (
              <div key={index} className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:mb-0">
                <div className="flex items-center gap-2">
                  <div className="flex-1 text-gray-900 dark:text-white">
                    {entry.time_slot_1_start}
                  </div>
                  <span className="mx-2 text-gray-400">
                    {entry.time_slot_1_end}
                  </span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {duration > 0 ? `${duration.toFixed(1)} h` : '--'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sezione materiali */}
      {work_report_data?.materials && work_report_data.materials.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border border-gray-700 dark:border-gray-600">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Materiali Utilizzati
            </h3>
          </div>

          <div className="space-y-2">
            {work_report_data.materials.map((material, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex-1 text-gray-900 dark:text-white">
                  {material.description || 'Senza descrizione'}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 text-gray-600 dark:text-gray-400">
                    {material.unit || 'PZ'}
                  </div>
                  <div className="flex-1 text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('it-IT').format(material.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}