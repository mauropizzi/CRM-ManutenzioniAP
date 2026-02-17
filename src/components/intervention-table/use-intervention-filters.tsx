"use client";

import { useMemo } from 'react';
import { Intervention } from '@/types/intervention';

export function useInterventionFilters(
  interventions: Intervention[],
  searchTerm: string,
  statusFilter: string
) {
  return useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return interventions.filter((intervention) => {
      const matchesSearch =
        !q ||
        String(intervention.client_company_name || '').toLowerCase().includes(q) ||
        String(intervention.system_type || '').toLowerCase().includes(q) ||
        String(intervention.brand || '').toLowerCase().includes(q) ||
        String(intervention.model || '').toLowerCase().includes(q) ||
        String(intervention.assigned_technicians || '').toLowerCase().includes(q) ||
        String(intervention.client_address || '').toLowerCase().includes(q) ||
        String(intervention.office_notes || '').toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' || intervention.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [interventions, searchTerm, statusFilter]);
}