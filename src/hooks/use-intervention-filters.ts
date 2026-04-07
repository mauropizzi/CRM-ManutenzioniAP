"use client";

import { useState, useMemo } from 'react';
import { InterventionRequest } from '@/types/intervention';

type StatusFilter = "all" | InterventionRequest["status"];
type AssignedFilter = "all" | "assigned" | "unassigned";

export function useInterventionFilters(
  interventionRequests: InterventionRequest[],
  technicians: any[],
  suppliers: any[]
) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [assignedFilter, setAssignedFilter] = useState<AssignedFilter>("all");

  const normalize = (s?: string) => (s || "").trim().toLowerCase();

  const getAssignedInfo = (request: InterventionRequest) => {
    const techName = (request.assigned_technicians || "").trim();
    const supplierName = (request.assigned_supplier || "").trim();

    if (techName) {
      const match = technicians.find(
        (t) => normalize(`${t.first_name} ${t.last_name}`) === normalize(techName)
      );
      return { type: "technician" as const, name: techName, phone: match?.phone || "" };
    }

    if (supplierName) {
      const match = suppliers.find((s) => normalize(s.ragione_sociale) === normalize(supplierName));
      return { type: "supplier" as const, name: supplierName, phone: match?.telefono || "" };
    }

    return { type: "none" as const, name: "", phone: "" };
  };

  const filteredRequests = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return interventionRequests.filter((r) => {
      const assigned = getAssignedInfo(r);

      const matchesSearch =
        !q ||
        (r.client_company_name || "").toLowerCase().includes(q) ||
        (r.system_type || "").toLowerCase().includes(q) ||
        (r.brand || "").toLowerCase().includes(q) ||
        (r.model || "").toLowerCase().includes(q) ||
        (r.client_address || "").toLowerCase().includes(q) ||
        (assigned.name || "").toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || r.status === statusFilter;

      const isAssigned = assigned.type !== "none";
      const matchesAssigned =
        assignedFilter === "all" || (assignedFilter === "assigned" ? isAssigned : !isAssigned);

      return matchesSearch && matchesStatus && matchesAssigned;
    });
  }, [interventionRequests, searchTerm, statusFilter, assignedFilter, technicians, suppliers]);

  const stats = useMemo(() => {
    return {
      total: interventionRequests.length,
      daFare: interventionRequests.filter((i) => i.status === "Da fare").length,
      inCorso: interventionRequests.filter((i) => i.status === "In corso").length,
      completati: interventionRequests.filter((i) => i.status === "Completato").length,
    };
  }, [interventionRequests]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    assignedFilter,
    setAssignedFilter,
    filteredRequests,
    stats,
    getAssignedInfo,
  };
}