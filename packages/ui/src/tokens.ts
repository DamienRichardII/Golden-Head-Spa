/** Design tokens centralisés. Palette indicative du brief, à affiner depuis la maquette. */
export const colors = {
  black: '#171411',
  ivory: '#FAF7F1',
  champagne: '#C5A46B',
  champagneDark: '#A8854B',
  beige: '#EDE5D9',
  brown: '#49372A',
  white: '#FFFFFF',
  muted: '#8A7F72',
  line: '#E8E0D3',
  danger: '#B3402E',
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
  card: { shadowColor: '#49372A', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
} as const;
