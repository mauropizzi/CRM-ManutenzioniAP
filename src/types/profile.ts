export type UserRole = 'amministratore' | 'ufficio' | 'tecnico';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  updated_at: string;
}

export interface UserWithProfile {
  id: string;
  email: string;
  profile: Profile;
}