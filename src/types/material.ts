export const UNITS = ['PZ', 'MT', 'KG', 'LT'] as const; // Rimosso 'NR'
export type Unit = (typeof UNITS)[number];

export interface Material {
  id: string;
  user_id: string;
  unit: Unit;
  quantity: number;
  description: string;
  created_at?: string;
  updated_at?: string;
}