"use client";

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/context/profile-context';
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserRole } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { UserPlus, Users, Shield, Building2, Wrench } from 'lucide-react';

interface UserWithEmail extends Profile {
  email?: string;
}

export default function UsersPage() {
  const { canManageUsers, isAdmin, profile: currentProfile } = useProfile();
  const router = useRouter();
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('tecnico');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!canManageUsers) {
      router.push('/');
      return;
    }
    fetchUsers();
  }, [canManageUsers, router]);

  const fetchUsers = async () => {
    try {
      // Ottieni tutti i profili
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Per ogni profilo, ottieni l'email dall'auth
      const usersWithEmail = await Promise.all(
        (profiles || []).map(async (p) => {
          // Nota: in produzione useresti una edge function o una vista
          // Qui mostriamo solo i dati disponibili
          return {
            ...p,
            email: 'N/A', // L'email non è accessibile direttamente da RLS
          } as UserWithEmail;
        })
      );

      setUsers(usersWithEmail);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Errore nel caricamento utenti");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // 1. Crea l'utente in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // 2. Aggiorna il ruolo nel profilo (creato automaticamente dal trigger)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      toast.success("Utente creato con successo");
      
      // Reset form
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setRole('tecnico');
      
      // Refresh lista
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || "Errore nella creazione dell'utente");
    } finally {
      setIsCreating(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'amministratore':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'ufficio':
        return <Building2 className="h-4 w-4 text-blue-500" />;
      case 'tecnico':
        return <Wrench className="h-4 w-4 text-green-500" />;
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'amministratore':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'ufficio':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'tecnico':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  if (!canManageUsers) {
    return null; // Redirect in corso
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Gestione Utenti
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Crea e gestisci utenti con diversi livelli di accesso
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="h-5 w-5" />
            <span>{users.length} utenti registrati</span>
          </div>
        </div>

        {/* Form creazione utente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Crea Nuovo Utente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="utente@azienda.it"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimo 6 caratteri"
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Mario"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Cognome</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Rossi"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="role">Ruolo *</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona ruolo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amministratore">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-red-500" />
                          Amministratore - Accesso completo
                        </div>
                      </SelectItem>
                      <SelectItem value="ufficio">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-500" />
                          Ufficio - Gestione clienti e interventi
                        </div>
                      </SelectItem>
                      <SelectItem value="tecnico">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-green-500" />
                          Tecnico - Solo visualizzazione e bolla
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isCreating ? 'Creazione...' : 'Crea Utente'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tabella utenti */}
        <Card>
          <CardHeader>
            <CardTitle>Utenti Registrati</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-4">Caricamento...</p>
            ) : users.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                Nessun utente trovato
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cognome</TableHead>
                      <TableHead>Ruolo</TableHead>
                      <TableHead>Ultimo aggiornamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.first_name || '-'}</TableCell>
                        <TableCell>{user.last_name || '-'}</TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                            {getRoleIcon(user.role)}
                            <span className="capitalize">{user.role}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(user.updated_at).toLocaleDateString('it-IT')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info ruoli */}
        <Card className="bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-sm">Permessi per Ruolo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-red-500 mt-0.5" />
              <div>
                <span className="font-medium">Amministratore:</span> Accesso completo, gestione utenti, tutte le funzionalità
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <span className="font-medium">Ufficio:</span> Gestione clienti, creazione interventi, visualizzazione bolle
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Wrench className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <span className="font-medium">Tecnico:</span> Visualizzazione interventi assegnati, compilazione bolle di lavoro
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}