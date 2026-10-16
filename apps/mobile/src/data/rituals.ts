import type { Ritual } from '@ghs/types';

/**
 * Catalogue issu du site public et de Planity (captures fournies le 15/10/2026). Éditable via Supabase `services`.
 * Écarts à trancher : Kids = 45 min (site) vs 40 min (titre Planity) vs 55 min (durée affichée) ; descriptions des 3 massages et de L'Exception incomplètes (tronquées sur Planity).
 */
export const RITUALS: Ritual[] = [
  { id: 'decouverte', name: 'La Découverte', durationMin: 50, priceEur: 80, category: 'head-spa', tagline: "Un rituel d'initiation au luxe",
    description: "Sous l'arche d'eau soyeuse, la vapeur chaude et la luminothérapie dorée, votre esprit s'ouvre à la détente. Le cuir chevelu se purifie, la peau s'illumine, et le massage visage & crâne, précis et délicat, relâche tout ce qui pèse. Un rituel d'initiation au luxe : court, pur, intensément apaisant." },
  { id: 'essentielle', name: "L'Essentielle", durationMin: 70, priceEur: 110, category: 'head-spa', tagline: 'Soin complet et profond',
    description: "Un rituel de beauté absolue, baigné par l'arche d'eau, la vapeur profonde et la luminothérapie apaisante.\nLe soin visage révèle l'éclat, le cuir chevelu se renouvelle, la kératine magnifie la fibre.\nPuis le massage se fait signature : crâne, visage, nuque, épaules, bras, et jusqu'au bout des doigts, avec une précision presque chorégraphique.\nUn équilibre rare entre soin expert et détente luxueuse." },
  { id: 'excellence', name: "L'Excellence", durationMin: 90, priceEur: 150, category: 'head-spa', tagline: "L'expérience ultime",
    description: "Le rituel emblématique. Le préféré. La référence du spa.\nUne immersion totale guidée par l'arche d'eau, la chaleur enveloppante et une luminothérapie profondément harmonisante.\nSoin visage haute performance, gommage du cuir chevelu, kératine profonde… puis un massage intégral, majestueux : crâne, visage, nuque, épaules, bras, mains, jambes, pieds.\nChaque geste est lent, précis, souverain.\nL'expérience ultime : un luxe sensoriel qui suspend le temps." },
  { id: 'exception', name: "L'Exception", durationMin: 120, priceEur: 200, category: 'head-spa', tagline: 'Quand le bien-être devient une expérience rare',
    description: 'Un voyage sensoriel de 2 heures, hors du temps. Massage de dos et de face…' }, // description Planity tronquée : à compléter
  { id: 'kids', name: 'Head Spa Kids', durationMin: 45, priceEur: 60, category: 'enfant', tagline: 'Une bulle de réconfort',
    description: "Dans une ambiance douce et rassurante, sous la vapeur légère et une luminothérapie tendre, les enfants découvrent leur premier moment de détente.\nMassage du cuir chevelu, soin adapté et relaxation cocooning.\nUn instant délicat, pensé comme une bulle de réconfort." },
  { id: 'golden-hour', name: 'Golden Hour', durationMin: 60, priceEur: 90, category: 'massage', tagline: 'Massage relaxant aux huiles chaudes' },
  { id: 'signature', name: 'Golden Signature', durationMin: 60, priceEur: 100, category: 'massage', tagline: 'Massage huiles chaudes & pierres chaudes' },
  { id: 'relax', name: 'Golden Relax', durationMin: 90, priceEur: 140, category: 'massage', tagline: 'Massage huiles chaudes & pierres chaudes' },
];

export const CATEGORIES = [
  { key: 'all', label: 'Tous' },
  { key: 'head-spa', label: 'Head Spa' },
  { key: 'massage', label: 'Massage' },
  { key: 'enfant', label: 'Enfant' },
] as const;

export const formatDuration = (min: number) =>
  min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? String(min % 60).padStart(2, '0') : ''}` : `${min} min`;
export const formatPrice = (eur: number) => `${eur} €`;
export const getRitual = (id: string) => RITUALS.find((r) => r.id === id);
