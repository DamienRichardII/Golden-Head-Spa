export type RitualCategory = 'head-spa' | 'massage' | 'enfant';

export interface Ritual {
  id: string;
  name: string;
  durationMin: number;
  priceEur: number;
  category: RitualCategory;
  tagline: string;
  /** Description à valider par le client : vide tant que non fournie. */
  description?: string;
  imageKey?: 'hero' | 'arch' | 'cabinet';
}

export interface BookingProvider {
  readonly kind: 'planity-link' | 'native';
  /** Retourne l'URL du parcours officiel, ou undefined si non configuré. */
  getBookingUrl(ritualId?: string): string | undefined;
}

export type GiftCardStatus = 'pending_payment' | 'active' | 'redeemed' | 'expired' | 'cancelled';
