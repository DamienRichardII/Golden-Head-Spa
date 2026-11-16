/**
 * Programme Fidélité Golden Head Spa.
 * Paliers (à confirmer auprès d'Inès) : 3e rendez-vous −10 %, 4e −15 %, 5e et suivants −20 %.
 * Pour changer les paliers, il suffit de modifier ce tableau : tout le reste s'adapte.
 * La remise est appliquée par l'institut au moment du paiement (aucun paiement en ligne).
 */
export interface LoyaltyTier { visit: number; percent: number }
export const LOYALTY_TIERS: readonly LoyaltyTier[] = [
  { visit: 3, percent: 10 },
  { visit: 4, percent: 15 },
  { visit: 5, percent: 20 },
];

/** Remise (en %) pour le rendez-vous numéro `visit` (1 = premier). 0 avant le premier palier ; le dernier palier s'applique ensuite. */
export function discountForVisit(visit: number): number {
  let percent = 0;
  for (const t of LOYALTY_TIERS) if (visit >= t.visit) percent = t.percent;
  return percent;
}

export interface HistoryRow { starts_at: string; customer_email: string | null; customer_phone: string }

/** Clé téléphone : 9 derniers chiffres (06…, +33 6…, 0033 6… donnent la même clé). Vide si moins de 9 chiffres. */
export function phoneKey(phone: string): string {
  const d = phone.replace(/\D/g, '');
  return d.length >= 9 ? d.slice(-9) : '';
}

function sameClient(a: HistoryRow, b: HistoryRow): boolean {
  const pa = phoneKey(a.customer_phone);
  if (pa && pa === phoneKey(b.customer_phone)) return true;
  const ea = a.customer_email?.trim().toLowerCase();
  return Boolean(ea) && ea === b.customer_email?.trim().toLowerCase();
}

export interface LoyaltyInfo { visit: number; percent: number }

/**
 * Numéro du rendez-vous dans l'historique de la cliente (rendez-vous confirmés antérieurs + 1) et remise associée.
 * `history` ne doit contenir que des rendez-vous confirmés : une annulation ne compte jamais.
 */
export function loyaltyFor(appt: HistoryRow, history: readonly HistoryRow[]): LoyaltyInfo {
  const t = new Date(appt.starts_at).getTime();
  const before = history.filter((h) => new Date(h.starts_at).getTime() < t && sameClient(h, appt)).length;
  const visit = before + 1;
  return { visit, percent: discountForVisit(visit) };
}

/** Texte court pour l'administration, ou undefined s'il n'y a rien à signaler. */
export function loyaltyLabel(info: LoyaltyInfo): string | undefined {
  return info.percent > 0 ? `Fidélité : rendez-vous n°${info.visit} → −${info.percent} %` : undefined;
}

/** Texte public (carte « Programme Fidélité »). */
export const LOYALTY_PUBLIC_LINES: readonly string[] = LOYALTY_TIERS.map(
  (t, i, a) => `${t.visit}${t.visit === 1 ? 'er' : 'e'} rendez-vous${i === a.length - 1 ? ' et suivants' : ''} : −${t.percent} %`,
);
