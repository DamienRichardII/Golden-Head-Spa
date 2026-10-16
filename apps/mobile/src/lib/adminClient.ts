import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Client authentifié pour l'administration (session persistée dans le navigateur ; en mémoire sur mobile natif).
 * Les droits réels sont imposés par la RLS : sans rôle `admin`, aucune donnée n'est accessible.
 */
export const adminClient: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } }) : null;
