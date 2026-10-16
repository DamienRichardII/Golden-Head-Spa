# Audit — Golden Head Spa (15/10/2026)

## 1. Dossier de travail
Dossier connecté « Golden Head Spa » : uniquement `Base Assets/` (5 images : logo, maquette, visuel carte cadeau, 2 captures de fiches Planity/Instagram). Aucun code, aucun dépôt Git, aucun remote existant. Le dépôt `golden-head-spa` a été initialisé à neuf (branches `main`, `develop`).

## 2. Maquette (`docs/reference/maquette.jpg`)
8 écrans : onboarding photo, accueil, Nos rituels (filtres Tous / Head Spa / Soin capillaire / Enfant), réservation en 4 étapes (Soin, Date, Heure, Confirmation), carte cadeau, boutique, Mon compte, menu plein écran. Palette noir profond, ivoire, beige, doré champagne ; titres serif, interface sans-serif.
Écarts à noter : la maquette montre un calendrier et des créneaux réels (non réalisables sans Planity), des produits fictifs (Chantilly Capillaire, Huile Pousse Fortifiante…), et un compte « Léa Dupont » de démonstration. Rien de cela n'est repris comme donnée réelle.

## 3. Site goldenheadspa.com — LIMITE DE L'AUDIT
Le site n'a **pas pu être exploré** : l'outil de lecture web est refusé par le `robots.txt` du site, et je ne contourne pas ce blocage (pas de curl/scraping). Conséquences :
- Technologies, pages, WooCommerce (API REST), intégrations tierces : **non vérifiés**.
- Planity : un lien/une page Planity existe (mention « Réservez votre moment sur Planity » sur les visuels fournis). L'URL exacte n'a pas été fournie.
- Les 7 rituels, prix, horaires et adresse proviennent **du brief**, non revérifiés sur le site.
Action requise : audit manuel du site par le propriétaire/développeur, ou export des contenus (textes, photos, catalogue).

## 4. Informations confirmées par les visuels fournis
- « Le premier Head Spa de Compiègne, spécialisé en massages crâniens profonds ».
- « Plus de 400 avis 5★ » (revendication client à justifier).
- Carte cadeau « valable 12 mois » (visuel) ; prix affiché 80,00 € sur une fiche.
- Email contact@goldenheadspa.com ; adresse 5 place de Choiseul, Résidence Les Lucarnes, 60200 Compiègne.

## 5. Assets réutilisables
| Asset | Usage | Réserve |
|---|---|---|
| Photo arche dorée (capture WhatsApp 1) | Hero, onboarding, fiches | Capture d'écran avec bandeaux d'interface : fournir l'original HD ; droits d'usage à confirmer |
| logo.jpeg (texte doré sur noir) | Référence logo | Fournir un SVG/PNG détouré ; l'app utilise un logotype texte provisoire |
| Visuel carte cadeau | Référence uniquement | Non intégré (flyer de fêtes) |
| Polices | Cormorant Garamond + Inter (Google Fonts, OFL) | Polices exactes de la marque inconnues |

## 6. Intégrations
- **Planity** : aucune API officielle confirmée → fallback lien officiel. Pas de scraping, pas de disponibilités simulées.
- **WooCommerce** : existence non confirmée.
- **Stripe / Resend / Sentry / Supabase** : aucun compte ni identifiant fourni.
- **Règles stores** : cartes cadeaux/soins physiques = services/biens réels → paiement externe autorisé (Stripe), à revérifier avant soumission (règles Apple 3.1.3(e) / Google Play Payments).

## 7. Compléments — captures du site et de Planity (15/10/2026)
Source : captures fournies par le propriétaire (le site lui-même reste non exploré automatiquement).
- **Catalogue réel Planity** : 8 prestations, pas 7. Ajout de **L'Exception — 120 min — 200 €**. Sections Planity : Formules Head Spa, Soin du corps & massage (Golden Hour 90 €, Signature 100 €, Relax 140 €), Formation 2 jours (sur devis, par email), Option dernière minute 15 € (non réservable en ligne, par email), nocturnes sur devis.
- **Descriptions réelles** intégrées pour Découverte, Essentielle, Excellence, Kids. Incomplètes (tronquées) : L'Exception et les 3 massages.
- **Avis** : 5,0 / 5, 432 avis (Planity). Remplace la mention « +400 avis ».
- **Contact** : tél. 07 80 93 29 83 ; contact@goldenheadspa.com.
- **Cartes cadeaux** : valables 1 an, lundi–samedi 10h–18h ; non valables dimanches, jours fériés, nocturnes ; non cumulables avec l'option dernière minute.
- **Réservation Planity** : « 24h/24 – Paiement sur place – Confirmation immédiate ». L'URL exacte n'apparaît pas sur les captures.
### Écarts à trancher avec le client
1. **Horaires** : Planity montre Lundi fermé, mardi–vendredi 10h30–17h30 ; le brief annonçait lundi–samedi 10h30–18h30 et dimanche 10h30–15h30. L'app affiche pour l'instant ceux de Planity (samedi/dimanche non visibles).
2. **Cartes cadeaux** « lundi–samedi » alors que le lundi est fermé.
3. **Head Spa Kids** : 45 min (site), « 40 mins » (titre Planity), 55 min (durée affichée).
4. **Nom/adresse Planity** : « GOLDEN HAIR SPA », « La maison médicale, … 1er étage » — à harmoniser avec Golden Head Spa.
5. Photos : les photos du cabinet et le visuel enfant sont des captures ; vérifier les droits (le visuel enfant est une personne identifiable) avant intégration.
