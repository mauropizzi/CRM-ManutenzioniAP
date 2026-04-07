"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, Wrench } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useInterventionRequests } from "@/context/intervention-context";
import { useTechnicians } from "@/context/technician-context";
import { useSuppliers } from "@/context/supplier-context";
import { useInterventionFilters } from "@/hooks/use-intervention-filters";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { InterventionStats } from "./intervention-stats";
import { InterventionFilters } from "./intervention-filters";
import { InterventionRow } from "./intervention-row";

export function InterventionTable() {
  const { interventionRequests, loading, deleteInterventionRequest } = useInterventionRequests();
  const { technicians } = useTechnicians();
  const { suppliers } = useSuppliers();

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    assignedFilter,
    setAssignedFilter,
    filteredRequests,
    stats,
    getAssignedInfo,
  } = useInterventionFilters(interventionRequests, technicians, suppliers);

  const handleDelete = async (id: string) => {
    try {
      await deleteInterventionRequest(id);
    } catch (e: any) {
      toast.error(e?.message || "Errore durante l'eliminazione");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Interventi</h2>
          <p className="text-text-secondary text-sm mt-1">
            Gestisci richieste, assegnazioni e bolla di lavoro
          </p>
        </div>
        <Link href="/interventions/new">
          <Button variant="default" className="gap-2">
            <PlusCircle size={18} />
            Nuova Richiesta
          </Button>
        </Link>
      </div>

      <InterventionStats {...stats} />

      <InterventionFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter as (val: string) => void}
        assignedFilter={assignedFilter}
        setAssignedFilter={setAssignedFilter as (val: string) => void}
      />

      <Card>
        {loading ? (
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Wrench className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Caricamento…</h3>
              <p className="text-text-secondary">Sto recuperando gli interventi</p>
            </div>
          </CardContent>
        ) : filteredRequests.length === 0 ? (
          <CardContent className="py-12 text-center text-text-secondary">
            Nessun intervento trovato per i filtri selezionati.
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Impianto</TableHead>
                <TableHead>Data/Ora</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Assegnato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <InterventionRow 
                  key={request.id} 
                  request={request} 
                  getAssignedInfo={getAssignedInfo}
                  onDelete={handleDelete}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}