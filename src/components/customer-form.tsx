"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useCustomers } from '@/context/customer-context';
import { useSystemTypes } from '@/context/system-type-context';
import { useBrands } from '@/context/brand-context';
import { Customer } from '@/types/customer';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CustomerFormProps {
  customer?: Customer;
}

export default function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter();
  const { addCustomer, updateCustomer } = useCustomers();
  const { systemTypes, loading: loadingSystemTypes } = useSystemTypes();
  const { brands, loading: loadingBrands } = useBrands();

  const [formData, setFormData] = useState({
    ragione_sociale: '',
    codice_fiscale: '',
    partita_iva: '',
    indirizzo: '',
    citta: '',
    cap: '',
    provincia: '',
    telefono: '',
    email: '',
    referente: '',
    pec: '',
    sdi: '',
    attivo: true,
    note: '',
    system_type_id: '',
    brand_id: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        ragione_sociale: customer.ragione_sociale || '',
        codice_fiscale: customer.codice_fiscale || '',
        partita_iva: customer.partita_iva || '',
        indirizzo: customer.indirizzo || '',
        citta: customer.citta || '',
        cap: customer.cap || '',
        provincia: customer.provincia || '',
        telefono: customer.telefono || '',
        email: customer.email || '',
        referente: customer.referente || '',
        pec: customer.pec || '',
        sdi: customer.sdi || '',
        attivo: customer.attivo !== undefined ? customer.attivo : true,
        note: customer.note || '',
        system_type_id: customer.system_type_id || '',
        brand_id: customer.brand_id || '',
      });
    }
  }, [customer]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ragione_sociale) {
      toast.error('Inserisci la ragione sociale');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedType = systemTypes.find(t => t.id === formData.system_type_id);
      const selectedBrand = brands.find(b => b.id === formData.brand_id);

      const payload = {
        ...formData,
        system_type: selectedType?.name || null,
        brand: selectedBrand?.name || null,
      };

      if (customer) {
        await updateCustomer({ ...customer, ...payload });
        toast.success('Cliente aggiornato con successo');
      } else {
        await addCustomer(payload);
        toast.success('Cliente creato con successo');
      }
      router.push('/customers');
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Errore durante il salvataggio del cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{customer ? 'Modifica Cliente' : 'Nuovo Cliente'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Dati Anagrafici</h3>
              <div>
                <Label htmlFor="ragione_sociale">Ragione Sociale *</Label>
                <Input
                  id="ragione_sociale"
                  value={formData.ragione_sociale}
                  onChange={(e) => handleInputChange('ragione_sociale', e.target.value)}
                  placeholder="Ragione Sociale"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div>
                  <Label htmlFor="system_type_id" className="text-blue-800 dark:text-blue-200 font-medium">
                    Tipo Impianto
                  </Label>
                  <Select
                    value={formData.system_type_id}
                    onValueChange={(value) => handleInputChange('system_type_id', value)}
                  >
                    <SelectTrigger id="system_type_id" className="bg-white dark:bg-gray-900">
                      <SelectValue placeholder="-- Seleziona Tipo Impianto --" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingSystemTypes ? (
                        <SelectItem value="" disabled>Caricamento...</SelectItem>
                      ) : systemTypes.length === 0 ? (
                        <SelectItem value="" disabled>Nessun tipo impianto disponibile</SelectItem>
                      ) : (
                        systemTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="brand_id" className="text-blue-800 dark:text-blue-200 font-medium">
                    Marca
                  </Label>
                  <Select
                    value={formData.brand_id}
                    onValueChange={(value) => handleInputChange('brand_id', value)}
                  >
                    <SelectTrigger id="brand_id" className="bg-white dark:bg-gray-900">
                      <SelectValue placeholder="-- Seleziona Marca --" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingBrands ? (
                        <SelectItem value="" disabled>Caricamento...</SelectItem>
                      ) : brands.length === 0 ? (
                        <SelectItem value="" disabled>Nessuna marca disponibile</SelectItem>
                      ) : (
                        brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codice_fiscale">Codice Fiscale</Label>
                  <Input
                    id="codice_fiscale"
                    value={formData.codice_fiscale}
                    onChange={(e) => handleInputChange('codice_fiscale', e.target.value)}
                    placeholder="Codice Fiscale"
                  />
                </div>
                <div>
                  <Label htmlFor="partita_iva">Partita IVA</Label>
                  <Input
                    id="partita_iva"
                    value={formData.partita_iva}
                    onChange={(e) => handleInputChange('partita_iva', e.target.value)}
                    placeholder="Partita IVA"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Indirizzo</h3>
              <div>
                <Label htmlFor="indirizzo">Indirizzo</Label>
                <Input
                  id="indirizzo"
                  value={formData.indirizzo}
                  onChange={(e) => handleInputChange('indirizzo', e.target.value)}
                  placeholder="Via/Piazza, Numero"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="citta">Città</Label>
                  <Input
                    id="citta"
                    value={formData.citta}
                    onChange={(e) => handleInputChange('citta', e.target.value)}
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
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Contatti</h3>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="referente">Referente</Label>
                  <Input
                    id="referente"
                    value={formData.referente}
                    onChange={(e) => handleInputChange('referente', e.target.value)}
                    placeholder="Nome referente"
                  />
                </div>
                <div>
                  <Label htmlFor="pec">PEC</Label>
                  <Input
                    id="pec"
                    type="email"
                    value={formData.pec}
                    onChange={(e) => handleInputChange('pec', e.target.value)}
                    placeholder="PEC"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="sdi">Codice SDI</Label>
                <Input
                  id="sdi"
                  value={formData.sdi}
                  onChange={(e) => handleInputChange('sdi', e.target.value)}
                  placeholder="Codice SDI"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Stato e Note</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="attivo"
                  checked={formData.attivo}
                  onCheckedChange={(checked) => handleInputChange('attivo', checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="attivo"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Attivo
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Indica se il cliente è attivo.
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => handleInputChange('note', e.target.value)}
                  placeholder="Note aggiuntive sul cliente..."
                  rows={4}
                />
              </div>
            </div>
            <div className="flex gap-4 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.push('/customers')}>
                Annulla
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvataggio...' : customer ? 'Aggiorna Cliente' : 'Crea Cliente'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}