"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { InterventionRequest } from '@/types/intervention';
import { toast } from 'sonner';

interface InterventionContextType {
  interventionRequests: InterventionRequest[];
  addInterventionRequest: (request: Omit<InterventionRequest, 'id'>) => void;
  updateInterventionRequest: (request: InterventionRequest) => void;
  deleteInterventionRequest: (id: string) => void;
}

const InterventionContext = createContext<InterventionContextType | undefined>(undefined);

export const InterventionProvider = ({ children }: { children: ReactNode }) => {
  const [interventionRequests, setInterventionRequests] = useState<InterventionRequest[]>([]);

  const addInterventionRequest = (newRequest: Omit<InterventionRequest, 'id'>) => {
    const requestWithId = { ...newRequest, id: crypto.randomUUID() };
    setInterventionRequests((prev) => [...prev, requestWithId]);
    toast.success("Richiesta di intervento aggiunta con successo!");
  };

  const updateInterventionRequest = (updatedRequest: InterventionRequest) => {
    setInterventionRequests((prev) =>
      prev.map((request) =>
        request.id === updatedRequest.id ? updatedRequest : request
      )
    );
    toast.success("Richiesta di intervento aggiornata con successo!");
  };

  const deleteInterventionRequest = (id: string) => {
    setInterventionRequests((prev) => prev.filter((request) => request.id !== id));
    toast.success("Richiesta di intervento eliminata con successo!");
  };

  return (
    <InterventionContext.Provider value={{ interventionRequests, addInterventionRequest, updateInterventionRequest, deleteInterventionRequest }}>
      {children}
    </InterventionContext.Provider>
  );
};

export const useInterventionRequests = () => {
  const context = useContext(InterventionContext);
  if (context === undefined) {
    throw new Error('useInterventionRequests must be used within an InterventionProvider');
  }
  return context;
};