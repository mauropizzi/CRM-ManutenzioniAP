"use client";

import React from "react";
import Link from "next/link";
import { Edit, FileText, MessageCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { InterventionRequest } from "@/types/intervention";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
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

interface InterventionRowProps {
  request: InterventionRequest;
  getAssignedInfo: (request: InterventionRequest) => { type: string; name: string; phone: string };
  onDelete: (id: string) => void;
}

function toIntlWhatsAppNumber(raw?: string) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("39")) return digits;
  return `39${digits}`;
}

async function createPublicLink(interventionId: string) {
  const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr) throw sessionErr;
  if (!session?.access_token) throw new Error("Sessione non valida.");

  const res = await fetch(
    "https://nrdsgtuzpnamcovuzghb.supabase.co/functions/v1/create-intervention-public-link",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ interventionId }),
    }
  );

  if (!res.ok) throw new Error("Impossibile generare il link pubblico");
  const json = await res.json();
  return String(json?.token || "").trim();
}

function buildWhatsAppUrl(request: InterventionRequest, publicToken: string, assigned: any) {
  const intl = toIntlWhatsAppNumber(assigned.phone);
  if (!intl) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/public/interventions/${publicToken}`;

  const d = request.scheduled_date ? (request.scheduled_date instanceof Date ? request.scheduled_date : new Date(request.scheduled_date as any)) : null;
  const dateStr = d ? format(d, "dd/MM/yyyy", { locale: it }) : "N/D";
  const timeStr = request.scheduled_time ? ` ${request.scheduled_time}` : "";

  const intro = assigned.type === "technician" 
    ? `Ciao ${assigned.name}, ti è stata assegnata una richiesta di intervento.` 
    : `Buongiorno ${assigned.name}, è stata assegnata una richiesta di intervento.`;

  const text = [
    intro,
    `Cliente: ${request.client_company_name}`,
    `Impianto: ${request.system_type} ${request.brand} ${request.model}`,
    `Data/Ora: ${dateStr}${timeStr}`,
    `Apri la richiesta: ${link}`,
  ].join("\n");

  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}

function getStatusBadgeVariant(status: InterventionRequest["status"]) {
  switch (status) {
    case "Da fare": return "bg-warning/10 text-warning border-warning/20";
    case "In corso": return "bg-info/10 text-info border-info/20";
    case "Completato": return "bg-success/10 text-success border-success/20";
    case "Annullato": return "bg-destructive/10 text-destructive border-destructive/20";
    default: return "bg-secondary text-secondary-foreground border-border";
  }
}

export function InterventionRow({ request, getAssignedInfo, onDelete }: InterventionRowProps) {
  const assigned = getAssignedInfo(request);

  const handleWhatsAppClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (assigned.type === "none") {
      toast.error("Nessun tecnico o fornitore assegnato.");
      return;
    }
    if (!assigned.phone) {
      toast.error("Telefono non disponibile.");
      return;
    }

    try {
      toast.loading("Preparazione WhatsApp...", { id: `wa-${request.id}` });
      const token = await createPublicLink(request.id);
      const url = buildWhatsAppUrl(request, token, assigned);
      if (!url) throw new Error("Errore generazione URL");
      toast.success("Pronto!", { id: `wa-${request.id}` });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast.error(e?.message || "Errore WhatsApp", { id: `wa-${request.id}` });
    }
  };

  return (
    <TableRow className="group">
      <TableCell className="font-medium">{request.client_company_name}</TableCell>
      <TableCell className="text-text-secondary text-xs">
        {request.system_type} {request.brand} {request.model}
      </TableCell>
      <TableCell className="text-xs">
        {request.scheduled_date ? (
          format(request.scheduled_date instanceof Date ? request.scheduled_date : new Date(request.scheduled_date as any), "dd/MM/yyyy", { locale: it })
        ) : "N/D"}
        {request.scheduled_time && ` ${request.scheduled_time}`}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={getStatusBadgeVariant(request.status)}>
          {request.status}
        </Badge>
      </TableCell>
      <TableCell className="text-xs">
        {assigned.name || <span className="text-muted-foreground italic">Non assegnato</span>}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/interventions/${request.id}/edit`} title="Modifica">
              <Edit size={16} />
            </Link>
          </Button>
          
          <Button variant="ghost" size="icon" onClick={handleWhatsAppClick} title="Invia WhatsApp">
            <MessageCircle size={16} />
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link href={`/interventions/${request.id}/work-report`} title="Bolla di lavoro">
              <FileText size={16} />
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Elimina">
                <Trash2 size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Elimina Intervento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Sei sicuro di voler eliminare questa richiesta? L'azione è irreversibile.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(request.id)} 
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Elimina
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}