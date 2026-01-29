"use client";

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/context/profile-context';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User, Mail, Shield, Save, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { profile, isLoading: isLoadingProfile, refreshProfile } = useProfile();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Verifica autenticazione
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      setEmail(session.user.email || '');
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non autenticato');

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Profilo aggiornato con successo");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Errore nell'aggiornamento del profilo");
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'amministratore':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'ufficio':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'tecnico':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'amministratore':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'ufficio':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'tecnico':
        return <Shield className="h-4 w-4 text-green-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Il Mio Profilo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestisci le tue informazioni personali
          </p>
        </div>

        {/* Info profilo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informazioni Personali
            </CardTitle>
            <CardDescription>
              Modifica i tuoi dati personali. L'email e il ruolo non possono essere modificati.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Avatar e ruolo */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {firstName?.[0]}{lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  {firstName} {lastName}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge className={`${getRoleBadgeClass(profile?.role || '')} capitalize`}>
                    <span className="flex items-center gap-1">
                      {getRoleIcon(profile?.role || '')}
                      {profile?.role}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="pl-10 bg-gray-100 dark:bg-gray-800"
                  />
                </div>
                <p className="text-xs text-gray-500">L'email non può essere modificata</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Ruolo</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="role"
                    value={profile?.role || ''}
                    disabled
                    className="pl-10 bg-gray-100 dark:bg-gray-800 capitalize"
                  />
                </div>
                <p className="text-xs text-gray-500">Il ruolo può essere modificato solo dall'amministratore</p>
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
                <Label htmlFor="avatarUrl">URL Avatar (opzionale)</Label>
                <Input
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-xs text-gray-500">
                  Inserisci l'URL di un'immagine per il tuo avatar
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salva Modifiche
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info sicurezza */}
        <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-800 dark:text-yellow-200">
              Sicurezza Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p>• Per modificare la password, utilizza la funzione "Password dimenticata" dalla pagina di login</p>
            <p>• Per modificare il tuo ruolo, contatta l'amministratore del sistema</p>
            <p>• L'email è associata al tuo account e non può essere modificata</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}