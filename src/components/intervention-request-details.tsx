import React from 'react';

interface InterventionRequestDetailsProps {
  request: {
    id: string;
    work_report_data?: {
      time_entries?: Array<{
        date: string;
        technician: string;
        time_slot_1_start: string;
        time_slot_1_end: string;
        time_slot_2_start?: string;
        time_slot_2_end?: string;
        total_hours: number;
      }[];
      kilometers?: number;
      materials?: Array<{
        unit?: string;
        quantity: number;
        description?: string;
      }[];
    } | null;
  } | undefined;
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
          Aggiornato: {new Date(request.created_at).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) : '-'}
        </div>
      </div>
      </div>

      {/* Sezione tecnica */}
      {work_report_data?.time_entries && work_report_data.time_entries.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border border-gray-700 dark:border-gray-600">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Dati Tecnici
            </h3>
            
            {work_report_data.time_entries.map((entry, index) => {
              if (!entry?.date) {
                return null;
              }

              const startTime = new Date(entry.date);
              const endTime = new Date(entry.date);
              const duration = endTime && entry.start_time 
                ? Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60)
                : null;

              return (
                <div key={index} className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:mb-0">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {entry.time_slot_1_start ? new Date(entry.time_slot_1_start).toLocaleTimeString('it-IT') : '--:--'}
                      </span>
                      <span className="mx-2 text-gray-400">
                        {entry.time_slot_1_end ? new Date(entry.time_slot_1_end).toLocaleTimeString('it-IT') : '--:--'}
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {entry.time_slot_1_end && entry.time_slot_2_start ? `${Math.round((new Date(entry.time_slot_2_start).getTime() - new Date(entry.time_slot_2_end).getTime()) / 1000 / 60)} min` : '--'}
                      </span>
                    </div>
                    <div className="flex-1 text-gray-600 dark:text-gray-400 mt-2">
                      {entry.description && (
                        <div className="flex-1 text-gray-600 dark:text-gray-400">
                          {entry.description}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sezione materiali */}
          {work_report_data?.materials && work_report_data.materials.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border border-gray-700 dark:border-gray-600">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Materiali Utilizzati
            </h3>
            
            {work_report_data.materials.map((material, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex-1 text-gray-900 dark:text-white">
                  <div>
                    {material.description || 'Senza descrizione'}
                  </div>
                  <div className="flex-1 text-sm text-gray-600 dark:text-gray-400">
                    {material.unit || 'PZ'}
                  </div>
                  <div className="flex-1 text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('it-IT').format(material.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
      )}
    </div>
  );
}