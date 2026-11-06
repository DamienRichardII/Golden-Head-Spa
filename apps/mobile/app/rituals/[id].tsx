import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii, space } from '@ghs/ui';
import { Body, Button, EmptyState, Screen, ScreenHeader, Title } from '../../src/components/ui';
import { IMAGES } from '../../src/data/images';
import { formatDuration, formatPrice, getRitual } from '../../src/data/rituals';

export default function RitualDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const ritual = id ? getRitual(id) : undefined;
  if (!ritual) return <Screen><ScreenHeader title="Rituel introuvable" /><EmptyState title="Rituel introuvable" text="Ce soin n'existe plus ou a été déplacé." /></Screen>;
  return (
    <Screen>
      <ScreenHeader title="" />
      <View style={s.imgWrap}>
        <Image source={IMAGES.hero} contentFit="cover" contentPosition="center" style={StyleSheet.absoluteFill} />
        <LinearGradient colors={['rgba(14,10,7,0)', 'rgba(14,10,7,0.85)']} style={StyleSheet.absoluteFill} />
      </View>
      <Title style={{ marginTop: space.md }}>{ritual.name}</Title>
      <View style={s.metaRow}>
        <Ionicons name="time-outline" size={16} color={colors.champagneDark} />
        <Text style={s.meta}>{formatDuration(ritual.durationMin)}  ·  {formatPrice(ritual.priceEur)}</Text>
      </View>
      {ritual.tagline ? <Body muted style={{ marginTop: space.sm }}>{ritual.tagline}</Body> : null}
      <Body style={{ marginTop: space.md }}>
        {ritual.description ?? 'La description détaillée de ce rituel sera fournie par Golden Head Spa.'}
      </Body>
      <View style={{ gap: space.sm, marginTop: space.lg }}>
        <Button label="Réserver ce rituel" onPress={() => router.push({ pathname: '/(tabs)/booking', params: { ritual: ritual.id } })} />
        <Button label="Offrir" variant="ghost" onPress={() => router.push({ pathname: '/gift-card', params: { ritual: ritual.id } })} />
      </View>
    </Screen>
  );
}
const s = StyleSheet.create({
  imgWrap: { height: 260, borderRadius: radii.lg, overflow: 'hidden', backgroundColor: colors.black, borderWidth: 1, borderColor: colors.line },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  meta: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.champagneDark },
});
