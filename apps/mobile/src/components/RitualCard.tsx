import { Image } from 'expo-image';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Ritual } from '@ghs/types';
import { colors, fonts, radii, space } from '@ghs/ui';
import { IMAGES } from '../data/images';
import { formatDuration, formatPrice } from '../data/rituals';

export function RitualCard({ ritual }: { ritual: Ritual }) {
  return (
    <Link href={{ pathname: '/rituals/[id]', params: { id: ritual.id } }} asChild>
      <Pressable accessibilityRole="button" accessibilityLabel={`${ritual.name}, ${formatDuration(ritual.durationMin)}, ${formatPrice(ritual.priceEur)}`} style={s.row}>
        <Image source={IMAGES.hero} contentFit="cover" contentPosition="center" style={s.img} />
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{ritual.name}</Text>
          <Text style={s.meta}>{formatDuration(ritual.durationMin)} · {formatPrice(ritual.priceEur)}</Text>
          {ritual.tagline ? <Text style={s.tag}>{ritual.tagline}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>
    </Link>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.white, borderRadius: radii.lg, padding: space.sm, marginBottom: space.sm },
  img: { width: 72, height: 72, borderRadius: radii.md },
  name: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.black },
  meta: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.brown, marginTop: 2 },
  tag: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted, marginTop: 2 },
});
