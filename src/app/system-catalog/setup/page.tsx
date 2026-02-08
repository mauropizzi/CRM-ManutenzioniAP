"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Construction, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function SystemCatalogSetupPage() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    setDone(false);
    try {
      const res = await fetch("https://nrdsgtuzpnamcovuzghb.supabase.co/functions/v1/setup-system-catalog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        console.error("Setup error:", data);
        toast.error("Errore nel setup: verifica i log.");
        setRunning(false);
        return;
      }

      toast.success("Setup completato! Tabelle e policy aggiornate.");
      setDone(true);
    } catch (err: any) {
      console.error("Setup exception:", err);
      toast.error(`Errore: ${String(err?.message || err)}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-primary" />
            Setup Anagrafica Impianti (Tipi & Marche)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Questa procedura crea/aggiorna automaticamente le tabelle necessarie su Supabase:
            <strong> service_points</strong>, <strong>service_point_systems</strong>,
            <strong> system_types</strong> e <strong>brands</strong> incluse policy RLS e trigger.
          </p>

          <div className="flex gap-3">
            <Button onClick={handleRun} disabled={running} className="rounded-md">
              {running ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  In esecuzione...
                </>
              ) : (
                "Esegui Setup"
              )}
            </Button>
            {done && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Completato
              </div>
            )}
          </div>

          <Alert>
            <AlertTitle>Nota</AlertTitle>
            <AlertDescription>
              Se vedi ancora errori, premi Refresh della preview e riprova la funzionalità di creazione/selezione
              di Tipo Impianto e Marca nei form.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}