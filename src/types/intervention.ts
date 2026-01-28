export interface TimeEntry {
  date: Date;
  technician: string;
  time_slot_1_start: string; // HH:MM
  time_slot_1_end: string;   // HH:MM
  time_slot_2_start?: string; // HH:MM, optional
  time_slot_2_end?: string;   // HH:MM, optional
  total_hours: number;
}

export interface MaterialUsed {
  unit: string; // e.g., "PZ", "MT", "KG"
  quantity: number;
  description: string;
}

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

  // Dati di conclusione intervento (nuovi campi)
  intervention_concluded?: boolean;
  request_quote?: boolean;
  client_absent?: boolean;
  work_description?: string;
  operative_notes_conclusion?: string; // Rinominato per evitare conflitto con office_notes
  time_entries?: TimeEntry[];
  kilometers?: number;
  materials_used?: MaterialUsed[];
}