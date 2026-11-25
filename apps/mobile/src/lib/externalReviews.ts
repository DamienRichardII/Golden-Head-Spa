import { GOOGLE_REVIEWS } from './googleReviews';
import { PLANITY_REVIEWS } from './planityReviews';

export type ReviewSource = 'google' | 'planity';

/** `author` est absent pour Planity (avis anonymes) ; `date` (JJ/MM/AAAA) n'est connue que pour Planity. */
export interface ExternalReview { source: ReviewSource; author?: string; date?: string; rating: number; text: string }

export const SOURCE_LABEL: Record<ReviewSource, string> = { google: 'Avis Google', planity: 'Avis Planity' };

/** Avis venus de Google puis de Planity, chacun avec sa source. */
export const EXTERNAL_REVIEWS: readonly ExternalReview[] = [
  ...GOOGLE_REVIEWS.map((r) => ({ ...r, source: 'google' as const })),
  ...PLANITY_REVIEWS.map((r) => ({ ...r, source: 'planity' as const })),
];

/** Nom d'icône d'étoile pour la position n (1 à 5) d'une note pouvant avoir des demi-étoiles. */
export function starName(n: number, value: number): 'star' | 'star-half' | 'star-outline' {
  const v = Math.round(value * 2) / 2;
  if (n <= v) return 'star';
  return n - 0.5 <= v ? 'star-half' : 'star-outline';
}

/** Sélection pour l'accueil : avis Google et Planity en alternance (les plus récents/premiers de chaque source). */
export function homeReviews(count = 4, all: readonly ExternalReview[] = EXTERNAL_REVIEWS): ExternalReview[] {
  const g = all.filter((r) => r.source === 'google');
  const p = all.filter((r) => r.source === 'planity');
  const out: ExternalReview[] = [];
  for (let i = 0; out.length < count && (i < g.length || i < p.length); i++) {
    const a = g[i]; const b = p[i];
    if (a && out.length < count) out.push(a);
    if (b && out.length < count) out.push(b);
  }
  return out;
}
