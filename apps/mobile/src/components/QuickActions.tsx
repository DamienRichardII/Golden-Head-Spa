import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii, shadow, space } from '@ghs/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Hauteur de la barre d'onglets (hors zone de sécurité) : doit rester identique dans app/(tabs)/_layout.tsx. */
export const TAB_BAR_HEIGHT = 66;
/** Place à réserver en bas des écrans pour que le contenu ne passe pas sous la barre flottante. */
export const QUICK_ACTIONS_SPACE = 76;

/** Écrans où la barre est masquée : entrée, menu, et écrans qui proposent déjà ces actions ou un champ de saisie fixe. */
const HIDDEN = new Set(['index', 'menu', 'booking', 'gift-card', 'assistant', 'admin']);

/**
 * Barre flottante « Offrir / Réserver », visible à tout moment dans l'application (demande de la cheffe de projet).
 * L'accueil (onglets) se déclare par le segment « (tabs) » ; l'écran d'entrée par le segment « index ».
 */
export function QuickActions() {
  const router = useRouter();
  const segments = useSegments() as string[];
  const insets = useSafeAreaInsets();
  const first = segments[0] ?? 'index';
  const last = segments[segments.length - 1] ?? '';
  if (HIDDEN.has(first) || HIDDEN.has(last)) return null;
  const inTabs = first === '(tabs)';
  const bottom = (inTabs ? TAB_BAR_HEIGHT : 0) + insets.bottom + space.sm;
  return (
    <View pointerEvents="box-none" style={[s.wrap, { bottom }]}>
      <View style={[s.bar, shadow.glow]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Offrir une carte cadeau" onPress={() => router.push('/gift-card')} style={[s.btn, s.ghost]}>
          <Ionicons name="gift-outline" size={18} color={colors.champagne} />
          <Text style={s.ghostText}>Offrir</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Réserver un rendez-vous" onPress={() => router.push('/(tabs)/booking')} style={[s.btn, s.gold]}>
          <Ionicons name="calendar-outline" size={18} color={colors.onGold} />
          <Text style={s.goldText}>Réserver</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: { flexDirection: 'row', gap: space.sm, padding: 6, borderRadius: radii.pill, backgroundColor: 'rgba(18,13,9,0.94)', borderWidth: 1, borderColor: colors.line },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44, paddingHorizontal: space.lg, borderRadius: radii.pill },
  ghost: { borderWidth: 1, borderColor: colors.champagne },
  gold: { backgroundColor: colors.champagne },
  ghostText: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.champagne },
  goldText: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.onGold },
});
