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
  systems?: Array<{
    id: string;
    system_type: string;
    brand: string;
  }>;
}

export interface ServicePointWithSystems extends ServicePoint {
  systems: Array<{
    id: string;
    system_type: string;
    brand: string;
  }>;
}