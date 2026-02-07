export interface TimeEntry {
  date: Date;
  /** 'technician' (default) or 'supplier' */
  resource_type?: 'technician' | 'supplier';
  /** Name of the selected resource (tecnico/fornitore). Kept as 'technician' for backward compatibility */
  technician: string;
  time_slot_1_start: string; // HH:MM
  time_slot_1_end: string;   // HH:MM
  time_slot_2_start?: string; // HH:MM, optional
  time_slot_2_end?: string;   // HH:MM, optional
  total_hours: number;
}

export interface MaterialUsed {
  unit?: string; // e.g., "PZ", "MT", "KG" - reso opzionale
  quantity: number;
  description?: string; // reso opzionale
}

export interface WorkReportData {
  client_absent?: boolean;
  work_description?: string;
  operative_notes?: string; // Rinominato per coerenza con WorkReportForm
  time_entries?: TimeEntry[];
  kilometers?: number;
  materials?: MaterialUsed[]; // Rinominato per coerenza con WorkReportForm
}

export interface InterventionRequest {
  id: string;
  customer_id?: string; // Nuovo campo per collegare l'intervento a un cliente esistente
  // Anagrafica cliente
  client_company_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  client_referent?: string; // Nuovo campo Referente

  // Campi utili alla creazione del cliente (se inserito manualmente)
  client_codice_fiscale?: string;
  client_partita_iva?: string;
  client_citta?: string;
  client_cap?: string;
  client_provincia?: string;
  client_pec?: string;
  client_sdi?: string;

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

  /**
   * Assegnazione: può essere valorizzato uno solo tra tecnico e fornitore.
   * (Entrambi opzionali)
   */
  assigned_technicians?: string; // Opzionale, testo libero
  assigned_supplier?: string; // Opzionale, testo libero

  office_notes?: string; // Opzionale

  // Dati di conclusione intervento (specifici per l'esito, non per la bolla di lavoro)
  intervention_concluded?: boolean;
  request_quote?: boolean;
  
  // Bolla di lavoro (ora un oggetto annidato)
  work_report_data?: WorkReportData;
  
  // Metadata
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}