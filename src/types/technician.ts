export interface Technician {
  id: string;
  user_id: string; // The ID of the user who created this technician entry
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  specialization?: string; // e.g., "HVAC", "Electrical", "Plumbing"
  is_active: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}