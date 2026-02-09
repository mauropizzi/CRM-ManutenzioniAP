export interface Customer {
  id: string;
  ragione_sociale: string;
  codice_fiscale: string;
  partita_iva: string;
  indirizzo: string;
  citta: string;
  cap: string;
  provincia: string;
  telefono: string;
  email: string;
  referente?: string;
  pec?: string;
  sdi?: string;
  attivo: boolean;
  note?: string;
  system_type_id?: string | null;
  brand_id?: string | null;
  system_type?: string | null;
  brand?: string | null;
}