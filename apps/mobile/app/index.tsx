import { useEffect, useState } from 'react';
import { ImageBackground, Text, View, StyleSheet } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BUSINESS } from '@ghs/config';
import { colors, fonts, space } from '@ghs/ui';
import { Button } from '../src/components/ui';
import { IMAGES } from '../src/data/images';
import { getFlag, setFlag } from '../src/lib/storage';

const ONBOARDED = 'ghs_onboarded';

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<'loading' | 'seen' | 'new'>('loading');
  useEffect(() => { getFlag(ONBOARDED).then((v) => setState(v ? 'seen' : 'new')); }, []);

  if (state === 'loading') return <View style={{ flex: 1, backgroundColor: colors.black }} />;
  if (state === 'seen') return <Redirect href="/(tabs)" />;

  return (
    <ImageBackground source={IMAGES.hero} resizeMode="cover" style={{ flex: 1, backgroundColor: colors.black }}>
      <LinearGradient colors={['rgba(23,20,17,0.55)', 'rgba(23,20,17,0.15)', 'rgba(23,20,17,0.9)']} style={StyleSheet.absoluteFill} />
      <View style={[s.wrap, { paddingTop: insets.top + space.xxl, paddingBottom: insets.bottom + space.lg }]}>
        <View>
          <Text style={s.logo}>GOLDEN</Text>
          <Text style={s.logoSub}>HEAD SPA</Text>
          <Text style={s.tagline}>{BUSINESS.tagline}</Text>
        </View>
        <View>
          <Text style={s.values}>Détente  ·  Beauté  ·  Raffinement</Text>
          <Button label="Commencer" onPress={async () => { await setFlag(ONBOARDED); router.replace('/(tabs)'); }} />
        </View>
      </View>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'space-between', paddingHorizontal: space.lg },
  logo: { fontFamily: fonts.serif, fontSize: 44, color: colors.champagne, letterSpacing: 4 },
  logoSub: { fontFamily: fonts.serif, fontSize: 24, color: colors.champagne, letterSpacing: 3 },
  tagline: { fontFamily: fonts.serif, fontSize: 26, color: '#F3E9D6', marginTop: space.lg, lineHeight: 32 },
  values: { fontFamily: fonts.sans, color: '#F3E9D6', textAlign: 'center', marginBottom: space.lg, fontSize: 13, letterSpacing: 1 },
});
