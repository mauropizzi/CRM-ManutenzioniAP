export interface Material {
  id: string;
  user_id: string;
  unit: string; // e.g., "PZ", "MT", "KG", "LT", "NR"
  quantity: number;
  description: string;
  created_at?: string;
  updated_at?: string;
}