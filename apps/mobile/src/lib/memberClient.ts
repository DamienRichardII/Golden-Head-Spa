import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Client « espace élève » : session propre (clé de stockage distincte de celle de l'administration).
 * Connexion par code reçu par e-mail ; les droits réels (Académie) sont imposés par la RLS, jamais par l'application.
 */
export const memberClient: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'ghs-member-auth' } }) : null;
