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
- **Activation** : projet Supabase `Golden Head Spa` (réf. `vkrpvnwaiybnvonnjzhw`, eu-west-3, 10 $/mois) créé le 16/10/2026 ; migrations + seed appliqués ; variables `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` définies sur Vercel (clé anon publique par conception). Sans ces variables, l'écran retombe sur le lien Planity.
- **À trancher** : horaires réels (mardi–samedi 10h30–18h30 confirmé le 16/10/2026), pauses/déjeuner, durée Kids, délai d'annulation, **synchronisation avec Planity** (deux agendas = risque de double réservation tant que Planity reste actif).
- **Non fait** : emails de confirmation/rappel (Resend), vue administration des rendez-vous, comptes clients liés aux réservations, anti-spam avancé (captcha/rate-limit réseau).

## Administration (16/10/2026)
- Page `/admin` (web + app) : connexion Supabase Auth, accès limité au rôle `admin` (RLS côté base). Onglets : **Rendez-vous** (liste à venir, annulation avec confirmation, afficher les annulés), **Horaires** (ouvert/fermé + heures par jour), **Fermetures** (ajout/suppression de jours fermés).
- Droits : créer le compte dans Supabase (Authentication > Users) puis exécuter `supabase/grant_admin.sql` avec l'email. Politiques RLS admin vérifiées par `pnpm test:sql` (28 contrôles).
- Limites : pas d'email au client lors d'une annulation par la gérante ; session admin non persistée sur mobile natif (reconnexion à chaque lancement) ; dates des fermetures saisies au format AAAA-MM-JJ.

## Demandes d'Inès (05/11/2026) — entrée immersive, musique, offres flash, chat IA
**Vérifié** : lint, typecheck, tests Vitest (validation 7, chat 7), `pnpm test:sql` (RLS offres flash incluse) OK ; rendu web testé (entrée, offres membre démo, chat en repli).
- **Entrée immersive** : même écran qu'avant (photo, logo), mais affiché à chaque ouverture, avec lente respiration de la photo et textes en fondu ; respecte « réduire les animations ». Pour ne l'afficher qu'à la première ouverture, rétablir le drapeau `ghs_onboarded` dans `app/index.tsx`.
- **Musique** : lecteur prêt (expo-audio, fondu, boucle, bouton couper/relancer mémorisé), lancé au toucher sur « Commencer ». **Aucun fichier fourni** : rien ne joue, bouton masqué. Activation : déposer un MP3 libre de droits dans `assets/audio/ambient.mp3`, puis suivre `src/data/audio.ts`.
- **Offres flash** : table `flash_offers` + RLS (migration `20261105000000_flash_offers.sql`, **à appliquer sur Supabase après validation**) ; création/arrêt dans `/admin` > onglet « Offres flash » ; écran `/offers` avec compte à rebours. **Limite** : l'espace client (connexion/inscription) n'est pas encore branché sur Supabase Auth ; l'écran membre n'affiche donc que des offres **démo**, accessibles seulement avec `EXPO_PUBLIC_DEMO_MODE=1` (entrées masquées sinon). Reste à faire : connexion client réelle, lecture des offres depuis `flash_offers`, règle d'application de la remise (code, validation en caisse).
- **Chat IA** : écran `/assistant` + Vercel Function `api/chat.ts` (appel API Anthropic, clé côté serveur uniquement). Le prompt ne contient que les infos réelles (rituels, prix, horaires, règles cartes cadeaux), renvoie vers l'onglet Réservation, ne confirme aucun créneau, pas de conseil médical. Limite 20 requêtes / 10 min / IP (mémoire, par instance). Sans `ANTHROPIC_API_KEY` : message de repli + boutons écrire/appeler. **Non testé avec la vraie API.** `vercel.json` : le rewrite SPA exclut désormais `/api/`.
- **À décider** : conservation/RGPD des conversations (rien n'est stocké), mention « assistant IA » (affichée), modèle (`ANTHROPIC_MODEL`, défaut claude-haiku-4-5).

## Vidéo d'ouverture (06/11/2026)

- Écran d'entrée : vidéo muette de 8 s (eau qui coule, vapeur, logo) jouée une seule fois, maintien sur la dernière image. Le bouton « Commencer » est disponible immédiatement.
- Fallback : mouvement réduit, erreur de lecture ou vidéo indisponible → image finale fixe, navigation inchangée.
- Production : **composition locale** (fondus FFmpeg entre les 8 frames fournies B1→B8), pas un moteur image-vers-vidéo. Script reproductible : `tools/opening/build_opening.py <dossier_frames> <sortie>`.
- Assets : `apps/mobile/assets/video/opening.mp4` (H.264, yuv420p, faststart, 1024×1536, 30 fps), `assets/images/opening-first.jpg` (poster de départ), `assets/images/opening-poster.jpg` (poster final).
- Limite connue : en cadrage plein écran (cover) sur un téléphone très allongé, les bords du logo peuvent être très légèrement rognés. À valider sur appareil réel.
- Les maquettes A1–A7 fournies servent de direction artistique ; aucune n'est intégrée comme image interactive.

## Refonte visuelle d'après les maquettes (06/11/2026)

- Thème sombre et doré appliqué à toute l'app via les tokens partagés (`packages/ui/src/tokens.ts`) : noms historiques conservés (`brown` = texte crème, `ivory` = fond), ajout de `surface` et `onGold`.
- Composants communs refaits (`ui.tsx`) : fond à halo doré, `ScreenHeader`, `Chip`, `SectionTitle`, cartes « verre », bouton or lumineux, champs sombres.
- Navigation : onglets Accueil, Rituels, Réservation, Profil (comme la maquette). La liste des rituels devient l'onglet `/(tabs)/rituals` (ancien `app/rituals/index.tsx` supprimé) ; la boutique reste accessible depuis l'accueil et le menu (onglet masqué).
- Écrans refaits : accueil (hero, carrousel de rituels, bouton Assistant), rituels, détail, réservation (étapes 1-2-3, calendrier mensuel avec jours fermés grisés, créneaux en grille, récapitulatif), offres flash (cartes photo, état verrouillé), assistant (bulles, puces Horaires/Tarifs/…), profil (avatar, lignes fonctionnelles et verrouillées, interrupteur d'ambiance sonore si une musique existe).
- Aucune donnée, règle de réservation, requête ni route API n'a changé. Les maquettes (images générées) restent une direction artistique : les photos de l'app sont toujours celles du client.
- Limites : une seule photo client est disponible (`hero.jpg`), réutilisée sur les cartes de rituels ; les offres flash restent démo/masquées hors `EXPO_PUBLIC_DEMO_MODE=1` ; « Créer mon compte » n'est pas proposé tant que l'authentification client n'existe pas.
