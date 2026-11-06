# Golden Head Spa — Prompts GPT Image (maquettes + frames d'animation)

Mode d'emploi
- Joindre à CHAQUE génération : le logo officiel + la maquette d'origine (images de référence).
- Coller d'abord le BLOC STYLE, puis le prompt de l'écran/de la frame.
- Prompts en anglais (meilleur rendu). Les textes à afficher sont donnés entre guillemets, en français, à copier tels quels.
- Format écrans : portrait 1024x1536. Frames d'animation : portrait 1024x1536 aussi (même cadrage pour toutes).
- Générer les écrans un par un, puis demander des retouches ciblées plutôt que tout régénérer.

---

## BLOC STYLE (à coller avant chaque prompt)

```
Premium mobile app UI mockup for "Golden Head Spa", a luxury Japanese-style head spa in Compiègne, France. Use the attached logo EXACTLY as provided (do not redraw, restyle or retype it) and follow the attached mockup for brand colors and general feel. Total immersion and calm: dark, warm, cinematic atmosphere, soft golden light, steam, water, warm shadows, generous negative space, large full-bleed photography with a dark gradient overlay for legibility. Elegant serif display titles with a refined sans-serif for body text. Thin gold accents, rounded cards with subtle glass blur, soft glow on the primary button. Feels like a high-end wellness app (hotel spa quality), never like a template. Flat front-on phone screen render, no device frame, no hands, no people's faces. All on-screen text in French, crisp and perfectly spelled, only the exact strings I give. Aspect ratio 2:3 portrait.
```

---

## A. MAQUETTES DES ÉCRANS

### A1 — Entrée immersive (splash + accueil sensoriel)
```
Full-bleed cinematic photo of a head spa treatment station in a dim, warm room: a ceramic basin with water streaming gently, rising steam, warm golden backlight, candles out of focus. The Golden Head Spa logo is large and dominant in the upper third, softly glowing, centered. Below the center, an elegant title "Une parenthèse hors du temps" and a subtitle "Head spa à Compiègne". At the bottom, a rounded gold button "Commencer" and a tiny discreet music icon with the caption "Ambiance sonore". Nothing else on screen.
```

### A2 — Accueil
```
Home screen. Top bar: small logo left, a round music toggle icon, an "Assistant" sparkle icon and a menu icon on the right. Hero card with a large atmospheric photo, title "Bienvenue chez Golden Head Spa", gold button "Réserver mon rituel". Below, a horizontal carousel of ritual cards with photo, name, duration and price. A glowing banner "Offres flash · réservées aux membres de l'app" with a small lock icon. Bottom tab bar with 4 elegant line icons: Accueil, Rituels, Réservation, Profil.
```

### A3 — Rituels (liste + détail)
```
Rituals screen: vertical list of large cards, each with a moody photo on the left, ritual name in serif, short description (two lines), duration and price in gold, and a small chevron. Use only these real rituals and prices: "L'Excellence" 1h30 150 €. Add the other rituals as placeholders named "Rituel 2" and "Rituel 3" with plausible layout (I will replace the data). Sticky gold button at the bottom "Réserver ce rituel".
```

### A4 — Réservation
```
Booking screen in 3 clear steps with a thin gold progress bar: 1 Rituel, 2 Date et heure, 3 Confirmation. Show step 2: a month calendar where closed days (Monday and Sunday) are greyed out, open days Tuesday to Saturday are tappable, selected day highlighted in gold; below, a grid of time-slot chips between 10h30 and 18h30. Summary card at the bottom with the ritual name and a gold button "Confirmer". Small reassuring note "Paiement sur place".
```

### A5 — Offres flash (réservées aux membres)
```
Flash offers screen, member view. Title "Offres flash" and subtitle "Réservé aux membres". Two large offer cards with moody photos, a gold "-20 %" style badge, an elegant live countdown "Plus que 02:14:36", and a "Réserver" button. A small badge "Exclusif app". Version B of the same screen (generate as a second image): locked state for non-members, blurred cards behind a glass panel with a lock icon, text "Réservé aux membres" and a button "Créer mon compte".
```

