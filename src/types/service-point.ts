export interface ServicePoint {
  id: string;
  name: string;
  address?: string;
  city?: string;
  cap?: string;
  provincia?: string;
  telefono?: string;
  email?: string;
  note?: string;
  customer_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  systems?: ServicePointSystem[];
}

export interface ServicePointSystem {
  id: string;
  system_type: string;
  system_type_id?: string;
  brand: string;
  brand_id?: string;
  model?: string;
  notes?: string;
}

export interface ServicePointWithSystems extends ServicePoint {
  systems: ServicePointSystem[];
}