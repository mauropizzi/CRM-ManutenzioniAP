"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ServicePointWithSystems, ServicePointSystem } from '@/types/service-point';
import { getServicePoints, createServicePoint, updateServicePoint, deleteServicePoint, addServicePointSystem, updateServicePointSystem, deleteServicePointSystem } from '@/lib/service-point-utils';

interface ServicePointContextType {
  servicePoints: ServicePointWithSystems[];
  loading: boolean;
  refreshServicePoints: () => Promise<void>;
  createServicePoint: (servicePoint: any) => Promise<void>;
  updateServicePoint: (id: string, updates: any) => Promise<void>;
  deleteServicePoint: (id: string) => Promise<void>;
  addSystem: (servicePointId: string, system: Omit<ServicePointSystem, 'id' | 'created_at' | 'service_point_id'>) => Promise<void>;
  updateSystem: (systemId: string, updates: Partial<ServicePointSystem>) => Promise<void>;
  deleteSystem: (systemId: string) => Promise<void>;
}

const ServicePointContext = createContext<ServicePointContextType | undefined>(undefined);

export const useServicePoint = () => {
  const context = useContext(ServicePointContext);
  if (context === undefined) {
    throw new Error('useServicePoint must be used within a ServicePointProvider');
  }
  return context;
};

interface ServicePointProviderProps {
  children: ReactNode;
}

export const ServicePointProvider: React.FC<ServicePointProviderProps> = ({ children }) => {
  const [servicePoints, setServicePoints] = useState<ServicePointWithSystems[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshServicePoints = async () => {
    setLoading(true);
    try {
      const points = await getServicePoints();
      setServicePoints(points);
    } catch (error) {
      console.error('Error fetching service points:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateServicePoint = async (servicePointData: any) => {
    try {
      await createServicePoint(servicePointData);
      await refreshServicePoints();
    } catch (error) {
      console.error('Error creating service point:', error);
      throw error;
    }
  };

  const handleUpdateServicePoint = async (id: string, updates: any) => {
    try {
      await updateServicePoint(id, updates);
      await refreshServicePoints();
    } catch (error) {
      console.error('Error updating service point:', error);
      throw error;
    }
  };

  const handleDeleteServicePoint = async (id: string) => {
    try {
      await deleteServicePoint(id);
      await refreshServicePoints();
    } catch (error) {
      console.error('Error deleting service point:', error);
      throw error;
    }
  };

  const handleAddSystem = async (servicePointId: string, systemData: Omit<ServicePointSystem, 'id' | 'created_at' | 'service_point_id'>) => {
    try {
      await addServicePointSystem({
        service_point_id: servicePointId,
        ...systemData
      });
      await refreshServicePoints();
    } catch (error) {
      console.error('Error adding system:', error);
      throw error;
    }
  };

  const handleUpdateSystem = async (systemId: string, updates: Partial<ServicePointSystem>) => {
    try {
      await updateServicePointSystem(systemId, updates);
      await refreshServicePoints();
    } catch (error) {
      console.error('Error updating system:', error);
      throw error;
    }
  };

  const handleDeleteSystem = async (systemId: string) => {
    try {
      await deleteServicePointSystem(systemId);
      await refreshServicePoints();
    } catch (error) {
      console.error('Error deleting system:', error);
      throw error;
    }
  };

  useEffect(() => {
    refreshServicePoints();
  }, []);

  return (
    <ServicePointContext.Provider value={{
      servicePoints,
      loading,
      refreshServicePoints,
      createServicePoint: handleCreateServicePoint,
      updateServicePoint: handleUpdateServicePoint,
      deleteServicePoint: handleDeleteServicePoint,
      addSystem: handleAddSystem,
      updateSystem: handleUpdateSystem,
      deleteSystem: handleDeleteSystem
    }}>
      {children}
    </ServicePointContext.Provider>
  );
};