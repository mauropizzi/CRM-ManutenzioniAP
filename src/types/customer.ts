export interface Customer {
  id: string;
  user_id: string;
  ragione_sociale: string;
  indirizzo?: string;
  citta?: string;
  cap?: string;
  provincia?: string;
  telefono?: string;
  email?: string;
  partita_iva?: string;
  codice_fiscale?: string;
  note?: string;
  system_type?: string;
  brand?: string;
  system_type_id?: string;
  brand_id?: string;
  referente?: string;
  pec?: string;
  sdi?: string;
  attivo?: boolean;
  created_at: string;
  updated_at: string;
}