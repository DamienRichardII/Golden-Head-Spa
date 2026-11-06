import { ReactNode } from 'react';
import { Pressable, Text, View, ViewStyle, StyleSheet, ScrollView, TextInput, TextInputProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radii, shadow, space } from '@ghs/ui';

/** Fond commun : noir chaud avec halo doré discret en haut (ambiance des maquettes). */
export function Screen({ children, bottomInset = 0 }: { children: ReactNode; dark?: boolean; bottomInset?: number }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.ivory }}>
      <LinearGradient pointerEvents="none" colors={['rgba(212,175,106,0.14)', 'rgba(212,175,106,0)']} style={s.glowTop} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + space.md, paddingHorizontal: space.md, paddingBottom: space.xxl + bottomInset }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function Title({ children, style }: { children: ReactNode; style?: object }) {
  return <Text accessibilityRole="header" style={[s.title, style]}>{children}</Text>;
}
export function Body({ children, muted, style }: { children: ReactNode; muted?: boolean; style?: object }) {
  return <Text style={[s.body, muted && { color: colors.muted }, style]}>{children}</Text>;
}

/** En-tête d'écran : retour (optionnel) + titre serif + sous-titre. */
export function ScreenHeader({ title, subtitle, back = true, right }: { title: string; subtitle?: string; back?: boolean; right?: ReactNode }) {
  const router = useRouter();
  return (
    <View style={{ marginBottom: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        {back && (
          <Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={() => router.back()} hitSlop={12} style={s.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.brown} />
          </Pressable>
        )}
        {title ? <Title style={{ flex: 1 }}>{title}</Title> : <View style={{ flex: 1 }} />}
        {right}
      </View>
      {subtitle ? <Body muted style={{ marginTop: 4 }}>{subtitle}</Body> : null}
    </View>
  );
}

export function IconButton({ name, label, onPress, color = colors.brown }: { name: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; color?: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={8} style={s.iconBtn}>
      <Ionicons name={name} size={20} color={color} />
    </Pressable>
  );
}

export function Chip({ label, active, onPress, small }: { label: string; active?: boolean; onPress?: () => void; small?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!active }} onPress={onPress}
      style={[s.chip, small && { paddingVertical: 6 }, active ? { backgroundColor: colors.champagne, borderColor: colors.champagne } : null]}>
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: small ? 12 : 13, color: active ? colors.onGold : colors.brown }}>{label}</Text>
    </Pressable>
  );
}

export function SectionTitle({ children, action, onAction }: { children: ReactNode; action?: string; onAction?: () => void }) {
  return (
    <View style={s.sectionHead}>
      <Text accessibilityRole="header" style={s.section}>{children}</Text>
      {action ? <Pressable accessibilityRole="link" onPress={onAction} hitSlop={8}><Text style={s.sectionLink}>{action}  ›</Text></Pressable> : null}
    </View>
  );
}

export function Button({ label, onPress, variant = 'gold', disabled, style }: {
  label: string; onPress?: () => void; variant?: 'gold' | 'ghost'; disabled?: boolean; style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); onPress?.(); }}
      style={({ pressed }) => [
        s.btn,
        variant === 'gold' ? [{ backgroundColor: colors.champagne }, shadow.glow] : { borderWidth: 1, borderColor: colors.champagne },
        disabled && { opacity: 0.45 },
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      <Text style={[s.btnText, variant === 'ghost' && { color: colors.brown }]}>{label}</Text>
    </Pressable>
  );
}

/** Carte « verre » : surface sombre translucide, filet doré. */
export function Card({ children, style, glow }: { children: ReactNode; style?: ViewStyle; glow?: boolean }) {
  return <View style={[s.card, glow && shadow.glow, glow && { borderColor: colors.champagne }, style]}>{children}</View>;
}

export function Reveal({ children, index = 0 }: { children: ReactNode; index?: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(350).reduceMotion(ReduceMotion.System)}>
      {children}
    </Animated.View>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <View style={s.notice} accessibilityRole="alert">
      <Text style={s.noticeText}>{children}</Text>
    </View>
  );
}

export function Field(props: TextInputProps & { label: string; error?: string }) {
  const { label, error, ...rest } = props;
  return (
    <View style={{ marginBottom: space.md }}>
      <Text style={s.label}>{label}</Text>
      <TextInput accessibilityLabel={label} placeholderTextColor={colors.muted} style={[s.input, error && { borderColor: colors.danger }]} {...rest} />
      {error ? <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
    </View>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: space.xxl }}>
      <Text style={[s.title, { fontSize: 22, textAlign: 'center' }]}>{title}</Text>
      <Text style={[s.body, { color: colors.muted, textAlign: 'center', marginTop: space.sm }]}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  glowTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 280 },
  title: { fontFamily: fonts.serifSemi, fontSize: 32, color: colors.brown, letterSpacing: 0.5 },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.brown },
  btn: { minHeight: 52, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg },
  btnText: { fontFamily: fonts.sansSemi, color: colors.onGold, fontSize: 16 },
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: space.md, borderWidth: 1, borderColor: colors.line },
  notice: { backgroundColor: colors.beige, borderRadius: radii.md, padding: space.md, marginVertical: space.md, borderWidth: 1, borderColor: colors.line },
  noticeText: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.brown },
  label: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.brown, marginBottom: 6 },
  input: { minHeight: 48, borderRadius: radii.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: space.md, fontFamily: fonts.sans, fontSize: 15, color: colors.brown },
  iconBtn: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: 'rgba(34,25,17,0.6)', alignItems: 'center', justifyContent: 'center' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: 'rgba(34,25,17,0.6)' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: space.sm, marginTop: space.md },
  section: { fontFamily: fonts.serifSemi, fontSize: 24, color: colors.brown },
  sectionLink: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.champagneDark },
});
