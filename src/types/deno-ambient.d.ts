declare module "https://deno.land/std@0.190.0/http/server.ts" {
  export function serve(handler: (req: Request) => Promise<Response> | Response): void;
}

declare module "https://deno.land/x/postgres@v12.0.0/mod.ts" {
  export class Client {
    constructor(connStr: string);
    connect(): Promise<void>;
    end(): Promise<void>;
    queryObject(sql: string): Promise<{ rows: unknown[] }>;
  }
}

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
};

// FIX: Ambient module for esm.sh supabase-js
declare module "https://esm.sh/@supabase/supabase-js@2.45.0" {
  export type SupabaseClient = unknown;
  export function createClient(url: string, key: string, options?: unknown): SupabaseClient;
}