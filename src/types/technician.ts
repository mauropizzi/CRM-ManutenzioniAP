export interface Technician {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  specialization?: string;
  is_active: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}