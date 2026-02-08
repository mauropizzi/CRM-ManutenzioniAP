# Setup Punti Servizio Database

Per risolvere l'errore "Could not find the table 'public.service_points'", segui questi passaggi:

## Opzione 1: Esegui SQL manualmente in Supabase Dashboard

1. Vai al tuo progetto Supabase Dashboard
2. Naviga su "SQL Editor"
3. Copia e incolla il contenuto del file `supabase/create_service_points.sql`
4. Clicca "Run" per eseguire lo script

## Opzione 2: Usa lo script automatizzato

1. Assicurati di avere le credenziali Supabase in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
2. Esegui:
   ```bash
   npm run setup:service-points
   ```

## Verifica

Dopo aver eseguito lo script, dovresti vedere le tabelle:
- `service_points`
- `service_point_systems`

Nell'applicazione, gli errori dovrebbero sparire e potrai iniziare a gestire i punti servizio!

## Contenuto tabelle

### service_points
- id (UUID)
- name (TEXT) - Nome punto servizio
- address (TEXT) - Indirizzo
- city (TEXT) - Città
- cap (TEXT) - CAP
- provincia (TEXT) - Provincia
- telefono (TEXT) - Telefono
- email (TEXT) - Email
- note (TEXT) - Note
- customer_id (UUID) - Riferimento al cliente
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- created_by (TEXT) - ID utente creatore

### service_point_systems
- id (UUID)
- service_point_id (UUID) - Riferimento al punto servizio
- system_type (TEXT) - Tipo impianto
- brand (TEXT) - Marca impianto
- created_at (TIMESTAMP)