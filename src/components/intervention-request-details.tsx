"use client";

import React from 'react';
import { TimeEntry, MaterialUsed, WorkReportData } from '@/types/intervention';
import { Badge } from '@/components/ui/badge';
import { formatDuration } from '@/lib/time-utils';

/**
 * InterventionRequestDetails
 * 
 * Componente per visualizzare i dettagli completi di una richiesta di intervento
 * Mostra il totale delle ore lavorate con badge dinamico
 * In modo strutturato e professionale
 */
export default function InterventionRequestDetails({ request }: { request: { id: string; work_report_data?: WorkReportData; created_at?: string } }) {
  const { work_report_data } = request;

  // Calcola il totale delle ore lavorate
  const totalHours = work_report_data?.time_entries?.reduce(
    (sum: number, entry: any) => sum + (Number(entry.total_hours) || 0), 0
  ) || 0;

  return (
    <div className="space-y-6">
      {/* Header con ID della richiesta */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dettagli Richiesta #{request.id?.slice(0, 8) || 'N/A'}
          </h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="mb-2">
              {work_report_data?.time_entries?.length || 0} voci di tempo
            </Badge>
            <Badge variant="primary" className="mb-2">
              {totalHours > 0 ? `${formatDuration(totalHours * 60)} ore totali` : '0 ore totali'}
            </Badge>
          </div>
        </div>
        <div className="time-sm text-gray-600 dark:text-gray-400">
          Aggiornato: {new Date(request.created_at).toLocaleDateString('it-IT')}
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
              if (!entry?.date || !entry?.total_hours) {
                return null;
              }

              const startTime = new Date(entry.date);
              const endTime = new Date(entry.date);
              const duration = entry.total_hours || 0;

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
                      <span className="list-none text-gray-900 dark:text-white">
                        {entry.time_slot_1_end && entry.time_slot_2_start ? 
                          formatDuration((new Date(entry.time_slot_2_start).getTime() - new Date(entry.time_slot_2_end).getTime()) / 1000 / 60)
                        : entry.total_hours > 0 && `${entry.total_hours} min`
                        }
                      </span>
                    </div>
                    <div className="flex-1 text-gray-600 dark:text-gray-400 mt-2">
                      {entry.description && (
                        <div className="text-gray-600 dark:text-gray-400">
                          {entry.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                  <div className="text-sm">
                    {material.description || 'Senza descrizione'}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {material.unit || 'PZ'}
                    </div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
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

export default InterventionRequestDetails;