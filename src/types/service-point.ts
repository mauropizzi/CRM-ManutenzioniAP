export interface ServicePoint {
  id: string;
  user_id?: string | null;
  customer_id: string;
  nome_punto_servizio: string;
  indirizzo?: string | null;
  citta?: string | null;
  cap?: string | null;
  provincia?: string | null;
  telefono?: string | null;
  email?: string | null;
  note?: string | null;
  tipo_impianti?: string[] | null;
  marche?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}