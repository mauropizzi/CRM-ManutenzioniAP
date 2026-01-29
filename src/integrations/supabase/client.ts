import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nrdsgtuzpnamcovuzghb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZHNndHV6cG5hbWNvdnV6Z2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Nzk5MjMsImV4cCI6MjA4NTI1NTkyM30.T3RWTgARzk8um7EeLmWe5oNY2wLt4nWGOg9yxTWg0hM";

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);