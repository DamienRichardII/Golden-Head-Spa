/**
 * Design tokens centralisés — thème sombre et doré des maquettes (06/11/2026).
 * Les noms historiques sont conservés pour ne rien casser : `ivory` = fond d'écran, `brown` = texte principal (crème),
 * `beige` = surfaces secondaires (puces, encarts), `champagne` = or, `champagneDark` = or clair pour texte/icônes.
 */
export const colors = {
  black: '#0E0A07',
  ivory: '#120D09',
  champagne: '#D4AF6A',
  champagneDark: '#E2BF7E',
  beige: '#261B12',
  brown: '#F3E9D6',
  white: '#FFFFFF',
  muted: '#B8A98F',
  line: 'rgba(212,175,106,0.28)',
  danger: '#E0715E',
  surface: 'rgba(34,25,17,0.92)',
  onGold: '#2A1D0E',
} as const;

export const fonts = {
  serif: 'CormorantGaramond_500Medium',
  serifSemi: 'CormorantGaramond_600SemiBold',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemi: 'Inter_600SemiBold',
} as const;

export const radii = { sm: 10, md: 16, lg: 22, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const shadow = {
  card: { shadowColor: '#000000', shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  glow: { shadowColor: '#D4AF6A', shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
} as const;
