export interface ServicePoint {
  id: string;
  customer_id: string;
  created_by: string;
  name: string;
  address: string | null;
  city: string | null;
  cap: string | null;
  provincia: string | null;
  telefono: string | null;
  email: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServicePointSystem {
  id: string;
  service_point_id: string;
  // legacy text columns (still used for display and DB NOT NULL)
  system_type: string;
  brand: string;
  // optional FK columns
  system_type_id: string | null;
  brand_id: string | null;
  created_at: string;
}

export interface ServicePointWithSystems extends ServicePoint {
  systems: ServicePointSystem[];
}
