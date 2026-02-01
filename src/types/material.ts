export const UNITS = ['PZ', 'MT', 'KG', 'LT'] as const;
export type Unit = (typeof UNITS)[number];

export interface Material {
  id: string;
  user_id: string;
  unit: Unit;
  description: string; // Rimosso il campo quantity
  created_at?: string;
  updated_at?: string;
}