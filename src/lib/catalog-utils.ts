import { supabase } from '@/integrations/supabase/client';

export interface CatalogItem {
  id: string;
  name: string;
  active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const fetchSystemTypes = async (): Promise<CatalogItem[]> => {
  const { data, error } = await supabase
    .from('system_types')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data as CatalogItem[]) || [];
};

export const fetchBrands = async (): Promise<CatalogItem[]> => {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data as CatalogItem[]) || [];
};

/**
 * Upsert by name: if a record exists case-insensitively, return it; otherwise insert new.
 * Returns the created or existing row.
 */
export const upsertSystemTypeByName = async (name: string) => {
  const normalized = String(name ?? '').trim();
  if (!normalized) throw new Error('Nome tipo impianto non valido');

  // Try fetch existing by lower(name)
  const { data: existing, error: selErr } = await supabase
    .from('system_types')
    .select('*')
    .ilike('name', normalized)
    .limit(1);

  if (selErr) throw selErr;
  if (existing && existing.length > 0) return existing[0];

  // Insert new with created_by from session
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!user) throw new Error('Utente non autenticato');

  const { data, error } = await supabase
    .from('system_types')
    .insert([{ name: normalized, created_by: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const upsertBrandByName = async (name: string) => {
  const normalized = String(name ?? '').trim();
  if (!normalized) throw new Error('Nome marca non valido');

  const { data: existing, error: selErr } = await supabase
    .from('brands')
    .select('*')
    .ilike('name', normalized)
    .limit(1);

  if (selErr) throw selErr;
  if (existing && existing.length > 0) return existing[0];

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!user) throw new Error('Utente non autenticato');

  const { data, error } = await supabase
    .from('brands')
    .insert([{ name: normalized, created_by: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};