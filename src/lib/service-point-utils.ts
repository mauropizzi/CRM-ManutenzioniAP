import { supabase } from '@/integrations/supabase/client';
import { ServicePoint, ServicePointSystem, ServicePointWithSystems } from '@/types/service-point';

export const getServicePoints = async (): Promise<ServicePointWithSystems[]> => {
  const { data: servicePoints, error } = await supabase
    .from('service_points')
    .select(`
      *,
      service_point_systems (*)
    `)
    .order('name');

  if (error) throw error;
  return servicePoints.map(point => ({
    ...point,
    systems: point.service_point_systems || []
  }));
};

export const getServicePointsByCustomer = async (customerId: string): Promise<ServicePointWithSystems[]> => {
  const { data: servicePoints, error } = await supabase
    .from('service_points')
    .select(`
      *,
      service_point_systems (*)
    `)
    .eq('customer_id', customerId)
    .order('name');

  if (error) throw error;
  return servicePoints.map(point => ({
    ...point,
    systems: point.service_point_systems || []
  }));
};

export const getServicePoint = async (id: string): Promise<ServicePointWithSystems | null> => {
  const { data: servicePoint, error } = await supabase
    .from('service_points')
    .select(`
      *,
      service_point_systems (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!servicePoint) return null;

  return {
    ...servicePoint,
    systems: servicePoint.service_point_systems || []
  };
};

export const createServicePoint = async (servicePoint: Omit<ServicePoint, 'id' | 'created_at' | 'updated_at'>): Promise<ServicePoint> => {
  const { data, error } = await supabase
    .from('service_points')
    .insert([servicePoint])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateServicePoint = async (id: string, updates: Partial<ServicePoint>): Promise<ServicePoint> => {
  const { data, error } = await supabase
    .from('service_points')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteServicePoint = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('service_points')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const addServicePointSystem = async (system: Omit<ServicePointSystem, 'id' | 'created_at'>): Promise<ServicePointSystem> => {
  const { data, error } = await supabase
    .from('service_point_systems')
    .insert([system])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateServicePointSystem = async (id: string, updates: Partial<ServicePointSystem>): Promise<ServicePointSystem> => {
  const { data, error } = await supabase
    .from('service_point_systems')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteServicePointSystem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('service_point_systems')
    .delete()
    .eq('id', id);

  if (error) throw error;
};