# Statut du projet — fin de Phase 2 + écrans de la Phase 3

## Vérifié réellement
- `pnpm -r typecheck` : OK (5 workspaces, strict).
- Tests Vitest `@ghs/validation` : 3/3 OK.
- `expo export --platform android` : bundle Hermes généré sans erreur (5,3 Mo).
## Non vérifié
- Rendu visuel sur appareil/simulateur iOS et Android (aucun émulateur ici) → **fidélité à la maquette non validée visuellement**.
- Build iOS, EAS, tests E2E, lint.
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