### A6 — Assistant IA (chat)
```
Chat screen of an AI assistant. Header "Assistant Golden Head Spa" with a small sparkle icon and the discreet disclosure "Assistant IA · ne confirme aucun créneau". Conversation bubbles: user bubbles in gold, assistant bubbles in dark glass. Example exchange: user "Quelle est la différence entre vos rituels ?", assistant answers in two short friendly sentences. Row of suggestion chips above the input: "Horaires", "Tarifs", "Cartes cadeaux". Input bar with a send button. Footer link "Écrire à l'équipe".
```

### A7 — Profil / espace membre
```
Profile screen. Elegant circular avatar placeholder, name placeholder, a gold "Membre" badge. Cards: "Mes réservations", "Mes offres flash", "Cartes cadeaux", "Ambiance sonore" with a toggle, "Contact" with the address "5 place de Choiseul, Compiègne". Calm layout with lots of space.
```

---

## B. ANIMATION D'OUVERTURE — 8 frames clés

Principe : générer la frame 1 (B1), puis pour chaque frame suivante demander à GPT Image de MODIFIER l'image précédente (même caméra, même décor) en ne changeant que ce qui est indiqué. Cela garde la cohérence entre les frames.

Prompt commun à coller avant B1 (une seule fois), puis à rappeler à chaque frame :
```
Cinematic vertical scene, fixed camera, locked-off frame, same composition in every frame. A head spa station in a dark warm room: a sculpted ceramic basin on a stone pedestal centered in the lower half, a copper shower head above it on a slim arm, warm golden rim light from behind, dark background with soft bokeh, no people. Leave the top third of the frame empty and dark with soft haze: that area is reserved for the logo. Photorealistic, shallow depth of field, ultra clean, no text, no watermark. Aspect 2:3 portrait.
```

B1 — Calme : `Basin dry and still, shower head dry, no steam, very dim light, only a faint golden glow behind. Top third empty and dark.`

B2 — Première goutte : `Same scene. A single water droplet hangs at the tip of the shower head, catching a golden highlight. Light slightly brighter.`

B3 — L'eau commence : `Same scene. A thin, delicate stream of water starts to flow from the shower head into the basin, tiny ripples on the water surface, glints of gold on the water.`

B4 — Premières volutes : `Same scene. The water flows steadily; the first thin wisps of steam begin to rise from the basin, translucent and barely visible, lit from behind by golden light.`

B5 — La vapeur monte : `Same scene. Soft, graceful steam rises higher in slow curls, backlit golden, filling the lower two thirds of the frame. Water flow fuller, warm glow stronger.`

B6 — Brume dense : `Same scene. Rich warm steam rises toward the empty top third and forms a luminous golden haze there. Water flows generously. Do not add any text yet.`

B7 — Le logo apparaît : `Same scene. Inside the golden haze in the top third, the attached Golden Head Spa logo emerges, large and dominant, semi-transparent, as if formed by the steam and light. Keep the logo exactly as provided. Steam continues to rise beneath it.`

B8 — Image finale : `Same scene. The attached Golden Head Spa logo is now fully sharp, bright and dominant at the top, centered, softly glowing, occupying about 45% of the width. Steam gently surrounds it. Keep the bottom 20% of the frame calm and darker, reserved for a "Commencer" button. Final hero frame.`

---

## C. NOTES IMPORTANTES

1. Le logo : un générateur d'images déforme souvent un logo. Les frames B7 et B8 servent surtout à l'ambiance. Pour un logo parfait, je recommande de le superposer dans l'app (apparition en fondu au-dessus de B8), plutôt que de dépendre du rendu de l'IA.
2. Pour B1 à B8, garde le même cadrage. Si une frame change de décor, relance-la en partant de la précédente.
3. Animation : Claude ne génère pas de vidéo. Deux voies sont possibles : (a) je construis l'enchaînement dans l'app (fondus entre frames + vapeur animée avec Reanimated), léger et net ; (b) un modèle vidéo avec première et dernière image (B1 → B8) produit un clip, que l'app joue en boucle. Dans les deux cas j'ai besoin des 8 images exportées.
4. Les textes affichés dans les maquettes ne sont que des exemples ; les vraies données restent celles de l'app (rituels, prix, horaires mardi–samedi 10h30–18h30). Les rituels 2 et 3 de A3 sont des substituts à remplacer.
5. Les maquettes d'IA servent de direction artistique. Ensuite, je les adapte à l'app existante, écran par écran, sans casser ce qui marche.
