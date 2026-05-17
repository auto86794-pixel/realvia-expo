import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  'https://wbnqrwvvfygdzvxctlco.supabase.co';

const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndibnFyd3Z2ZnlnZHp2eGN0bGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjYzMjYsImV4cCI6MjA5Mzc0MjMyNn0.G3Zzj_FsSFK1lWxpX8v1qkncLx-UMZCxoAn8ThP80qE';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);