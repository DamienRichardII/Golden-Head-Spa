# Statut du projet — fin de Phase 2 + écrans de la Phase 3

## Vérifié réellement (16/10/2026)
- `pnpm lint` (expo lint, ESLint 9) : OK ; `expo export --platform web` : OK.
- `pnpm -r typecheck` : OK (5 workspaces, strict).
- Tests Vitest `@ghs/validation` : 3/3 OK.
- `expo export --platform android` : bundle Hermes généré sans erreur (5,3 Mo).
## Non vérifié
- Rendu visuel sur appareil/simulateur iOS et Android (aucun émulateur ici) → **fidélité à la maquette non validée visuellement**.
- Build iOS, EAS, tests E2E.
## Écrans livrés
Onboarding, accueil, rituels (filtres), fiche rituel, réservation (choix du soin + redirection Planity), carte cadeau (formulaire validé), boutique (état vide), compte (formulaire validé), menu, entreprises & CE (formulaire validé), à propos, contact.
## Simulé / bloqué (honnêtement)
| Fonction | État |
|---|---|
| Réservation native | Non faite : Planity sans API confirmée. Bouton actif vers l'URL Planity officielle (redirection non testée sur appareil) |
| Connexion / inscription | Formulaire + validation seulement ; Supabase non connecté |
| Paiement carte cadeau | Non branché (Stripe) ; aucune carte émise |
| Envoi demande entreprise | Validation seulement |
| Boutique | Vide, achats désactivés |
| Avis | 4 extraits anonymes du visuel client, à remplacer par avis vérifiés |
| Admin Next.js, notifications, RGPD (export/suppression), sentry | Non démarrés (phases 4–6) |
## Accès / éléments manquants (propriétaire)
1. ~~URL Planity~~ reçue (golden-hair-spa-60200-compiegne). Reste : confirmation d'une éventuelle API partenaire.
2. Accès/export du site (WooCommerce ? catalogue produits réel, textes, photos HD, logo vectoriel).
3. Projet Supabase (URL + clé anon) ; clé service_role côté serveur uniquement.
4. Comptes Stripe, Resend, Sentry, Vercel, Expo (EAS), Apple Developer, Google Play Console.
5. Bundle IDs définitifs (provisoire : `com.damcompany.goldenheadspa`), URL réseaux sociaux, CGV/politique de confidentialité, validité réelle des cartes cadeaux.
6. Validation des catégories de rituels et descriptions (hypothèses actuelles).
## Mise à jour 15/10 (captures du site/Planity)
Catalogue passé à 8 rituels avec descriptions réelles, catégories Head Spa / Massage / Enfant, téléphone, note 5,0 (432 avis), règles de cartes cadeaux. Écarts à trancher : voir AUDIT.md §7 (horaires, durée Kids).
## Hypothèses à confirmer
Samedi/dimanche : horaires non connus. `typescript` 5.9 installé (Expo recommande 6.0) — sans impact constaté.

## Audit du 16/10/2026 — état V1
- Le code source a été importé dans `main` (auparavant uniquement dans une archive `.tar.gz`, branche `develop`).
- Lint ajouté (règle `react/no-unescaped-entities` désactivée : texte français) et branché dans la CI ; imports inutilisés supprimés.
- **La V1 « vitrine + redirection Planity » est techniquement prête** (typecheck, tests, lint, export web OK). Les fonctions transactionnelles (compte, paiement, envoi des formulaires, boutique) restent bloquées par les accès listés ci-dessus et par les arbitrages métier de `AUDIT.md` §7.

## Réservation intégrée (16/10/2026) — sans Planity
- **Backend** : `supabase/migrations/20261016000000_booking.sql` — horaires (`business_hours`), fermetures (`closures`), réglages (`booking_settings`), `bookings` avec contrainte d'exclusion anti-double-réservation, fonctions `get_available_slots`, `create_booking`, `cancel_booking` (RLS : aucun accès direct public aux réservations).
- **App** : écran `booking.tsx` en 4 étapes (soin → jour → heure → coordonnées), confirmation avec référence, annulation en ligne jusqu'à 24 h avant. Paiement sur place.
- **Tests** : `pnpm test:sql` (Postgres embarqué PGlite : créneaux, chevauchement, concurrence, annulation, limites, RLS) + validation Zod. Vérifié OK.
- **Activation** : définir `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY` (local + Vercel), appliquer les migrations puis `seed.sql` sur un projet Supabase dédié. Sans ces variables, l'écran retombe sur le lien Planity.
- **À trancher** : horaires réels (samedi/dimanche fermés par défaut, mardi–vendredi 10h30–17h30 d'après Planity), pauses/déjeuner, durée Kids, délai d'annulation, **synchronisation avec Planity** (deux agendas = risque de double réservation tant que Planity reste actif).
- **Non fait** : emails de confirmation/rappel (Resend), vue administration des rendez-vous, comptes clients liés aux réservations, anti-spam avancé (captcha/rate-limit réseau).
