import { useEffect } from 'react';
import { Text, View, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, FadeIn, ReduceMotion, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, space } from '@ghs/ui';
import { Button } from '../src/components/ui';
import { IMAGES } from '../src/data/images';
import { hasAmbient, startAmbient } from '../src/lib/ambient';

/**
 * Entrée immersive, affichée à chaque ouverture : photo plein écran en lente respiration, textes en fondu,
 * musique de détente lancée au toucher (les navigateurs bloquent l'autoplay). Même mise en page qu'avant.
 */
export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const reduce = useReducedMotion();
  const scale = useSharedValue(1);
  useEffect(() => {
    if (!reduce) scale.value = withRepeat(withTiming(1.1, { duration: 18000, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [reduce, scale]);
  const zoom = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const rm = ReduceMotion.System;

  return (
    <View style={{ flex: 1, backgroundColor: colors.black, overflow: 'hidden' }}>
      <Animated.Image source={IMAGES.onboarding} resizeMode="cover" style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }, zoom]} />
      <LinearGradient colors={['rgba(23,20,17,0.55)', 'rgba(23,20,17,0.15)', 'rgba(23,20,17,0.9)']} style={StyleSheet.absoluteFill} />
      <View style={[s.wrap, { paddingTop: insets.top + space.xxl, paddingBottom: insets.bottom + space.lg }]}>
        <View style={[s.center, { paddingTop: height * 0.08 }]}>
          <Animated.Text entering={FadeIn.duration(1600).reduceMotion(rm)} style={s.logo}>GOLDEN</Animated.Text>
          <Animated.Text entering={FadeIn.delay(500).duration(1600).reduceMotion(rm)} style={s.logoSub}>HEAD SPA</Animated.Text>
        </View>
        <Animated.View entering={FadeIn.delay(1500).duration(1400).reduceMotion(rm)}>
          <Text style={s.values}>Détente  ·  Beauté  ·  Raffinement</Text>
          <Button label="Commencer" onPress={() => { void startAmbient(); router.replace('/(tabs)'); }} />
          {hasAmbient && <Text style={s.hint}>Une musique de détente accompagne votre visite</Text>}
        </Animated.View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  wrap: { flex: 1, justifyContent: 'space-between', paddingHorizontal: space.lg },
  logo: { fontFamily: fonts.serif, fontSize: 44, color: colors.champagne, letterSpacing: 4 },
  logoSub: { fontFamily: fonts.serif, fontSize: 24, color: colors.champagne, letterSpacing: 3 },
  values: { fontFamily: fonts.sans, color: '#F3E9D6', textAlign: 'center', marginBottom: space.lg, fontSize: 13, letterSpacing: 1 },
  hint: { fontFamily: fonts.sans, color: '#D9CDB8', textAlign: 'center', fontSize: 12, marginTop: space.md },
});
