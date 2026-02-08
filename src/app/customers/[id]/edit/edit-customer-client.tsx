"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useCustomers } from '@/context/customer-context';
import { toast } from 'sonner';
import { ArrowLeft, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function EditCustomerClient() {
  const params = useParams();
  const router = useRouter();
  const { customers, updateCustomer } = useCustomers();

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
    note: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const customer = customers.find((c: any) => c.id === params.id);
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
        attivo: customer.attivo ?? true,
        note: customer.note || ''
      });
    }
  }, [customers, params.id]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ragione_sociale) {
      toast.error('La ragione sociale è obbligatoria');
      return;
    }

    setIsSubmitting(true);
    try {
      const customer = customers.find((c: any) => c.id === params.id);
      if (!customer) {
        toast.error('Cliente non trovato');
        return;
      }

      const updatedCustomer = {
        ...customer,
        ...formData
      };

      await updateCustomer(updatedCustomer);
      toast.success('Cliente aggiornato con successo');
      router.push('/customers');
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Errore durante l\'aggiornamento del cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/customers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Modifica Cliente</h1>
          <p className="text-muted-foreground">Aggiorna le informazioni del cliente</p>
        </div>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Punti Servizio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Gestisci i punti servizio associati a questo cliente
          </p>
          <Link href={`/customers/${params.id}/service-points`}>
            <Button>
              Gestisci Punti Servizio
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Customer Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informazioni Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <Label htmlFor="partita_iva">Partita IVA</Label>
                <Input
                  id="partita_iva"
                  value={formData.partita_iva}
                  onChange={(e) => handleInputChange('partita_iva', e.target.value)}
                  placeholder="Partita IVA"
                />
              </div>
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
                <Label htmlFor="referente">Referente</Label>
                <Input
                  id="referente"
                  value={formData.referente}
                  onChange={(e) => handleInputChange('referente', e.target.value)}
                  placeholder="Nome referente"
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="indirizzo">Indirizzo</Label>
                <Input
                  id="indirizzo"
                  value={formData.indirizzo}
                  onChange={(e) => handleInputChange('indirizzo', e.target.value)}
                  placeholder="Via/Piazza"
                />
              </div>
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
              <div>
                <Label htmlFor="sdi">SDI</Label>
                <Input
                  id="sdi"
                  value={formData.sdi}
                  onChange={(e) => handleInputChange('sdi', e.target.value)}
                  placeholder="SDI"
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="attivo"
                  checked={formData.attivo}
                  onCheckedChange={(checked) => handleInputChange('attivo', checked)}
                />
                <Label htmlFor="attivo">Cliente attivo</Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/customers')}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvataggio...' : 'Aggiorna'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}