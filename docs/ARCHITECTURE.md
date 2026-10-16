# Architecture

## Monorepo (pnpm + Turborepo, TypeScript strict)
```
apps/mobile      Expo SDK 57 / React Native 0.86 / Expo Router (iOS + Android natifs)
apps/admin       Next.js (App Router) — PHASE 5, non démarré
packages/config  Constantes métier (adresse, horaires, URL Planity via env)
packages/types   Types partagés (Ritual, BookingProvider, GiftCardStatus)
packages/validation  Schémas Zod partagés mobile/serveur (+ tests Vitest)
packages/ui      Design tokens (couleurs, polices, rayons, ombres)
packages/api-client  Réservé (phase 4)
supabase/        migrations + seed
```

## Mobile
Expo Router : `index` (onboarding, mémorisé via SecureStore), `(tabs)` Accueil / Réservation / Boutique / Profil, écrans `rituals`, `rituals/[id]`, `gift-card`, `corporate`, `about`, `contact`, modal `menu`.
Animations Reanimated avec `ReduceMotion.System` ; retour haptique sur les boutons ; états vides ; accessibilité (rôles, labels).
Non installés volontairement (aucune valeur à ce stade) : Skia, Zustand utilisé nulle part encore (installé pour la phase 4), Expo Notifications.

## Réservation — sources de vérité
| Donnée | Maître |
|---|---|
| Rendez-vous / disponibilités | **Planity** (lien officiel) tant qu'aucune intégration autorisée |
| Catalogue des soins | Supabase `services` (seed initial) |
| Cartes cadeaux | Supabase + Stripe (serveur), à valider vs WooCommerce existant |
| Boutique | Aucun (catalogue réel non fourni) |
Interface `BookingProvider` (`@ghs/types`) prévue : `planity-link` aujourd'hui, `native` si migration approuvée.

## Backend (migration `20261015000000_init_core.sql`)
Tables : profiles, user_roles, service_categories, services, gift_cards, corporate_leads, audit_logs. UUID, FK, index, contraintes CHECK, RLS activée partout (refus par défaut), rôle admin via `has_role()`. Cartes cadeaux et leads : écriture uniquement via service_role côté serveur. Clé `service_role` jamais côté mobile. Non appliquée à un projet Supabase réel (aucun accès).

## Sécurité (état)
Validation Zod partagée ; secrets uniquement en `.env` (ignoré) ; `.env.example` sans valeur. MFA admin, rate limiting, webhooks Stripe, journal d'audit : phases 4–5.
