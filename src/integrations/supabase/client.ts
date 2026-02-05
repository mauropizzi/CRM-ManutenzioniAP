import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://nrdsgtuzpnamcovuzghb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZHNndHV6cG5hbWNvdnV6Z2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Nzk5MjMsImV4cCI6MjA4NTI1NTkyM30.T3RWTgARzk8um7EeLmWe5oNY2wLt4nWGOg9yxTWg0hM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});