"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCustomers } from '@/context/customer-context';
import { toast } from 'sonner';
import { ArrowLeft, MapPin } from 'lucide-react';
import Link from 'next/link';
import { CustomerForm, CustomerFormValues } from '@/components/customer-form';

export default function EditCustomerClient() {
  const params = useParams();
  const router = useRouter();
  const { customers, updateCustomer } = useCustomers();
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    const found = customers.find((c: any) => c.id === params.id);
    if (found) {
      setCustomer(found);
    }
  }, [customers, params.id]);

  const handleSubmit = async (data: CustomerFormValues) => {
    try {
      if (!customer) {
        toast.error('Cliente non trovato');
        return;
      }

      const updatedCustomer = {
        ...customer,
        ...data
      };

      await updateCustomer(customer.id, { ...customer, ...data });
      router.push('/customers');
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Errore durante l\'aggiornamento del cliente');
    }
  };

  if (!customer) {
    return <div className="p-8 text-center">Caricamento...</div>;
  }

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
            <Button variant="outline">
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
          <CustomerForm initialData={customer} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}