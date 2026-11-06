export interface FlashOffer {
  id: string; title: string; description: string; ritualId?: string;
  discountPercent: number; endsAt: number; code?: string; demo: boolean;
}

/** Données de DÉMONSTRATION uniquement (affichées avec la mention « Démo »). Les vraies offres viendront de Supabase `flash_offers`. */
export function demoOffers(now = Date.now()): FlashOffer[] {
  const h = 3_600_000;
  return [
    { id: 'demo-1', title: 'Offre flash — La Découverte', description: 'Exemple d\'offre éphémère réservée aux membres.', ritualId: 'decouverte', discountPercent: 15, endsAt: now + 5 * h, code: 'DEMO15', demo: true },
    { id: 'demo-2', title: 'Offre flash — Golden Hour', description: 'Exemple d\'offre éphémère réservée aux membres.', ritualId: 'golden-hour', discountPercent: 10, endsAt: now + 26 * h, demo: true },
  ];
}

export function formatRemaining(ms: number): string {
  if (ms <= 0) return 'Terminée';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return d > 0 ? `${d} j ${p(h)} h ${p(m)} min` : `${p(h)}:${p(m)}:${p(sec)}`;
}
