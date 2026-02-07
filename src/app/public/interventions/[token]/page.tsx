"use client";

import React, { useEffect, useMemo, useState } from "react";
import { use } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, Phone, Mail, CalendarClock, User2, Building2, Wrench } from "lucide-react";

interface PageProps {
  params: Promise<{ token: string }>;
}

type PublicIntervention = {
  id: string;
  client_company_name: string;
  client_referent?: string | null;
  client_phone?: string | null;
  client_email?: string | null;
  client_address?: string | null;
  system_type: string;
  brand?: string | null;
  model?: string | null;
  serial_number?: string | null;
  system_location?: string | null;
  internal_ref?: string | null;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  status?: string | null;
  assigned_technicians?: string | null;
  assigned_supplier?: string | null;
  office_notes?: string | null;
};

const statusBadge = (status?: string | null) => {
  switch (status) {
    case "Da fare":
      return "bg-amber-100 text-amber-900 border-amber-200";
    case "In corso":
      return "bg-sky-100 text-sky-900 border-sky-200";
    case "Completato":
      return "bg-emerald-100 text-emerald-900 border-emerald-200";
    case "Annullato":
      return "bg-rose-100 text-rose-900 border-rose-200";
    default:
      return "bg-slate-100 text-slate-900 border-slate-200";
  }
};

export default function PublicInterventionPage({ params }: PageProps) {
  const { token } = use(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intervention, setIntervention] = useState<PublicIntervention | null>(null);

  const scheduledText = useMemo(() => {
    if (!intervention?.scheduled_date) return "Da programmare";
    const date = new Date(intervention.scheduled_date);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const time = intervention.scheduled_time ? ` • ${intervention.scheduled_time}` : "";
    return `${dd}/${mm}/${yyyy}${time}`;
  }, [intervention]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          "https://nrdsgtuzpnamcovuzghb.supabase.co/functions/v1/get-intervention-public",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const msg =
            res.status === 410
              ? "Questo link è scaduto. Richiedi un nuovo link all'ufficio."
              : body?.error
                ? String(body.error)
                : "Link non valido o intervento non trovato.";
          throw new Error(msg);
        }

        const json = await res.json();
        if (!cancelled) {
          setIntervention(json?.intervention ?? null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Errore imprevisto");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="mx-auto max-w-xl">
          <Card className="rounded-2xl border-slate-200 bg-white/80 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-sky-100 text-sky-900 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
              <div>
                <div className="text-base font-semibold text-slate-900">Caricamento richiesta</div>
                <div className="text-sm text-slate-600">Attendi qualche secondo…</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !intervention) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="mx-auto max-w-xl">
          <Card className="rounded-2xl border-rose-200 bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold text-rose-900">Impossibile aprire la richiesta</div>
            <p className="mt-2 text-sm text-rose-800">{error || "Link non valido."}</p>
            <Separator className="my-5" />
            <p className="text-xs text-slate-600">
              Se pensi sia un errore, chiedi all’ufficio di inviarti un nuovo link.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const assigned = intervention.assigned_technicians || intervention.assigned_supplier || "";
  const assignedType = intervention.assigned_technicians ? "Tecnico" : intervention.assigned_supplier ? "Fornitore" : "";

  const mapsHref = intervention.client_address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(intervention.client_address)}`
    : null;

  const phoneHref = intervention.client_phone
    ? `tel:${String(intervention.client_phone).replace(/\s+/g, "")}`
    : null;

  const mailHref = intervention.client_email ? `mailto:${intervention.client_email}` : null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <Card className="rounded-2xl border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-900">
                <Wrench className="h-4 w-4" />
                Richiesta intervento
              </div>
              <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">
                {intervention.client_company_name}
              </h1>
              <div className="mt-1 text-sm text-slate-600">ID: {intervention.id}</div>
            </div>

            <Badge className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge(intervention.status)}`}>
              {intervention.status || "—"}
            </Badge>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-800">
              <CalendarClock className="h-4 w-4 text-sky-700" />
              <span className="font-medium">Programmazione:</span>
              <span className="text-slate-700">{scheduledText}</span>
            </div>

            {assigned && (
              <div className="flex items-center gap-2 text-sm text-slate-800">
                <User2 className="h-4 w-4 text-indigo-700" />
                <span className="font-medium">Assegnato:</span>
                <span className="text-slate-700">{assigned}</span>
                {assignedType && (
                  <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-800">
                    {assignedType}
                  </span>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card className="rounded-2xl border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Building2 className="h-4 w-4 text-indigo-700" />
            Dati impianto
          </div>
          <Separator className="my-4" />
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Tipo</dt>
              <dd className="font-medium text-slate-900">{intervention.system_type}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Marca / Modello</dt>
              <dd className="font-medium text-slate-900">
                {(intervention.brand || "—") + " " + (intervention.model || "")}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Matricola</dt>
              <dd className="font-medium text-slate-900">{intervention.serial_number || "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Ubicazione impianto</dt>
              <dd className="font-medium text-slate-900">{intervention.system_location || "—"}</dd>
            </div>
          </dl>
        </Card>

        <Card className="rounded-2xl border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MapPin className="h-4 w-4 text-sky-700" />
            Contatti / Indirizzo
          </div>
          <Separator className="my-4" />

          <div className="space-y-3 text-sm">
            <div>
              <div className="text-slate-500">Indirizzo</div>
              <div className="font-medium text-slate-900">{intervention.client_address || "—"}</div>
              {mapsHref && (
                <div className="mt-2">
                  <Button asChild variant="outline" className="rounded-full border-slate-200">
                    <a href={mapsHref} target="_blank" rel="noreferrer">
                      Apri su Maps
                    </a>
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="text-slate-500">Referente</div>
                <div className="font-medium text-slate-900">{intervention.client_referent || "—"}</div>
              </div>
              <div>
                <div className="text-slate-500">Telefono</div>
                <div className="font-medium text-slate-900">{intervention.client_phone || "—"}</div>
                {phoneHref && (
                  <div className="mt-2">
                    <Button asChild variant="outline" className="rounded-full border-slate-200">
                      <a href={phoneHref}>
                        <Phone className="mr-2 h-4 w-4" />
                        Chiama
                      </a>
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <div className="text-slate-500">Email</div>
                <div className="font-medium text-slate-900">{intervention.client_email || "—"}</div>
                {mailHref && (
                  <div className="mt-2">
                    <Button asChild variant="outline" className="rounded-full border-slate-200">
                      <a href={mailHref}>
                        <Mail className="mr-2 h-4 w-4" />
                        Scrivi email
                      </a>
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <div className="text-slate-500">Rif. interno</div>
                <div className="font-medium text-slate-900">{intervention.internal_ref || "—"}</div>
              </div>
            </div>

            {intervention.office_notes && intervention.office_notes.trim().length > 0 && (
              <div>
                <div className="text-slate-500">Note ufficio</div>
                <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-800">
                  {intervention.office_notes}
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="px-1 text-center text-xs text-slate-500">
          Documento informativo (sola lettura). Per modifiche contatta l’ufficio.
        </div>
      </div>
    </div>
  );
}
