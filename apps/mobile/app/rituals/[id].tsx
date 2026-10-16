import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii, space } from '@ghs/ui';
import { Body, Button, EmptyState, Screen, Title } from '../../src/components/ui';
import { IMAGES } from '../../src/data/images';
import { formatDuration, formatPrice, getRitual } from '../../src/data/rituals';

export default function RitualDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const ritual = id ? getRitual(id) : undefined;
  if (!ritual) return <Screen><EmptyState title="Rituel introuvable" text="Ce soin n'existe plus ou a été déplacé." /></Screen>;
  return (
    <Screen>
      <Pressable accessibilityLabel="Retour" onPress={() => router.back()} hitSlop={12} style={{ marginBottom: space.md }}>
        <Ionicons name="chevron-back" size={24} color={colors.brown} />
      </Pressable>
      <Image source={IMAGES.hero} contentFit="cover" contentPosition="center" style={s.img} />
      <Title style={{ marginTop: space.md }}>{ritual.name}</Title>
      <Text style={s.meta}>{formatDuration(ritual.durationMin)} · {formatPrice(ritual.priceEur)}</Text>
      {ritual.tagline ? <Body muted style={{ marginTop: space.sm }}>{ritual.tagline}</Body> : null}
      <Body style={{ marginTop: space.md }}>
        {ritual.description ?? 'La description détaillée de ce rituel sera fournie par Golden Head Spa.'}
      </Body>
      <View style={{ gap: space.sm, marginTop: space.lg }}>
        <Button label="Réserver" onPress={() => router.push({ pathname: '/(tabs)/booking', params: { ritual: ritual.id } })} />
        <Button label="Offrir" variant="ghost" onPress={() => router.push({ pathname: '/gift-card', params: { ritual: ritual.id } })} />
      </View>
    </Screen>
  );
}
const s = StyleSheet.create({
  img: { height: 240, borderRadius: radii.lg, backgroundColor: colors.black },
  meta: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.champagneDark, marginTop: 4 },
});
