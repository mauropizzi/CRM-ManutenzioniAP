export const UNITS = ['PZ', 'MT', 'KG', 'LT', 'NR'] as const;
export type Unit = (typeof UNITS)[number];

export interface Material {
  id: string;
  user_id: string;
  unit: Unit; // Changed from string to Unit
  quantity: number;
  description: string;
  created_at?: string;
  updated_at?: string;
}