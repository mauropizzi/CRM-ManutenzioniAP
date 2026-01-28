export interface InterventionRequest {
  id: string;
  // Anagrafica cliente
  client_company_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  // Impianto / Modello macchina
  system_type: string;
  brand: string;
  model: string;
  serial_number: string;
  system_location: string;
  internal_ref?: string; // Opzionale
  // Programmazione / Dati intervento
  scheduled_date?: Date; // Opzionale, per il DatePicker
  scheduled_time?: string; // Opzionale, formato HH:MM
  status: 'Da fare' | 'In corso' | 'Completato' | 'Annullato';
  assigned_technicians?: string; // Opzionale, testo libero
  office_notes?: string; // Opzionale
}