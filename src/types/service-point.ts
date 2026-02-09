export interface ServicePoint {
  id: string;
  customer_id: string;
  user_id: string;
  name: string;
  address: string;
  city: string;
  cap: string;
  province: string;
  phone: string;
  email: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ServicePointSystem {
  id: string;
  service_point_id: string;
  system_type: string;
  brand: string;
  created_at: string;
}

export interface ServicePointWithSystems extends ServicePoint {
  systems: ServicePointSystem[];
}