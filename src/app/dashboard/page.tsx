"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/context/profile-context';
import { MadeWithDyad } from "@/components/made-with-dyad";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wrench, ClipboardList, Shield } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { profile, isLoading, isAdmin, isOffice, isTechnician } = useProfile();

  useEffect(() => {
    if (!isLoading && !profile) {
      router.push('/');
    }
  }, [profile, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 bg-gray-50 dark:bg-gray-950">
      <main className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Benvenuto{profile.first_name ? `, ${profile.first_name}` : ''}!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Ruolo: <span className="font-medium capitalize">{profile.role}</span>
          </p>
        </div>

        {/* Cards principali */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Anagrafica Clienti
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Gestisci i clienti e i loro dati
              </p>
              <Link href="/customers" passHref>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Vai ai Clienti
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Richieste Intervento
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Visualizza e gestisci gli interventi
              </p>
              <Link href="/interventions" passHref>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Vai agli Interventi
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Nuovo Intervento
              </CardTitle>
              <Wrench className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Registra una nuova richiesta
              </p>
              <Link href="/interventions/new" passHref>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Crea Intervento
                </Button>
              </Link>
            </CardContent>
          </Card>

          {(isAdmin || isOffice) && (
            <Card className="hover:shadow-lg transition-shadow border-red-200 dark:border-red-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Gestione Utenti
                </CardTitle>
                <Shield className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Admin: crea e gestisci utenti
                </p>
                <Link href="/users" passHref>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Gestione Utenti
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info ruolo */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Il tuo ruolo: {profile.role}
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            {isAdmin && (
              <>
                <li>• Accesso completo a tutte le funzionalità</li>
                <li>• Puoi creare e gestire utenti</li>
                <li>• Puoi modificare tutti i dati</li>
              </>
            )}
            {isOffice && (
              <>
                <li>• Puoi gestire clienti e interventi</li>
                <li>• Puoi creare nuovi interventi</li>
                <li>• Puoi visualizzare tutte le bolle</li>
              </>
            )}
            {isTechnician && (
              <>
                <li>• Puoi visualizzare gli interventi assegnati</li>
                <li>• Puoi compilare le bolle di lavoro</li>
                <li>• Accesso limitato ai tuoi interventi</li>
              </>
            )}
          </ul>
        </div>
      </main>
      <MadeWithDyad />
    </div>
  );
}