import { adminClient } from '../lib/adminClient';
import type { HistoryRow } from '../lib/loyalty';

/** Historique des rendez-vous confirmés (toute la base, lecture admin via RLS) pour calculer la fidélité. Vide si indisponible. */
export async function fetchLoyaltyHistory(): Promise<HistoryRow[]> {
  if (!adminClient) return [];
  const { data, error } = await adminClient.from('bookings').select('starts_at,customer_email,customer_phone')
    .eq('status', 'confirmed').order('starts_at').limit(5000);
  if (error) return [];
  return (data ?? []) as HistoryRow[];
}
