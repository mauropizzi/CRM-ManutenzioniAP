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
  referente?: string; // Reso opzionale
  pec?: string;       // Reso opzionale
  sdi?: string;       // Reso opzionale
  attivo: boolean;
  note?: string;      // Reso opzionale
}