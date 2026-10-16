import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** Clé anon publique par conception ; la sécurité repose sur la RLS et les fonctions SQL. */
export const isBackendConfigured = Boolean(url && anonKey);
export const supabase: SupabaseClient | null = isBackendConfigured
  ? createClient(url as string, anonKey as string, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;
