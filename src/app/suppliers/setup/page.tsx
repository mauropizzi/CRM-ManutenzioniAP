"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Link from "next/link";

const SUPPLIERS_SQL = `-- Create table
CREATE TABLE public.suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ragione_sociale TEXT NOT NULL,
  partita_iva TEXT,
  codice_fiscale TEXT,
  indirizzo TEXT,
  cap TEXT,
  citta TEXT,
  provincia TEXT,
  telefono TEXT,
  email TEXT,
  pec TEXT,
  tipo_servizio TEXT,
  attivo BOOLEAN DEFAULT true,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Policies: utenti autenticati gestiscono solo i propri record
CREATE POLICY "suppliers_select_own" ON public.suppliers
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "suppliers_insert_own" ON public.suppliers
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "suppliers_update_own" ON public.suppliers
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "suppliers_delete_own" ON public.suppliers
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Policies admin (coerenti con il resto del progetto)
CREATE POLICY "suppliers_admin_select" ON public.suppliers
FOR SELECT TO authenticated USING ((public.get_user_role(auth.uid()) = 'amministratore') OR (auth.uid() = user_id));

CREATE POLICY "suppliers_admin_update" ON public.suppliers
FOR UPDATE TO authenticated USING (public.get_user_role(auth.uid()) = 'amministratore');

CREATE POLICY "suppliers_admin_delete" ON public.suppliers
FOR DELETE TO authenticated USING (public.get_user_role(auth.uid()) = 'amministratore');

-- Trigger updated_at (riusa la funzione public.handle_updated_at già presente)
CREATE TRIGGER suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();`;

export default function SuppliersSetupPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SUPPLIERS_SQL);
    setCopied(true);
    toast.success("SQL copiato! Incollalo nel SQL Editor di Supabase e premi Esegui.");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-lg bg-white dark:bg-gray-900 shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Inizializza tabella Fornitori
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Per abilitare l’anagrafica fornitori, crea la tabella in Supabase con le policy di sicurezza.
          </p>

          <div className="mt-4 rounded-md border bg-gray-50 dark:bg-gray-800 p-4">
            <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              1. Copia lo SQL qui sotto.
            </p>
            <Button onClick={handleCopy} className="bg-blue-600 hover:bg-blue-700">
              {copied ? "SQL copiato" : "Copia SQL"}
            </Button>

            <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
              2. Apri il SQL Editor del tuo progetto Supabase, incolla lo SQL e premi Esegui.
            </p>
            <a
              href="https://app.supabase.com/project/nrdsgtuzpnamcovuzghb/sql/new"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block rounded-md border border-gray-300 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:border-gray-700 dark:text-blue-400 dark:hover:bg-gray-700"
            >
              Apri SQL Editor
            </a>

            <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
              3. Torna qui e vai alla pagina Fornitori per usare subito la funzione.
            </p>
            <Link
              href="/suppliers"
              className="mt-2 inline-block rounded-md border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Vai ai Fornitori
            </Link>
          </div>

          <pre className="mt-6 max-h-[300px] overflow-auto rounded-md bg-gray-100 p-4 text-xs dark:bg-gray-800 dark:text-gray-100">
{SUPPLIERS_SQL}
          </pre>
        </div>
      </div>
      <Toaster />
    </div>
  );
}