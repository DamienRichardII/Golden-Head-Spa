import { ReactNode } from 'react';
import { Pressable, Text, View, ViewStyle, StyleSheet, ScrollView, TextInput, TextInputProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radii, shadow, space } from '@ghs/ui';

export function Screen({ children, dark }: { children: ReactNode; dark?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: dark ? colors.black : colors.ivory }}
      contentContainerStyle={{ paddingTop: insets.top + space.md, paddingHorizontal: space.md, paddingBottom: space.xxl }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function Title({ children, style }: { children: ReactNode; style?: object }) {
  return <Text accessibilityRole="header" style={[s.title, style]}>{children}</Text>;
}
export function Body({ children, muted, style }: { children: ReactNode; muted?: boolean; style?: object }) {
  return <Text style={[s.body, muted && { color: colors.muted }, style]}>{children}</Text>;
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
        variant === 'gold' ? { backgroundColor: colors.champagne } : { borderWidth: 1, borderColor: colors.champagne },
        disabled && { opacity: 0.45 },
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      <Text style={[s.btnText, variant === 'ghost' && { color: colors.brown }]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, shadow.card, style]}>{children}</View>;
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
  title: { fontFamily: fonts.serifSemi, fontSize: 30, color: colors.brown, letterSpacing: 0.5 },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.brown },
  btn: { minHeight: 52, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg },
  btnText: { fontFamily: fonts.sansSemi, color: colors.white, fontSize: 16 },
  card: { backgroundColor: colors.white, borderRadius: radii.lg, padding: space.md },
  notice: { backgroundColor: colors.beige, borderRadius: radii.md, padding: space.md, marginVertical: space.md },
  noticeText: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.brown },
  label: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.brown, marginBottom: 6 },
  input: { minHeight: 48, borderRadius: radii.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: space.md, fontFamily: fonts.sans, fontSize: 15, color: colors.black },
});
