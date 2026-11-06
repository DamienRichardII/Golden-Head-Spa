import { Image } from 'expo-image';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { Ritual } from '@ghs/types';
import { colors, fonts, radii, shadow, space } from '@ghs/ui';
import { IMAGES } from '../data/images';
import { formatDuration, formatPrice } from '../data/rituals';

const label = (r: Ritual) => `${r.name}, ${formatDuration(r.durationMin)}, ${formatPrice(r.priceEur)}`;

/** Ligne de la liste « Nos rituels » : photo, nom, accroche, durée, prix. `featured` = filet doré lumineux. */
export function RitualCard({ ritual, featured }: { ritual: Ritual; featured?: boolean }) {
  return (
    <Link href={{ pathname: '/rituals/[id]', params: { id: ritual.id } }} asChild>
      <Pressable accessibilityRole="button" accessibilityLabel={label(ritual)} style={featured ? { ...s.row, ...shadow.glow, borderColor: colors.champagne } : s.row}>
        <Image source={IMAGES.hero} contentFit="cover" contentPosition="center" style={s.img} />
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{ritual.name}</Text>
          {ritual.tagline ? <Text style={s.tag} numberOfLines={2}>{ritual.tagline}</Text> : null}
          <View style={s.meta}>
            <Ionicons name="time-outline" size={14} color={colors.muted} />
            <Text style={s.metaText}>{formatDuration(ritual.durationMin)}</Text>
          </View>
          <Text style={s.price}>{formatPrice(ritual.priceEur)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.champagneDark} />
      </Pressable>
    </Link>
  );
}

/** Tuile du carrousel de l'accueil : photo plein cadre, dégradé, nom + durée + prix. */
export function RitualTile({ ritual }: { ritual: Ritual }) {
  return (
    <Link href={{ pathname: '/rituals/[id]', params: { id: ritual.id } }} asChild>
      <Pressable accessibilityRole="button" accessibilityLabel={label(ritual)} style={s.tile}>
        <Image source={IMAGES.hero} contentFit="cover" contentPosition="center" style={StyleSheet.absoluteFill} />
        <LinearGradient colors={['rgba(14,10,7,0)', 'rgba(14,10,7,0.92)']} style={StyleSheet.absoluteFill} />
        <View style={{ padding: space.sm + 2 }}>
          <Text style={s.tileName} numberOfLines={2}>{ritual.name}</Text>
          <Text style={s.tileMeta}>{formatDuration(ritual.durationMin)}  ·  {formatPrice(ritual.priceEur)}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.surface, borderRadius: radii.lg, padding: space.sm, marginBottom: space.sm + 2, borderWidth: 1, borderColor: colors.line },
  img: { width: 96, height: 104, borderRadius: radii.md },
  name: { fontFamily: fonts.serifSemi, fontSize: 21, color: colors.brown },
  tag: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 17, color: colors.muted, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  metaText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.muted },
  price: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.champagneDark, marginTop: 2 },
  tile: { width: 168, height: 190, borderRadius: radii.lg, overflow: 'hidden', justifyContent: 'flex-end', borderWidth: 1, borderColor: colors.line, backgroundColor: colors.black },
  tileName: { fontFamily: fonts.serifSemi, fontSize: 20, color: colors.brown },
  tileMeta: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.champagneDark, marginTop: 2 },
});
