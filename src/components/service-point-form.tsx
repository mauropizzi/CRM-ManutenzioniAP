"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomers } from '@/context/customer-context';
import { useServicePoint } from '@/context/service-point-context';
import { ServicePointWithSystems, ServicePointSystem } from '@/types/service-point';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ServicePointFormProps {
  servicePoint?: ServicePointWithSystems;
  customerId?: string;
}

export default function ServicePointForm({ servicePoint, customerId }: ServicePointFormProps) {
  const router = useRouter();
  const { customers } = useCustomers();
  const { createServicePoint, updateServicePoint, addSystem, updateSystem, deleteSystem } = useServicePoint();

  const [formData, setFormData] = useState({
    customer_id: customerId || (servicePoint as any)?.customer_id || '',
    name: (servicePoint as any)?.name || '',
    address: (servicePoint as any)?.address || '',
    city: (servicePoint as any)?.city || '',
    cap: (servicePoint as any)?.cap || '',
    provincia: (servicePoint as any)?.provincia || (servicePoint as any)?.province || '',
    telefono: (servicePoint as any)?.telefono || (servicePoint as any)?.phone || '',
    email: (servicePoint as any)?.email || '',
    note: (servicePoint as any)?.note || (servicePoint as any)?.notes || '',
  });

  const [systems, setSystems] = useState<ServicePointSystem[]>(servicePoint?.systems || []);
  const [newSystem, setNewSystem] = useState({ system_type: '', brand: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSystem = () => {
    if (newSystem.system_type && newSystem.brand) {
      setSystems((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          service_point_id: (servicePoint as any)?.id || '',
          system_type: newSystem.system_type,
          brand: newSystem.brand,
          created_at: new Date().toISOString(),
        },
      ]);
      setNewSystem({ system_type: '', brand: '' });
    }
  };

  const handleRemoveSystem = (systemId: string) => {
    setSystems((prev) => prev.filter((s) => s.id !== systemId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id || !formData.name) {
      toast.error('Seleziona un cliente e inserisci il nome del punto servizio');
      return;
    }

    setIsSubmitting(true);
    try {
      // Payload allineato allo schema DB (colonne: provincia, telefono, note)
      const basePayload = {
        customer_id: formData.customer_id,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        cap: formData.cap,
        provincia: formData.provincia,
        telefono: formData.telefono,
        email: formData.email,
        note: formData.note,
      };

      if (servicePoint) {
        await updateServicePoint((servicePoint as any).id, basePayload);

        // Handle systems updates
        const currentSystemIds = servicePoint.systems.map((s) => s.id);
        const newSystemIds = systems.map((s) => s.id);

        // Delete removed systems
        for (const systemId of currentSystemIds) {
          if (!newSystemIds.includes(systemId)) {
            await deleteSystem(systemId);
          }
        }

        // Update or add systems
        for (const system of systems) {
          const isExisting = currentSystemIds.includes(system.id);
          if (isExisting) {
            await updateSystem(system.id, {
              system_type: system.system_type,
              brand: system.brand,
            });
          } else {
            await addSystem((servicePoint as any).id, {
              system_type: system.system_type,
              brand: system.brand,
            });
          }
        }

        toast.success('Punto servizio aggiornato con successo');
      } else {
        const createdPoint = await createServicePoint(basePayload);

        // Add systems
        for (const system of systems) {
          await addSystem((createdPoint as any).id, {
            system_type: system.system_type,
            brand: system.brand,
          });
        }

        toast.success('Punto servizio creato con successo');
      }

      router.push('/service-points');
    } catch (error) {
      console.error('Error saving service point:', error);
      toast.error('Errore durante il salvataggio del punto servizio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{servicePoint ? 'Modifica Punto Servizio' : 'Nuovo Punto Servizio'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div>
              <Label htmlFor="customer_id">Cliente *</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => handleInputChange('customer_id', value)}
                disabled={!!customerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer: any) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.ragione_sociale}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Basic Info */}
            <div>
              <Label htmlFor="name">Nome Punto Servizio *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Es: Sede Principale, Magazzino, etc."
                required
              />
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Indirizzo</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Via/Piazza"
                />
              </div>
              <div>
                <Label htmlFor="city">Città</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Città"
                />
              </div>
              <div>
                <Label htmlFor="cap">CAP</Label>
                <Input
                  id="cap"
                  value={formData.cap}
                  onChange={(e) => handleInputChange('cap', e.target.value)}
                  placeholder="CAP"
                />
              </div>
              <div>
                <Label htmlFor="provincia">Provincia</Label>
                <Input
                  id="provincia"
                  value={formData.provincia}
                  onChange={(e) => handleInputChange('provincia', e.target.value)}
                  placeholder="Provincia"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefono">Telefono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  placeholder="Telefono"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Email"
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                placeholder="Note aggiuntive"
                rows={3}
              />
            </div>

            {/* Systems Section */}
            <div>
              <Label className="text-base font-semibold">Impianti</Label>
              <div className="space-y-4 mt-2">
                {/* Existing Systems */}
                {systems.map((system) => (
                  <div
                    key={system.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{system.system_type}</Badge>
                      <span className="text-sm text-muted-foreground">{system.brand}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSystem(system.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Add New System */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Tipo impianto"
                    value={newSystem.system_type}
                    onChange={(e) => setNewSystem((prev) => ({ ...prev, system_type: e.target.value }))}
                  />
                  <Input
                    placeholder="Marca"
                    value={newSystem.brand}
                    onChange={(e) => setNewSystem((prev) => ({ ...prev, brand: e.target.value }))}
                  />
                  <Button
                    type="button"
                    onClick={handleAddSystem}
                    disabled={!newSystem.system_type || !newSystem.brand}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => router.push('/service-points')}>
                Annulla
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvataggio...' : servicePoint ? 'Aggiorna' : 'Crea'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}