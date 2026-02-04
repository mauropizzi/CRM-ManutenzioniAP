"use client";

export interface Supplier {
  id: string;
  user_id?: string | null;
  ragione_sociale: string;
  partita_iva?: string | null;
  codice_fiscale?: string | null;
  indirizzo?: string | null;
  cap?: string | null;
  citta?: string | null;
  provincia?: string | null;
  telefono?: string | null;
  email?: string | null;
  pec?: string | null;
  tipo_servizio?: string | null;
  attivo?: boolean | null;
  note?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}