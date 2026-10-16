/** Données métier initiales issues du site public (à vérifier / éditer via l'administration). */
export const BUSINESS = {
  name: 'Golden Head Spa',
  founder: 'Inès',
  tagline: "L'art du Head Spa à Compiègne",
  address: '5 place de Choiseul, Résidence Les Lucarnes, cabinet 3.1, 60200 Compiègne',
  email: 'contact@goldenheadspa.com',
  website: 'https://goldenheadspa.com/',
  phone: '07 80 93 29 83',
  // Horaires confirmés par la gérante le 16/10/2026 (identiques en base : table business_hours).
  hours: [
    { days: 'Lundi', open: 'Fermé', close: '' },
    { days: 'Mardi – samedi', open: '10h30', close: '18h30' },
    { days: 'Dimanche', open: 'Fermé', close: '' },
  ],
  giftCardRules: 'Valable 1 an, du mardi au samedi aux horaires d\'ouverture (10h30–18h30). Non valable les jours fériés et sur les créneaux nocturnes, ni cumulable avec l\'option dernière minute.',
  giftCardValidityMonths: 12,
  rating: { score: 5.0, count: 432, source: 'Planity' }, // vu sur Planity le 15/10/2026
} as const;

/**
 * Parcours de réservation Planity officiel (URL publique fournie par le propriétaire le 15/10/2026).
 * Surchargeable via EXPO_PUBLIC_PLANITY_BOOKING_URL (ex. staging).
 */
export const PLANITY_BOOKING_URL: string | undefined =
  process.env.EXPO_PUBLIC_PLANITY_BOOKING_URL || 'https://www.planity.com/golden-hair-spa-60200-compiegne';
