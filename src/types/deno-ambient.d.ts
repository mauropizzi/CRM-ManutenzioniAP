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